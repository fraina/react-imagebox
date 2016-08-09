'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var lodash = require('lodash');
var classNames = _interopDefault(require('classnames'));
var events = require('events');
var reactDom = require('react-dom');

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

var objectWithoutProperties = function (obj, keys) {
  var target = {};

  for (var i in obj) {
    if (keys.indexOf(i) >= 0) continue;
    if (!Object.prototype.hasOwnProperty.call(obj, i)) continue;
    target[i] = obj[i];
  }

  return target;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Constants = {
  OPEN: 'open',
  CLOSE: 'close',
  CHANGE: 'change'
};

var Manager = function (_EventEmitter) {
  inherits(Manager, _EventEmitter);

  function Manager() {
    classCallCheck(this, Manager);

    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Manager).call(this));

    _this.content = null;
    _this.config = null;
    _this.index = 0;
    _this.show = false;
    return _this;
  }

  createClass(Manager, [{
    key: 'open',
    value: function open(params) {
      var content = params.content;
      var config = params.config;
      var index = params.index;

      this.content = content || null;
      this.config = config || {};
      this.index = index || 0;
      this.show = true;
      this.emitChange();
    }
  }, {
    key: 'close',
    value: function close() {
      this.show = false;
      this.emitChange();
    }
  }, {
    key: 'emitChange',
    value: function emitChange() {
      this.emit(Constants.CHANGE, {
        children: this.content,
        config: this.config,
        index: this.index,
        show: this.show
      });
    }
  }, {
    key: 'addChangeListener',
    value: function addChangeListener(callback) {
      this.addListener(Constants.CHANGE, callback);
    }
  }, {
    key: 'removeChangeListener',
    value: function removeChangeListener(callback) {
      this.removeListener(Constants.CHANGE, callback);
    }
  }]);
  return Manager;
}(events.EventEmitter);

var Manager$1 = new Manager();

