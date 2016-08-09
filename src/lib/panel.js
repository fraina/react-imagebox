import React, { Component, cloneElement } from 'react';
import { findDOMNode } from 'react-dom';
import { get } from 'lodash';
import classNames from 'classnames';

export class Panel extends Component {
  size() {
    const node = findDOMNode(this.refs.content);
    const width = node.naturalWidth || node.offsetWidth;
    const height = node.naturalHeight || node.offsetHeight;
    return { width, height }
  }

  title() {
    return this.props.title;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isCurrentIndex && this.props.isCurrentIndex !== nextProps.isCurrentIndex) {
      this.props.handleImageLoaded()
    }
  }

  renderChildren() {
    const { children, show, haveInit } = this.props;
    if (children.type === 'img') {
      const isLazyLoad = get(children.props, 'data-src', false);
      var imgProps = {
        src: (isLazyLoad && show) || haveInit ? children.props['data-src'] : children.props['src'],
        ref: 'content'
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
