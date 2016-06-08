'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var lodash = require('lodash');
var classNames = _interopDefault(require('classnames'));

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var ImageModal = function (_Component) {
  inherits(ImageModal, _Component);

  function ImageModal(props) {
    classCallCheck(this, ImageModal);

    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(ImageModal).call(this, props));

    var defaultTitlebarConfig = {
      enable: true,
      closeButton: true,
      closeText: '✕',
      position: 'top',
      prevText: '﹤',
      nextText: '﹥',

      isSwitching: true
    };

    var defaultLightboxConfig = {
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
    };

    _this._init = false;
    _this._initIndex = 0;
    _this._timeoutQueue = [];
    _this._lightboxConfig = lodash.merge({}, defaultLightboxConfig, _this.props.lightbox);

    var children = _this.props.children.props.children;
    var childrenNodeList = children.length ? children : [children];
    var childrenWithProps = childrenNodeList.map(function (children, index) {
      if (children.props['data-default']) {
        _this._initIndex = index;
      }
      return React.cloneElement(children);
    });

    _this.state = lodash.merge({}, defaultTitlebarConfig, _this.props.titleBar, {
      callback: {},
      children: childrenWithProps,
      currentWidth: lodash.get(_this._lightboxConfig, 'initWidth'),
      currentHeight: lodash.get(_this._lightboxConfig, 'initHeight'),
      lightboxConfig: _this._lightboxConfig
    });

    _this.onClickPrev = _this.onClickPrev.bind(_this);
    _this.onClickNext = _this.onClickNext.bind(_this);
    _this.onClickContent = _this.onClickContent.bind(_this);
    _this.handleImageLoaded = _this.handleImageLoaded.bind(_this);
    return _this;
  }

  createClass(ImageModal, [{
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      if (this.props.show && e.keyCode === 27) {
        this.props.closeImagebox();
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      document.addEventListener('keydown', this.onKeyDown.bind(this));
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      document.removeEventListener('keydown', this.onKeyDown.bind(this));
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var _this2 = this;

      if (this.props.show !== nextProps.show) {
        this.cleanUp();
        this._initIndex = lodash.get(nextProps, 'index', this._initIndex);

        var fadeIn = nextProps.fadeIn;
        var fadeOut = nextProps.fadeOut;

        if (nextProps.show) {
          (function () {
            var onComplete = _this2.props.onComplete;

            _this2.onOpen();
            _this2.setState({
              transition: fadeIn ? 'all ' + lodash.get(nextProps, 'fadeInSpeed', 1000) / 1000 + 's ease-in-out' : 'none',
              callback: setTimeout(function () {
                onComplete && onComplete();
              }, lodash.get(nextProps, 'fadeInSpeed', 0) + 1)
            });
          })();
        } else {
          var onCleanUp = this.props.onCleanUp;

          onCleanUp && onCleanUp();
          this.setState({
            transition: fadeOut ? 'all ' + lodash.get(nextProps, 'fadeOutSpeed', 1000) / 1000 + 's ease-in-out' : 'none',
            callback: setTimeout(function () {
              _this2.onClosed();
            }, lodash.get(nextProps, 'fadeOutSpeed', 0) + 1)
          });
        }
      }
    }
  }, {
    key: 'onOpen',
    value: function onOpen() {
      var _this3 = this;

      this._init = true;
      this.cleanUp();
      var onOpen = this.props.onOpen;

      var _getCurrentSize = this.getCurrentSize(this._initIndex);

      var currentWidth = _getCurrentSize.currentWidth;
      var currentHeight = _getCurrentSize.currentHeight;

      onOpen && onOpen();

      var trasitionSpeed = this.state.lightboxConfig.speed || 0;
      this.setState({
        isSwitching: true,
        currentWidth: currentWidth,
        currentHeight: currentHeight,
        currentIndex: this._initIndex,
        lightboxConfig: lodash.merge({}, this.state.lightboxConfig, {
          smoothResize: this._lightboxConfig.smoothResize
        })
      });

      this._timeoutQueue.push(setTimeout(function () {
        _this3.setState({
          isSwitching: false
        });
      }, trasitionSpeed));

      window.onresize = function () {
        var _getCurrentSize2 = _this3.getCurrentSize(_this3.state.currentIndex);

        var currentWidth = _getCurrentSize2.currentWidth;
        var currentHeight = _getCurrentSize2.currentHeight;

        _this3.setState({
          currentWidth: currentWidth,
          currentHeight: currentHeight
        });
      };
    }
  }, {
    key: 'onClosed',
    value: function onClosed() {
      var onClosed = this.props.onClosed;

      onClosed && onClosed();
      this.setState({
        lightboxConfig: lodash.merge({}, this.state.lightboxConfig, { smoothResize: false }),
        currentWidth: this.state.lightboxConfig.initWidth,
        currentHeight: this.state.lightboxConfig.initHeight
      });
    }
  }, {
    key: 'onClickPrev',
    value: function onClickPrev() {
      var _state = this.state;
      var children = _state.children;
      var currentIndex = _state.currentIndex;

      var isFirstImage = currentIndex === 0;
      var newIndex = isFirstImage ? children.length - 1 : currentIndex - 1;
      this.onChangeIndex(newIndex);
    }
  }, {
    key: 'onClickNext',
    value: function onClickNext() {
      var _state2 = this.state;
      var children = _state2.children;
      var currentIndex = _state2.currentIndex;

      var isLastImage = children.length === currentIndex + 1;
      var newIndex = isLastImage ? 0 : currentIndex + 1;
      this.onChangeIndex(newIndex);
    }
  }, {
    key: 'onChangeIndex',
    value: function onChangeIndex(newIndex) {
      var _this4 = this;

      this.cleanUp();
      var _state$lightboxConfig = this.state.lightboxConfig;
      var speed = _state$lightboxConfig.speed;
      var fadeSpeed = _state$lightboxConfig.fadeSpeed;
      var fadeMode = _state$lightboxConfig.fadeMode;

      var _getCurrentSize3 = this.getCurrentSize(newIndex);

      var currentWidth = _getCurrentSize3.currentWidth;
      var currentHeight = _getCurrentSize3.currentHeight;

      this.state.isSwitching = true;
      this.newIndex = newIndex;
      this.state.currentIndex = newIndex;
      this.forceUpdate();

      this._timeoutQueue.push(setTimeout(function () {
        _this4.state.currentWidth = currentWidth || _this4.state.minWidth;
        _this4.state.currentHeight = currentHeight || _this4.state.minHeight;
        _this4.forceUpdate();
      }, fadeMode && fadeSpeed || 0));

      this._timeoutQueue.push(setTimeout(function () {
        _this4.setState({
          isSwitching: false
        });
      }, fadeMode ? (speed || 0) + (fadeSpeed || 0) : 0));
    }
  }, {
    key: 'getCurrentSize',
    value: function getCurrentSize() {
      var index = arguments.length <= 0 || arguments[0] === undefined ? this._initIndex : arguments[0];
      var _state$lightboxConfig2 = this.state.lightboxConfig;
      var maxHeight = _state$lightboxConfig2.maxHeight;
      var maxWidth = _state$lightboxConfig2.maxWidth;
      var compatible = _state$lightboxConfig2.compatible;

      var currentChildren = this.refs['order-' + index].children[0];
      var imgWidth = currentChildren.naturalWidth || currentChildren.offsetWidth;
      var imgHeight = currentChildren.naturalHeight || currentChildren.offsetHeight;
      var clientWidth = document.body.clientWidth - 18;
      var clientHeight = document.body.clientHeight - 68;

      var currentWidth, currentHeight, ratio;
      if (maxWidth && imgWidth > maxWidth && imgWidth > imgHeight) {
        ratio = (compatible && clientWidth < maxWidth ? clientWidth : maxWidth) / imgWidth;
        currentWidth = compatible && clientWidth < maxWidth ? clientWidth : maxWidth;
        currentHeight = imgHeight * ratio;
        if (maxHeight && maxHeight < currentHeight || compatible && currentHeight > clientHeight) {
          ratio = (compatible && clientHeight < currentHeight ? clientHeight : currentHeight) / imgHeight;
          currentWidth = imgWidth * ratio;
          currentHeight = compatible && clientHeight < maxHeight ? clientHeight : maxHeight;
        }
      } else if (maxHeight && imgHeight > maxHeight && imgHeight > imgWidth) {
        ratio = (compatible && clientHeight < maxHeight ? clientHeight : maxHeight) / imgHeight;
        currentHeight = compatible && clientHeight < maxHeight ? clientHeight : maxHeight;
        currentWidth = imgWidth * ratio;
        if (maxWidth && maxWidth < currentWidth || compatible && currentWidth > clientWidth) {
          ratio = (compatible && clientWidth < currentWidth ? clientWidth : currentWidth) / imgWidth;
          currentWidth = compatible && clientWidth < maxWidth ? clientWidth : maxWidth;
          currentHeight = imgHeight * ratio;
        }
      } else {
        currentWidth = imgWidth;
        currentHeight = imgHeight;
      }

      return { currentWidth: currentWidth, currentHeight: currentHeight };
    }
  }, {
    key: 'onClickContent',
    value: function onClickContent() {
      var _state3 = this.state;
      var currentIndex = _state3.currentIndex;
      var children = _state3.children;
      var _state3$lightboxConfi = _state3.lightboxConfig;
      var clickSwitch = _state3$lightboxConfi.clickSwitch;
      var loop = _state3$lightboxConfi.loop;

      var isLastImage = children.length === currentIndex + 1;
      if (!clickSwitch || !loop && isLastImage) return;
      this.onClickNext();
    }
  }, {
    key: 'cleanUp',
    value: function cleanUp() {
      clearTimeout(this.state.callback);
      this._timeoutQueue.forEach(function (timeout) {
        clearTimeout(timeout);
      });
    }
  }, {
    key: 'renderTitleBar',
    value: function renderTitleBar() {
      var _state4 = this.state;
      var className = _state4.className;
      var closeText = _state4.closeText;
      var prevText = _state4.prevText;
      var nextText = _state4.nextText;
      var closeButton = _state4.closeButton;
      var closeButtonClassName = _state4.closeButtonClassName;
      var currentIndex = _state4.currentIndex;
      var children = _state4.children;
      var closeImagebox = this.props.closeImagebox;


      var isLastImage = children.length === currentIndex + 1;
      var isFirstImage = currentIndex === 0;

      var customTitle = currentIndex && children[currentIndex].props['data-title'];
      var text = customTitle ? customTitle : '';
      if (currentIndex !== null && customTitle) {
        var links = customTitle.match(/\{\{([^}]+|\}[^}]+)*\}\}/g);
        if (links) {
          links.map(function (link) {
            var matches = link.match(/\{\{(.*)\}\}/)[1].split('|');
            var el = '<a href=' + matches[0] + ' target=' + (!matches[2] ? '_blank' : '_self') + '>' + matches[1] + '</a>';
            text = text.replace(link, el);
          });
        }
      }

      var titleBarClass = {};
      if (className) {
        titleBarClass[className] = titleBarClass;
      }

      return React__default.createElement(
        'div',
        { className: classNames('imagebox-titleBar', titleBarClass) },
        React__default.createElement(
          'div',
          { className: 'lightbox-btns' },
          React__default.createElement(
            'button',
            {
              onClick: this.onClickPrev,
              className: 'lightbox-btn lightbox-btn--prev',
              disabled: !this.state.lightboxConfig.loop && isFirstImage },
            prevText
          ),
          React__default.createElement(
            'div',
            { className: 'lightbox-imgIndex' },
            currentIndex + 1,
            ' / ',
            children.length
          ),
          React__default.createElement(
            'button',
            {
              onClick: this.onClickNext,
              className: 'lightbox-btn lightbox-btn--next',
              disabled: !this.state.lightboxConfig.loop && isLastImage },
            nextText
          )
        ),
        React__default.createElement('span', { className: 'imagebox-title', dangerouslySetInnerHTML: { __html: !this.state.isSwitching ? text : '<br />' } }),
        closeButton && React__default.createElement(
          'button',
          {
            onClick: closeImagebox,
            className: classNames('imagebox-btn--close', closeButtonClassName) },
          closeText
        )
      );
    }
  }, {
    key: 'handleImageLoaded',
    value: function handleImageLoaded() {
      if (!this._init) return;

      var _getCurrentSize4 = this.getCurrentSize(this.state.currentIndex);

      var currentWidth = _getCurrentSize4.currentWidth;
      var currentHeight = _getCurrentSize4.currentHeight;

      this.setState({
        currentWidth: currentWidth,
        currentHeight: currentHeight
      });
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _this5 = this;

      var _state$lightboxConfig3 = this.state.lightboxConfig;
      var fadeMode = _state$lightboxConfig3.fadeMode;
      var fadeSpeed = _state$lightboxConfig3.fadeSpeed;

      var style = { 'transition': fadeMode ? 'all ' + fadeSpeed / 1000 + 's' : 'none' };
      return this.state.children.map(function (children, index) {
        var isCurrentIndex = index === _this5.state.currentIndex && !_this5.state.isSwitching;
        if (children.props.children.type === 'img') {
          var imgProps = {
            src: !_this5._init ? null : children.props.children.props['data-src'] || children.props.children.props['src'],
            onLoad: index === _this5.state.currentIndex ? _this5.handleImageLoaded.bind(_this5) : null
          };
          return React__default.createElement(
            'li',
            { key: index, ref: 'order-' + index,
              style: style,
              className: classNames({ 'is-active': isCurrentIndex && _this5.props.show }) },
            React__default.createElement('img', imgProps)
          );
        } else {
          return React.cloneElement(children, {
            key: index,
            ref: 'order-' + index,
            style: style,
            className: isCurrentIndex ? 'is-active' : ''
          });
        }
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var titleBar = this.state;
      var _props = this.props;
      var overlayOpacity = _props.overlayOpacity;
      var show = _props.show;
      var closeImagebox = _props.closeImagebox;
      var className = _props.className;
      var _state5 = this.state;
      var currentWidth = _state5.currentWidth;
      var currentHeight = _state5.currentHeight;
      var _state5$lightboxConfi = _state5.lightboxConfig;
      var smoothResize = _state5$lightboxConfi.smoothResize;
      var speed = _state5$lightboxConfi.speed;
      var maxWidth = _state5$lightboxConfi.maxWidth;
      var maxHeight = _state5$lightboxConfi.maxHeight;
      var minWidth = _state5$lightboxConfi.minWidth;
      var minHeight = _state5$lightboxConfi.minHeight;


      var contentStyle = {
        width: currentWidth || minWidth || 0,
        height: currentHeight || minHeight || 0,
        minHeight: minHeight ? minHeight : null,
        minWidth: minWidth ? minWidth : null,
        maxHeight: maxHeight,
        maxWidth: maxWidth,
        transition: smoothResize ? 'all ' + speed / 1000 + 's ease-in-out' : 'none'
      };

      return React__default.createElement(
        'div',
        { className: classNames('imagebox', { 'is-active': show }),
          'data-type': 'lightbox',
          'data-title': titleBar.enable ? titleBar.position : null,
          style: { transition: this.state.transition } },
        React__default.createElement(
          'div',
          { className: classNames('imagebox-wrapper', className) },
          titleBar.enable && this.renderTitleBar(),
          React__default.createElement(
            'div',
            { className: 'imagebox-content', ref: 'imagebox-content', style: contentStyle, onClick: this.onClickContent },
            React__default.createElement('span', { className: 'imagebox-loading', hidden: !this.state.isSwitching }),
            React__default.createElement(
              'ul',
              null,
              this.renderChildren()
            )
          )
        ),
        React__default.createElement('div', { className: 'imagebox-overlay', style: { opacity: overlayOpacity }, onClick: closeImagebox })
      );
    }
  }]);
  return ImageModal;
}(React.Component);

