import React, { Component, cloneElement } from 'react'
import { get } from 'lodash'
import classNames from 'classnames'

export class Panel extends Component {
  constructor() {
    super()
    this.content = null
  }

  componentWillMount() {
    this.props.setRef(this)
  }

  size() {
    const node = this.content
    const width = node ? node.naturalWidth || node.offsetWidth : 0
    const height = node ? node.naturalHeight || node.offsetHeight : 0
    return { width, height }
  }

  title() {
    return this.props.title
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isCurrentIndex && this.props.isCurrentIndex !== nextProps.isCurrentIndex) {
      this.props.handleImageLoaded()
    }
  }

  renderChildren() {
    const { children, show, haveInit } = this.props
    if (children.type === 'img') {
      const isLazyLoad = get(children.props, 'data-src', false)
      var imgProps = {
        src: (isLazyLoad && show) || haveInit ? children.props['data-src'] : children.props['src'],
        ref: c => this.content = c
      }
      return (
        <img { ...imgProps } />
      )
    } else {
      return (
        cloneElement(children, {
          ref: c => this.content = c
        })
      );
    }
  }

  render() {
    const { isCurrentIndex, show, fadeMode, fadeSpeed } = this.props
    const style = { 'transition': fadeMode ? `all ${fadeSpeed / 1000}s` : 'none' }
    return (
      <li
        style={style}
        className={classNames({ 'is-active': isCurrentIndex && show })}>
        { this.renderChildren() }
      </li>
    )
  }
}
