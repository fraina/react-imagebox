import React, { Component, cloneElement } from 'react';
import { get, merge } from 'lodash';
import classNames from 'classnames';

export class LightModal extends Component {
  constructor(props) {
    super(props);

    const defaultTitlebarConfig = {
      enable: true,
      closeButton: true,
      closeText: '✕',
      position: 'top',
      prevText: '﹤',
      nextText: '﹥',

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
      minHeight: false,
      minWidth: false,
      initWidth: 200,
      initHeight: 200
    }

    this._init = false;
    this._initIndex = 0;
    this._timeoutQueue = [];
    this._lightboxConfig = merge({}, defaultLightboxConfig, this.props.lightbox);

    const children = this.props.children.props.children;
    const childrenNodeList = children.length ? children : [ children ];
    const childrenWithProps = childrenNodeList.map((children, index) => {
      if (children.props['data-default']) { this._initIndex =  index}
      return cloneElement(children);
    });

    this.state = merge({}, defaultTitlebarConfig, this.props.titleBar, {
      callback: {},
      children: childrenWithProps,
      currentWidth: get(this._lightboxConfig, 'initWidth'),
      currentHeight: get(this._lightboxConfig, 'initHeight'),
      lightboxConfig: this._lightboxConfig
    });

    this.onClickPrev = this.onClickPrev.bind(this);
    this.onClickNext = this.onClickNext.bind(this);
    this.onClickContent = this.onClickContent.bind(this);
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  onKeyDown(e) {
    if ((this.props.show) && (e.keyCode === 27)) {
      this.props.closeLightbox();
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.show !== nextProps.show) {
      this.cleanUp();
      this._initIndex = get(nextProps, 'index', this._initIndex);

      const { fadeIn, fadeOut } = nextProps;
      if (nextProps.show) {
        const { onComplete } = this.props;
        this.onOpen();
        this.setState({
          transition: (fadeIn) ? `all ${get(nextProps, 'fadeInSpeed', 1000) / 1000}s ease-in-out` : 'none',
          callback: setTimeout(() => {
            onComplete && onComplete();
          }, get(nextProps, 'fadeInSpeed', 0) + 1)
        });
      } else {
        const { onCleanUp } = this.props;
        onCleanUp && onCleanUp();
        this.setState({
          transition: (fadeOut) ? `all ${get(nextProps, 'fadeOutSpeed', 1000) / 1000}s ease-in-out` : 'none',
          callback: setTimeout(() => {
            this.onClosed();
          }, get(nextProps, 'fadeOutSpeed', 0) + 1)
        })
      }
    }
  }

  onOpen() {
    this._init = true;
    this.cleanUp();
    const { onOpen } = this.props;
    const { currentWidth, currentHeight } = this.getCurrentSize(this._initIndex);
    onOpen && onOpen();

    const trasitionSpeed = this.state.lightboxConfig.speed || 0;
    this.setState({
      isSwitching: true,
      currentWidth: currentWidth,
      currentHeight: currentHeight,
      currentIndex: this._initIndex,
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
    this.setState({
      lightboxConfig: merge({}, this.state.lightboxConfig, { smoothResize: false }),
      currentWidth: this.state.lightboxConfig.initWidth,
      currentHeight: this.state.lightboxConfig.initHeight
    })
  }

  onClickPrev() {
    const { children, currentIndex } = this.state;
    const isFirstImage = currentIndex === 0;
    const newIndex = (isFirstImage) ? children.length - 1 : currentIndex - 1;
    this.onChangeIndex(newIndex);
  }

  onClickNext() {
    const { children, currentIndex } = this.state;
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

  getCurrentSize(index = this._initIndex) {
    const { maxHeight, maxWidth, compatible } = this.state.lightboxConfig;
    const currentChildren = this.refs[`order-${index}`].children[0];
    const imgWidth = currentChildren.naturalWidth || currentChildren.offsetWidth;
    const imgHeight = currentChildren.naturalHeight || currentChildren.offsetHeight;
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
    const { currentIndex, children, lightboxConfig: { clickSwitch, loop } } = this.state;
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
    const { className, closeText, prevText, nextText, closeButton, closeButtonClassName, currentIndex, children } = this.state;
    const { closeLightbox } = this.props;

    const isLastImage = children.length === currentIndex + 1;
    const isFirstImage = currentIndex === 0;

    const customTitle = currentIndex && children[currentIndex].props['data-title'];
    var text = customTitle ? customTitle : '';
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
      <div className={ classNames('image-lightbox-titleBar', titleBarClass) }>
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
        <span className="image-lightbox-title" dangerouslySetInnerHTML={{ __html: !this.state.isSwitching ? text : '<br />' }}></span>
        { closeButton &&
          <button
            onClick={closeLightbox}
            className={classNames('image-lightbox-btn--close', closeButtonClassName)}>
            { closeText }
          </button>
        }
      </div>
    )
  }

  handleImageLoaded() {
    if (!this._init) return;
    const { currentWidth, currentHeight } = this.getCurrentSize(this.state.currentIndex);
    this.setState({
      currentWidth: currentWidth,
      currentHeight: currentHeight
    })
  }

  renderChildren() {
    const { fadeMode, fadeSpeed } = this.state.lightboxConfig;
    const style = { 'transition': fadeMode ? `all ${fadeSpeed / 1000}s` : 'none' };
    return this.state.children.map((children, index) => {
      const isCurrentIndex = index === this.state.currentIndex && !this.state.isSwitching;
      if (children.props.children.type === 'img') {
        var imgProps = {
          src: !this._init ? null : children.props.children.props['data-src'] || children.props.children.props['src'],
          onLoad: index === this.state.currentIndex ? this.handleImageLoaded.bind(this) : null
        }
        return (
          <li key={index} ref={`order-${index}`}
            style={style}
            className={classNames({ 'is-active': isCurrentIndex && this.props.show })}>
            <img { ...imgProps } />
          </li>
        )
      } else {
        return cloneElement(children, {
          key: index,
          ref: `order-${index}`,
          style: style,
          className: isCurrentIndex ? 'is-active' : ''
        });
      }
    });
  }

  render() {
    const titleBar = this.state;
    const {
      overlayOpacity,
      show,
      closeLightbox,
      className
    } = this.props;

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
      <div className={ classNames('image-lightbox', { 'is-active': show }) }
        data-type="lightbox"
        data-title={ (titleBar.enable) ? titleBar.position : null }
        style={{ transition: this.state.transition }}>
        <div className={classNames('image-lightbox-wrapper', className)}>
          { titleBar.enable && this.renderTitleBar() }
          <div className="image-lightbox-content" ref="image-lightbox-content" style={contentStyle} onClick={this.onClickContent}>
            <span className="image-lightbox-loading" hidden={!this.state.isSwitching}></span>
            <ul>
              {this.renderChildren()}
            </ul>
          </div>
        </div>
        <div className="image-lightbox-overlay" style={{ opacity: overlayOpacity }} onClick={ closeLightbox } />
      </div>
    );
  }
}