var ImageboxModal = ImageModal;

var Imagebox = function (_Component) {
  inherits(Imagebox, _Component);

  function Imagebox(props) {
    classCallCheck(this, Imagebox);

    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Imagebox).call(this, props));

    var defaultConfig = {
      overlayOpacity: 0.75,
      show: false,
      fadeIn: false,
      fadeInSpeed: 500,
      fadeOut: true,
      fadeOutSpeed: 500
    };

    _this.state = lodash.merge({}, defaultConfig, lodash.omit(_this.props, 'children'));
    return _this;
  }

  createClass(Imagebox, [{
    key: 'openImagebox',
    value: function openImagebox(params) {
      this.setState({ show: true, index: lodash.get(params, 'index') });
    }
  }, {
    key: 'closeImagebox',
    value: function closeImagebox() {
      this.setState({ show: false });
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _this2 = this;

      var children = this.props.children;

      var childrenSource = children.length > 1 ? children : new Array(children);
      return childrenSource.map(function (child, index) {
        var childProps = _extends({
          key: index,
          openImagebox: _this2.openImagebox.bind(_this2),
          closeImagebox: _this2.closeImagebox.bind(_this2)
        }, _this2.state);
        for (var j in _this2.state) {
          childProps[j] = _this2.state[j];
        }
        return React.cloneElement(child, childProps);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React__default.createElement(
        'div',
        null,
        this.renderChildren()
      );
    }
  }]);
  return Imagebox;
}(React.Component);

var ImageboxTrigger = function (_Component2) {
  inherits(ImageboxTrigger, _Component2);

  function ImageboxTrigger() {
    classCallCheck(this, ImageboxTrigger);
    return possibleConstructorReturn(this, Object.getPrototypeOf(ImageboxTrigger).apply(this, arguments));
  }

  createClass(ImageboxTrigger, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      var childProps = {};
      Object.keys(this.props).map(function (key) {
        if (key !== 'children' && key !== 'openImagebox' && key !== 'className') {
          childProps[key] = _this4.props[key];
        } else if (key === 'openImagebox') {
          childProps['onClick'] = _this4.props[key];
        }
      });
      return React.cloneElement(this.props.children, childProps);
    }
  }]);
  return ImageboxTrigger;
}(React.Component);

exports.ImageboxModal = ImageboxModal;
exports.Imagebox = Imagebox;
exports.ImageboxTrigger = ImageboxTrigger;