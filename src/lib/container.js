import React, { Component, cloneElement } from 'react';
import { get, merge, omit, clone } from 'lodash';
import classNames from 'classnames';
import Manager from './manager';

export class Container extends Component {
  constructor(props) {
    super(props);

    this._haveInit = false;
    this._timeoutQueue = [];


    this._defaultState = this.getConfig();
    this.state = this._defaultState;

    this.onClickPrev = this.onClickPrev.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.onClickContent = this.onClickContent.bind(this);
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.handleStoreChange = this.handleStoreChange.bind(this);

    this.closeImagebox = Manager.close.bind(Manager);
  }

  getConfig(params = this.props) {
    if (!params) return {}
    const defaultConfig = {
      overlayOpacity: 0.75,
      show: false,
      fadeIn: false,
      fadeInSpeed: 500,
      fadeOut: true,
      fadeOutSpeed: 500
    }

    const defaultTitlebarConfig = {
      enable: true,
      closeButton: true,
      closeText: '✕',
      position: 'top',
      prevText: '﹤',
      nextText: '﹥',
      currentIndex: 0,

      isSwitching: true
    };

    const defaultLightboxConfig = {
      speed: 500,
      smoothResize: true,
      fadeMode: true,
      fadeSpeed: 300,

      loop: true,
      clickSwitch: true,
      compatible: true,

      maxHeight: 800,
      maxWidth: 1000,
      minHeight: 0,
      minWidth: 0,
      initWidth: 200,
      initHeight: 200
    }

    const _config = merge({}, defaultConfig, omit(params, [ 'children', 'lightbox' ]))
    this._lightboxConfig = merge({}, defaultLightboxConfig, params.lightbox);
    return merge({}, _config, defaultTitlebarConfig, params.titleBar, {
      children: null,
      callback: {},
      currentWidth: get(this._lightboxConfig, 'initWidth'),
      currentHeight: get(this._lightboxConfig, 'initHeight'),
      lightboxConfig: this._lightboxConfig
    });
  }

  onKeyDown(e) {
    if ((this.state.show) && (e.keyCode === 27)) {
      this.closeImagebox();
    }
  }

  handleStoreChange(params) {
    const { children, index, show, config } = params;

    if (this.state.show !== show) {
      this.cleanUp();

      const { fadeIn, fadeOut, fadeInSpeed, fadeOutSpeed } = this.state;
      if (show) {
        const { onComplete } = this.props;
        this.setState(merge({}, this.getConfig(config), {
          children: children,
          show: true,
          transition: (fadeIn) ? `all ${(fadeInSpeed / 1000)}s ease-in-out` : 'none',
          callback: setTimeout(() => {
            onComplete && onComplete();
          }, fadeInSpeed + 1)
        }));
        setTimeout(() => {this.onOpen(index)}, 0)
      } else {
        const { onCleanUp } = this.props;
        onCleanUp && onCleanUp();
        this.setState({
          show: false,
          transition: (fadeOut) ? `all ${fadeOutSpeed / 1000}s ease-in-out` : 'none',
          callback: setTimeout(() => {
            this.onClosed();
          }, fadeOutSpeed + 1)
        })
      }
    }
  }

  componentWillMount() {
    Manager.addChangeListener(this.handleStoreChange);
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    Manager.removeChangeListener(this.handleStoreChange);
  }

  componentWillReceiveProps(nextProps) {
    this.state = merge({}, this.state, omit(nextProps, 'children'));
  }

  onOpen(index) {
    this._haveInit = true;
    this.cleanUp();
    const { onOpen } = this.props;
    onOpen && onOpen();

    const trasitionSpeed = this.state.lightboxConfig.speed || 0;
    const { currentWidth, currentHeight } = this.getCurrentSize(index);
    this.setState({
      isSwitching: true,
      currentIndex: index,
      currentWidth: currentWidth,
      currentHeight: currentHeight,
      lightboxConfig: merge({}, this.state.lightboxConfig, {
        smoothResize: this._lightboxConfig.smoothResize
      })
    });

    this._timeoutQueue.push(setTimeout(() => {
      this.setState({
        isSwitching: false
      });
    }, trasitionSpeed));

    window.onresize = () => {
      const { currentWidth, currentHeight } = this.getCurrentSize(this.state.currentIndex);
      this.setState({
        currentWidth: currentWidth,
        currentHeight: currentHeight
      })
    }
  }

