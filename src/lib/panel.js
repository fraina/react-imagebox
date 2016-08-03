import React, { Component, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';
import classNames from 'classnames';

export class Panel extends Component {
  getSize() {
    const node = findDOMNode(this.refs.content);
    const width = node.naturalWidth || node.offsetWidth;
    const height = node.naturalHeight || node.offsetHeight;
    return { width, height }
  }

  renderChildren() {
    const { isCurrentIndex, children } = this.props;
    if (children.type === 'img') {
      var imgProps = {
        src: children.props['data-src'] || children.props['src'],
        ref: 'content',
        onLoad: isCurrentIndex ? this.props.handleImageLoaded : null
      }
      return (
        <img { ...imgProps } />
      )
    } else {
      return (
        cloneElement(children, {
          ref: 'content'
        })
      );
    }
  }

  render() {
    const { isCurrentIndex, show, fadeMode, fadeSpeed } = this.props;
    const style = { 'transition': fadeMode ? `all ${fadeSpeed / 1000}s` : 'none' };
    return (
      <li
        style={style}
        className={classNames({ 'is-active': isCurrentIndex && show })}>
        { this.renderChildren() }
      </li>
    )
  }
}