var Container = function (_Component) {
  inherits(Container, _Component);

  function Container(props) {
    classCallCheck(this, Container);

    var _this = possibleConstructorReturn(this, Object.getPrototypeOf(Container).call(this, props));

    _this._haveInit = false;
    _this._timeoutQueue = [];

    _this._defaultState = _this.getConfig();
    _this.state = _this._defaultState;

    _this.onClickPrev = _this.onClickPrev.bind(_this);
    _this.onClickNext = _this.onClickNext.bind(_this);
    _this.onClickContent = _this.onClickContent.bind(_this);
    _this.handleImageLoaded = _this.handleImageLoaded.bind(_this);
    _this.handleStoreChange = _this.handleStoreChange.bind(_this);

    _this.closeImagebox = Manager$1.close.bind(Manager$1);
    return _this;
  }

  createClass(Container, [{
    key: 'getConfig',
    value: function getConfig() {
      var params = arguments.length <= 0 || arguments[0] === undefined ? this.props : arguments[0];

      if (!params) return {};
      var defaultConfig = {
        overlayOpacity: 0.75,
        show: false,
        fadeIn: false,
        fadeInSpeed: 500,
        fadeOut: true,
        fadeOutSpeed: 500
      };

      var defaultTitlebarConfig = {
        enable: true,
        closeButton: true,
        closeText: '✕',
        position: 'top',
        prevText: '﹤',
        nextText: '﹥',
        currentIndex: 0,

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
        minHeight: 0,
        minWidth: 0,
        initWidth: 200,
        initHeight: 200
      };

      var _config = lodash.merge({}, defaultConfig, lodash.omit(params, ['children', 'lightbox']));
      this._lightboxConfig = lodash.merge({}, defaultLightboxConfig, params.lightbox);
      return lodash.merge({}, _config, defaultTitlebarConfig, params.titleBar, {
        children: null,
        callback: {},
        currentWidth: lodash.get(this._lightboxConfig, 'initWidth'),
        currentHeight: lodash.get(this._lightboxConfig, 'initHeight'),
        lightboxConfig: this._lightboxConfig
      });
    }
  }, {
    key: 'onKeyDown',
    value: function onKeyDown(e) {
      if (this.state.show && e.keyCode === 27) {
        this.closeImagebox();
      }
    }
  }, {
    key: 'handleStoreChange',
    value: function handleStoreChange(params) {
      var _this2 = this;

      var children = params.children;
      var index = params.index;
      var show = params.show;
      var config = params.config;


      if (this.state.show !== show) {
        this.cleanUp();

        var _state = this.state;
        var fadeIn = _state.fadeIn;
        var fadeOut = _state.fadeOut;
        var fadeInSpeed = _state.fadeInSpeed;
        var fadeOutSpeed = _state.fadeOutSpeed;

        if (show) {
          (function () {
            var onComplete = _this2.props.onComplete;

            _this2.setState(lodash.merge({}, _this2.getConfig(config), {
              children: children,
              show: true,
              transition: fadeIn ? 'all ' + fadeInSpeed / 1000 + 's ease-in-out' : 'none',
              callback: setTimeout(function () {
                onComplete && onComplete();
              }, fadeInSpeed + 1)
            }));
            setTimeout(function () {
              _this2.onOpen(index);
            }, 0);
          })();
        } else {
          var onCleanUp = this.props.onCleanUp;

          onCleanUp && onCleanUp();
          this.setState({
            show: false,
            transition: fadeOut ? 'all ' + fadeOutSpeed / 1000 + 's ease-in-out' : 'none',
            callback: setTimeout(function () {
              _this2.onClosed();
            }, fadeOutSpeed + 1)
          });
        }
      }
    }
  }, {
    key: 'componentWillMount',
    value: function componentWillMount() {
      Manager$1.addChangeListener(this.handleStoreChange);
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
      Manager$1.removeChangeListener(this.handleStoreChange);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this.state = lodash.merge({}, this.state, lodash.omit(nextProps, 'children'));
    }
  }, {
    key: 'onOpen',
    value: function onOpen(index) {
      var _this3 = this;

      this._haveInit = true;
      this.cleanUp();
      var onOpen = this.props.onOpen;

      onOpen && onOpen();

      var trasitionSpeed = this.state.lightboxConfig.speed || 0;

      var _getCurrentSize = this.getCurrentSize(index);

      var currentWidth = _getCurrentSize.currentWidth;
      var currentHeight = _getCurrentSize.currentHeight;

      this.setState({
        isSwitching: true,
        currentIndex: index,
        currentWidth: currentWidth,
        currentHeight: currentHeight,
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
      this.setState(lodash.merge({}, this._defaultState, {
        lightboxConfig: lodash.merge({}, this.state.lightboxConfig, { smoothResize: false })
      }));
    }
  }, {
    key: 'onClickPrev',
    value: function onClickPrev() {
      var currentIndex = this.state.currentIndex;

      var children = lodash.get(this.state, 'children.props.children');
      var isFirstImage = currentIndex === 0;
      var newIndex = isFirstImage ? children.length - 1 : currentIndex - 1;
      this.onChangeIndex(newIndex);
    }
  }, {
    key: 'onClickNext',
    value: function onClickNext() {
      var currentIndex = this.state.currentIndex;

      var children = lodash.get(this.state, 'children.props.children');
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
      var index = arguments.length <= 0 || arguments[0] === undefined ? this.state.currentIndex : arguments[0];

      if (!this.refs.modal) return { currentWidth: this.state.lightboxConfig.initWidth, currentHeight: this.state.lightboxConfig.initHeight };

      var _state$lightboxConfig2 = this.state.lightboxConfig;
      var maxHeight = _state$lightboxConfig2.maxHeight;
      var maxWidth = _state$lightboxConfig2.maxWidth;
      var compatible = _state$lightboxConfig2.compatible;

      var currentChildren = this.refs.modal.getPanel(index);

      var _currentChildren$size = currentChildren.size();

      var imgWidth = _currentChildren$size.width;
      var imgHeight = _currentChildren$size.height;

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
      var _state2 = this.state;
      var currentIndex = _state2.currentIndex;
      var _state2$lightboxConfi = _state2.lightboxConfig;
      var clickSwitch = _state2$lightboxConfi.clickSwitch;
      var loop = _state2$lightboxConfi.loop;

      var children = lodash.get(this.state, 'children.props.children');
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
      var _state3 = this.state;
      var className = _state3.className;
      var closeText = _state3.closeText;
      var prevText = _state3.prevText;
      var nextText = _state3.nextText;
      var closeButton = _state3.closeButton;
      var closeButtonClassName = _state3.closeButtonClassName;
      var currentIndex = _state3.currentIndex;

      var children = lodash.get(this.state, 'children.props.children', []);

      var isLastImage = children.length === currentIndex + 1;
      var isFirstImage = currentIndex === 0;

      var customTitle = this.refs.modal && this.refs.modal.getPanel(currentIndex).title();
      var text = customTitle || '';
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
            onClick: this.closeImagebox,
            className: classNames('imagebox-btn--close', closeButtonClassName) },
          closeText
        )
      );
    }
  }, {
    key: 'handleImageLoaded',
    value: function handleImageLoaded() {
      if (!this._haveInit) return;

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
      var children = this.state.children;

      if (children === null) return React__default.createElement('div', null);

      var _state$lightboxConfig3 = this.state.lightboxConfig;
      var fadeMode = _state$lightboxConfig3.fadeMode;
      var fadeSpeed = _state$lightboxConfig3.fadeSpeed;

      var childProps = {
        show: this.state.show,
        fadeMode: fadeMode,
        fadeSpeed: fadeSpeed,
        ref: 'modal',
        currentIndex: this.state.currentIndex,
        handleImageLoaded: this.handleImageLoaded,
        haveInit: this._haveInit,
        isSwitching: this.state.isSwitching
      };
      return React.cloneElement(children, childProps);
    }
  }, {
    key: 'render',
    value: function render() {
      var titleBar = this.state;
      var _state4 = this.state;
      var overlayOpacity = _state4.overlayOpacity;
      var show = _state4.show;
      var className = _state4.className;
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
            this.renderChildren()
          )
        ),
        React__default.createElement('div', { className: 'imagebox-overlay', style: { opacity: overlayOpacity }, onClick: this.closeImagebox })
      );
    }
  }]);
  return Container;
}(React.Component);

