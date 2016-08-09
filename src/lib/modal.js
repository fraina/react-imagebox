import React, { Component, cloneElement } from 'react';
import { merge } from 'lodash';

export class Modal extends Component {
  getPanel(index) {
    return this.refs[`order-${index}`];
  }

  renderChildren() {
    const { children, ...rest } = this.props;
    return children.map((child, index) => {
      const isCurrentIndex = index === rest.currentIndex && !rest.isSwitching;
      const props = merge({}, rest, {
        key: index,
        ref: `order-${index}`,
        isCurrentIndex
      })
      return cloneElement(child, props);
    })
  }

  render() {
    return <ul>{this.renderChildren()}</ul>
  }
}