  onClosed() {
    const { onClosed } = this.props;
    onClosed && onClosed();
    this.setState(merge({}, this._defaultState, {
      lightboxConfig: merge({}, this.state.lightboxConfig, { smoothResize: false })
    }))
  }

  onClickPrev() {
    const { currentIndex } = this.state;
    const children = get(this.state, 'children.props.children');
    const isFirstImage = currentIndex === 0;
    const newIndex = (isFirstImage) ? children.length - 1 : currentIndex - 1;
    this.onChangeIndex(newIndex);
  }

  onClickNext() {
    const { currentIndex } = this.state;
    const children = get(this.state, 'children.props.children');
    const isLastImage = children.length === currentIndex + 1;
    const newIndex = (isLastImage) ? 0 : currentIndex + 1;
    this.onChangeIndex(newIndex);
  }

  onChangeIndex(newIndex) {
    this.cleanUp();
    const { speed, fadeSpeed, fadeMode } = this.state.lightboxConfig;
    const { currentWidth, currentHeight } = this.getCurrentSize(newIndex);
    this.state.isSwitching = true;
    this.newIndex = newIndex;
    this.state.currentIndex = newIndex;
    this.forceUpdate();

    this._timeoutQueue.push(setTimeout(() => {
      this.state.currentWidth = currentWidth || this.state.minWidth;
      this.state.currentHeight = currentHeight || this.state.minHeight;
      this.forceUpdate();
    }, fadeMode && fadeSpeed || 0))

    this._timeoutQueue.push(setTimeout(() => {
      this.setState({
        isSwitching: false
      });
    }, fadeMode ? (speed || 0) + (fadeSpeed || 0) : 0));

  }

  getCurrentSize(index = this.state.currentIndex) {
    if (!this.refs.modal) return { currentWidth: this.state.lightboxConfig.initWidth, currentHeight: this.state.lightboxConfig.initHeight }

    const { maxHeight, maxWidth, compatible } = this.state.lightboxConfig;
    const currentChildren = this.refs.modal.getPanel(index);
    const { width: imgWidth, height: imgHeight } = currentChildren.size();
    const clientWidth = document.body.clientWidth - 18;
    const clientHeight = document.body.clientHeight - 68;

    var currentWidth, currentHeight, ratio;
    if (maxWidth && imgWidth > maxWidth && imgWidth > imgHeight) {
      ratio =  (compatible && clientWidth < maxWidth ? clientWidth : maxWidth) / imgWidth;
      currentWidth = (compatible && clientWidth < maxWidth) ? clientWidth : maxWidth;
      currentHeight = imgHeight * ratio;
      if ((maxHeight && maxHeight < currentHeight) || (compatible && currentHeight > clientHeight)) {
        ratio = (compatible && clientHeight < currentHeight ? clientHeight : currentHeight) / imgHeight;
        currentWidth = imgWidth * ratio;
        currentHeight = (compatible && clientHeight < maxHeight) ? clientHeight : maxHeight;
      }
    } else if (maxHeight && imgHeight > maxHeight && imgHeight > imgWidth) {
      ratio = (compatible && clientHeight < maxHeight ? clientHeight : maxHeight) / imgHeight;
      currentHeight = (compatible && clientHeight < maxHeight) ? clientHeight : maxHeight;
      currentWidth = imgWidth * ratio;
      if ((maxWidth && maxWidth < currentWidth) || (compatible && currentWidth > clientWidth)) {
        ratio = (compatible && clientWidth < currentWidth ? clientWidth : currentWidth) / imgWidth;
        currentWidth = (compatible && clientWidth < maxWidth) ? clientWidth : maxWidth;
        currentHeight = imgHeight * ratio;
      }
    } else {
      currentWidth = imgWidth;
      currentHeight = imgHeight;
    }

    return { currentWidth: currentWidth, currentHeight: currentHeight }
  }

  onClickContent() {
    const { currentIndex, lightboxConfig: { clickSwitch, loop } } = this.state;
    const children = get(this.state, 'children.props.children');
    const isLastImage = children.length === currentIndex + 1;
    if (!clickSwitch || (!loop && isLastImage)) return;
    this.onClickNext();
  }