var Panel = function (_Component) {
  inherits(Panel, _Component);

  function Panel() {
    classCallCheck(this, Panel);
    return possibleConstructorReturn(this, Object.getPrototypeOf(Panel).apply(this, arguments));
  }

  createClass(Panel, [{
    key: 'size',
    value: function size() {
      var node = reactDom.findDOMNode(this.refs.content);
      var width = node.naturalWidth || node.offsetWidth;
      var height = node.naturalHeight || node.offsetHeight;
      return { width: width, height: height };
    }
  }, {
    key: 'title',
    value: function title() {
      return this.props.title;
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.isCurrentIndex && this.props.isCurrentIndex !== nextProps.isCurrentIndex) {
        this.props.handleImageLoaded();
      }
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _props = this.props;
      var children = _props.children;
      var show = _props.show;
      var haveInit = _props.haveInit;

      if (children.type === 'img') {
        var isLazyLoad = lodash.get(children.props, 'data-src', false);
        var imgProps = {
          src: isLazyLoad && show || haveInit ? children.props['data-src'] : children.props['src'],
          ref: 'content'
        };
        return React__default.createElement('img', imgProps);
      } else {
        return React.cloneElement(children, {
          ref: 'content'
        });
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var isCurrentIndex = _props2.isCurrentIndex;
      var show = _props2.show;
      var fadeMode = _props2.fadeMode;
      var fadeSpeed = _props2.fadeSpeed;

      var style = { 'transition': fadeMode ? 'all ' + fadeSpeed / 1000 + 's' : 'none' };
      return React__default.createElement(
        'li',
        {
          style: style,
          className: classNames({ 'is-active': isCurrentIndex && show }) },
        this.renderChildren()
      );
    }
  }]);
  return Panel;
}(React.Component);

var Modal = function (_Component) {
  inherits(Modal, _Component);

  function Modal() {
    classCallCheck(this, Modal);
    return possibleConstructorReturn(this, Object.getPrototypeOf(Modal).apply(this, arguments));
  }

  createClass(Modal, [{
    key: 'getPanel',
    value: function getPanel(index) {
      return this.refs['order-' + index];
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren() {
      var _props = this.props;
      var children = _props.children;
      var rest = objectWithoutProperties(_props, ['children']);

      return children.map(function (child, index) {
        var isCurrentIndex = index === rest.currentIndex && !rest.isSwitching;
        var props = lodash.merge({}, rest, {
          key: index,
          ref: 'order-' + index,
          isCurrentIndex: isCurrentIndex
        });
        return React.cloneElement(child, props);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      return React__default.createElement(
        'ul',
        null,
        this.renderChildren()
      );
    }
  }]);
  return Modal;
}(React.Component);

var ImageboxContainer = Container;
var ImageboxPanel = Panel;
var ImageboxManager = Manager$1;
var ImageboxModal = Modal;

exports.ImageboxContainer = ImageboxContainer;
exports.ImageboxPanel = ImageboxPanel;
exports.ImageboxManager = ImageboxManager;
exports.ImageboxModal = ImageboxModal;