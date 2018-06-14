import React, { Component, cloneElement } from 'react'
import { get } from 'lodash'
import classNames from 'classnames'

export class Panel extends Component {
  constructor() {
    super()
    this.content = null
    this.state = {
      isVisible: false
    }
  }

  componentWillMount() {
    this.props.setRef(this)
  }

  size() {
    const { initWidth, initHeight } = this.props
    const node = this.content
    const width = node ? node.naturalWidth || node.offsetWidth : initWidth
    const height = node ? node.naturalHeight || node.offsetHeight : initHeight
    return { width, height }
  }

  title() {
    return this.props.title
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.currentIndex !== nextProps.currentIndex) {
      clearTimeout(this._timeout)
      this.setState({ isVisible: false })
    }

    if (this.props.isSwitching !== nextProps.isSwitching) {
      this._timeout = setTimeout(() => {
        this.setState({ isVisible: !nextProps.isSwitching })
        this.props.handleImageLoaded()
      }, nextProps.fadeMode ? nextProps.fadeSpeed : 0)
    }
  }

  renderChildren() {
    const { children } = this.props

    if (children.type === 'img') {
      var imgProps = {
        src: children.props.src || children.props['data-src'],
        ref: c => this.content = c
      }
      return (
        <img { ...imgProps } onLoad={(e) => this.props.handleImageLoaded()} />
      )
    }
    
    return (
      cloneElement(children, {
        ref: c => this.content = c
      })
    )
  }

  render() {
    const { isCurrentIndex, show, fadeMode, fadeSpeed } = this.props
    const style = { 
      transition: fadeMode ? `all ${fadeSpeed / 1000}s` : 'none',
      opacity: this.state.isVisible ? 1 : 0
    }
    return (
      <li
        style={style} 
        className={classNames({ 'is-active': isCurrentIndex && show })}
      >
        { (show && isCurrentIndex) && this.renderChildren() }
      </li>
    )
  }
}
