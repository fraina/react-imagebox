import React, { Component, cloneElement } from 'react'
import { merge } from 'lodash'

export class Modal extends Component {
  constructor(props) {
    super(props)
    this.orderList = {}
    this.state = {
      currentIndex: props.currentIndex
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.state.currentIndex !== nextProps.currentIndex) {
      setTimeout(() => {
        this.setState({ currentIndex: nextProps.currentIndex })
      }, nextProps.fadeMode ? nextProps.fadeSpeed : 0)
    }
  }

  componentWillMount() {
    this.props.setRef(this)
  }

  getPanel(index) {
    return this.orderList[`order${index}`]
  }

  renderChildren() {
    const { children, ...rest } = this.props
    return children.map((child, index) => {
      const isCurrentIndex = index === this.state.currentIndex
      const props = merge({}, rest, {
        key: index,
        setRef: (c) => this.orderList[`order${index}`] = c,
        isCurrentIndex
      })
      return cloneElement(child, props)
    })
  }

  render() {
    return <ul>{this.renderChildren()}</ul>
  }
}
