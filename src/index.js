import React, { Component, cloneElement } from 'react';
import { merge, omit, get } from 'lodash';

import { LightModal } from './lib/lightbox';

export const LightboxModal = LightModal;

export class Lightbox extends Component {
  constructor(props) {
    super(props);
    const defaultConfig = {
      overlayOpacity: 0.75,
      show: false,
      fadeIn: false,
      fadeInSpeed: 500,
      fadeOut: true,
      fadeOutSpeed: 500
    }

    this.state = merge({}, defaultConfig, omit(this.props, 'children'));
  }

  openLightbox(params) {
    this.setState({ show: true, index: get(params, 'index') });
  }

  closeLightbox() {
    this.setState({ show: false });
  }

  renderChildren() {
    const { children } = this.props;
    const childrenSource = (children.length > 1) ? children : new Array(children);
    return childrenSource.map((child, index) => {
      const childProps = {
        key: index,
        openLightbox: this.openLightbox.bind(this),
        closeLightbox: this.closeLightbox.bind(this),
        ...this.state
      }
      for (var j in this.state) {
        childProps[j] = this.state[j];
      }
      return cloneElement(child, childProps);
    })
  }

  render() {
    return (
        <div>
          { this.renderChildren() }
        </div>
    );
  }
}

export class LightboxTrigger extends Component {
  render() {
    const childProps = {};
    Object.keys(this.props).map((key) => {
      if (key !== 'children' && key !== 'openLightbox' && key !== 'className') {
        childProps[key] = this.props[key];
      } else if (key === 'openLightbox') {
        childProps['onClick'] = this.props[key];
      }
    })
    return cloneElement(this.props.children, childProps);
  }
}
