import React, { Component, cloneElement } from 'react'
import { merge } from 'lodash'

export class Modal extends Component {
  constructor() {
    super()
    this.orderList = {}
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
      const isCurrentIndex = index === rest.currentIndex && !rest.isSwitching
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