  cleanUp() {
    clearTimeout(this.state.callback);
    this._timeoutQueue.forEach((timeout) => {
      clearTimeout(timeout);
    })
  }

  renderTitleBar() {
    const { className, closeText, prevText, nextText, closeButton, closeButtonClassName, currentIndex } = this.state;
    const children = get(this.state, 'children.props.children', []);

    const isLastImage = children.length === currentIndex + 1;
    const isFirstImage = currentIndex === 0;


    const customTitle = this.refs.modal && this.refs.modal.getPanel(currentIndex).title();
    var text = customTitle || '';
    if (currentIndex !== null && customTitle) {
      const links = customTitle.match(/\{\{([^}]+|\}[^}]+)*\}\}/g);
      if (links) {
        links.map((link) => {
          const matches = link.match(/\{\{(.*)\}\}/)[1].split('|');
          const el = `<a href=${matches[0]} target=${!matches[2] ? '_blank' : '_self'}>${matches[1]}</a>`;
          text = text.replace(link, el);
        })
      }
    }

    const titleBarClass = {};
    if (className) {
      titleBarClass[className] = titleBarClass;
    }

    return (
      <div className={ classNames('imagebox-titleBar', titleBarClass) }>
        <div className="lightbox-btns">
          <button
            onClick={this.onClickPrev}
            className="lightbox-btn lightbox-btn--prev"
            disabled={!this.state.lightboxConfig.loop && isFirstImage}>
            { prevText }
          </button>
          <div className="lightbox-imgIndex">{currentIndex + 1} / {children.length}</div>
          <button
            onClick={this.onClickNext}
            className="lightbox-btn lightbox-btn--next"
            disabled={!this.state.lightboxConfig.loop && isLastImage}>
            { nextText }
          </button>
        </div>
        <span className="imagebox-title" dangerouslySetInnerHTML={{ __html: !this.state.isSwitching ? text : '<br />' }}></span>
        { closeButton &&
          <button
            onClick={this.closeImagebox}
            className={classNames('imagebox-btn--close', closeButtonClassName)}>
            { closeText }
          </button>
        }
      </div>
    )
  }

  handleImageLoaded() {
    if (!this._haveInit) return;
    const { currentWidth, currentHeight } = this.getCurrentSize(this.state.currentIndex);
    this.setState({
      currentWidth: currentWidth,
      currentHeight: currentHeight
    })
  }

  renderChildren() {
    const { children } = this.state;
    if (children === null) return <div></div>

    const { fadeMode, fadeSpeed } = this.state.lightboxConfig;
    const childProps = {
      show: this.state.show,
      fadeMode,
      fadeSpeed,
      ref: 'modal',
      currentIndex: this.state.currentIndex,
      handleImageLoaded: this.handleImageLoaded,
      haveInit: this._haveInit,
      isSwitching: this.state.isSwitching
    }
    return cloneElement(children, childProps);
  }

  render() {
    const titleBar = this.state;
    const {
      overlayOpacity,
      show,
      className
    } = this.state;

    const {
      currentWidth,
      currentHeight,
      lightboxConfig: {
        smoothResize,
        speed,
        maxWidth,
        maxHeight,
        minWidth,
        minHeight
      }
    } = this.state;

    const contentStyle = {
      width: currentWidth || minWidth || 0,
      height: currentHeight || minHeight || 0,
      minHeight: minHeight ? minHeight : null,
      minWidth: minWidth ? minWidth : null,
      maxHeight: maxHeight,
      maxWidth: maxWidth,
      transition: smoothResize ? `all ${speed / 1000}s ease-in-out` : 'none'
    }

    return (
      <div className={ classNames('imagebox', { 'is-active': show }) }
        data-type="lightbox"
        data-title={ (titleBar.enable) ? titleBar.position : null }
        style={{ transition: this.state.transition }}>
        <div className={classNames('imagebox-wrapper', className)}>
          { titleBar.enable && this.renderTitleBar() }
          <div className="imagebox-content" ref="imagebox-content" style={contentStyle} onClick={this.onClickContent}>
            <span className="imagebox-loading" hidden={!this.state.isSwitching}></span>
            {this.renderChildren()}
          </div>
        </div>
        <div className="imagebox-overlay" style={{ opacity: overlayOpacity }} onClick={ this.closeImagebox } />
      </div>
    );
  }
}
