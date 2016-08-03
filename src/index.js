import React, { Component, cloneElement } from 'react';
import { merge, omit, get } from 'lodash';

import { ImageModal } from './lib/imagebox';
import { Panel } from './lib/panel';

export const ImageboxModal = ImageModal;
export const ImageboxPanel = Panel;

export class Imagebox extends Component {
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

  componentWillReceiveProps(nextProps) {
    this.state = merge({}, this.state, omit(nextProps, 'children'));
  }

  openImagebox(params) {
    this.setState({ show: true, index: get(params, 'index') });
  }

  closeImagebox() {
    this.setState({ show: false });
  }

  renderChildren() {
    const { children } = this.props;
    const childrenSource = (children.length > 1) ? children : new Array(children);
    return childrenSource.map((child, index) => {
      const childProps = {
        key: index,
        openImagebox: this.openImagebox.bind(this),
        closeImagebox: this.closeImagebox.bind(this),
        ...this.state
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

export class ImageboxTrigger extends Component {
  render() {
    const { children, openImagebox } = this.props;
    const childProps = {};
    childProps['onClick'] = openImagebox;
    return cloneElement(children, childProps);
  }
}
