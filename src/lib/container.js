import React, { Component, cloneElement } from 'react'
import { get, merge, omit, clone } from 'lodash'
import classNames from 'classnames'
import Manager from './manager'

export class Container extends Component {
  constructor(props) {
    super(props)

    this._timeoutQueue = []

    this._defaultState = this.getConfig({ params: props, isInit: true })
    this.state = this._defaultState

    this.onClickPrev = this.onClickPrev.bind(this)
    this.onClickNext = this.onClickNext.bind(this)
    this.onClickContent = this.onClickContent.bind(this)
    this.handleImageLoaded = this.handleImageLoaded.bind(this)
    this.handleStoreChange = this.handleStoreChange.bind(this)

    this.closeImagebox = Manager.close.bind(Manager)
    this.modal = null
  }

  getConfig({ params, isInit }) {
    const defaultConfig = {
      overlayOpacity: 0.75,
      show: false,
      fadeIn: false,
      fadeInSpeed: 500,
      fadeOut: true,
      fadeOutSpeed: 500,
      isSwitching: true,
      currentIndex: 0,
      titleBar: {
        enable: true,
        closeButton: true,
        closeText: '✕',
        position: 'top',
        prevText: '﹤',
        nextText: '﹥'
      },
      lightbox: {
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
    }
    if (isInit && !params) return defaultConfig

    const _config = merge({}, isInit ? defaultConfig : this._defaultState, params)
    return merge({}, _config, {
      currentWidth: get(_config.lightbox, 'initWidth'),
      currentHeight: get(_config.lightbox, 'initHeight')
    })
  }

  onKeyDown(e) {
    if ((this.state.show) && (e.keyCode === 27)) {
      this.closeImagebox()
    }
  }

  handleStoreChange(params) {
    const { children, index, show, config } = params

    if (this.state.show !== show) {
      this.cleanUp()

      const { fadeIn, fadeOut, fadeInSpeed, fadeOutSpeed } = this.state
      if (show) {
        const { onComplete } = this.props
        this.setState(
          merge({}, this.getConfig({ params: config, isInit: false }), {
            show: true,
            children: children,
            transition: (fadeIn) ? `all ${(fadeInSpeed / 1000)}s ease-in-out` : 'none'
          })
        )

        this._timeoutQueue.push(setTimeout(() => {
          onComplete && onComplete()
        }, fadeInSpeed + 1))

        this.onOpen(index)
      } else {
        const { onCleanUp } = this.props
        onCleanUp && onCleanUp()
        this.setState({
          show: false,
          transition: (fadeOut) ? `all ${fadeOutSpeed / 1000}s ease-in-out` : 'none'
        })

        this._timeoutQueue.push(setTimeout(() => {
          this.onClosed()
        }, fadeOutSpeed + 1))
      }
    }
  }

  componentWillMount() {
    Manager.addChangeListener(this.handleStoreChange)
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown.bind(this))
    Manager.removeChangeListener(this.handleStoreChange)
  }

  componentWillReceiveProps(nextProps) {
    this.state = merge({}, this.state, omit(nextProps, 'children'))
  }

  onOpen(index) {
    const { speed, initHeight, initWidth } = this.state.lightbox
    const { onOpen } = this.props
    onOpen && onOpen()
    
    const trasitionSpeed = speed || 0
    this.setState({
      isSwitching: true,
      currentIndex: index,
      currentWidth: initWidth,
      currentHeight: initHeight
    })

    this._timeoutQueue.push(setTimeout(() => {
      this.setState({ isSwitching: false })
    }, trasitionSpeed))

    window.onresize = () => {
      const { currentWidth, currentHeight } = this.getCurrentSize(this.state.currentIndex)
      this.setState({
        currentWidth: currentWidth,
        currentHeight: currentHeight
      })
    }
  }

  onClosed() {
    const { onClosed } = this.props
    onClosed && onClosed()
    this.setState(merge({}, this._defaultState, {
      lightbox: merge({}, this.state.lightbox, { smoothResize: false })
    }))
    this.cleanUp()
  }

  onClickPrev() {
    const { currentIndex } = this.state
    const children = get(this.state, 'children.props.children')
    const isFirstImage = currentIndex === 0
    const newIndex = (isFirstImage) ? children.length - 1 : currentIndex - 1
    this.onChangeIndex(newIndex)
  }

  onClickNext() {
    const { currentIndex } = this.state
    const children = get(this.state, 'children.props.children')
    const isLastImage = children.length === currentIndex + 1
    const newIndex = (isLastImage) ? 0 : currentIndex + 1
    this.onChangeIndex(newIndex)
  }

  onChangeIndex(newIndex) {
    this.cleanUp()
    const { speed, fadeMode } = this.state.lightbox
    this.state.isSwitching = true
    this.state.currentIndex = newIndex
    this.forceUpdate()

    this._timeoutQueue.push(setTimeout(() => {
      this.setState({
        isSwitching: false
      })
    }, fadeMode ? speed : 0))

  }

  getCurrentSize(index = this.state.currentIndex) {
    if (!this.modal) return { currentWidth: this.state.lightbox.initWidth, currentHeight: this.state.lightbox.initHeight }

    const { maxHeight, maxWidth, compatible } = this.state.lightbox
    const currentChildren = this.modal.getPanel(index)
    const { width: imgWidth, height: imgHeight } = currentChildren.size()
    const clientWidth = document.body.clientWidth - 18
    const clientHeight = document.body.clientHeight - 68

    let currentWidth, currentHeight, ratio
    if (maxWidth && imgWidth > maxWidth && imgWidth > imgHeight) {
      ratio =  (compatible && clientWidth < maxWidth ? clientWidth : maxWidth) / imgWidth
      currentWidth = (compatible && clientWidth < maxWidth) ? clientWidth : maxWidth
      currentHeight = imgHeight * ratio
      if ((maxHeight && maxHeight < currentHeight) || (compatible && currentHeight > clientHeight)) {
        ratio = (compatible && clientHeight < currentHeight ? clientHeight : currentHeight) / imgHeight
        currentWidth = imgWidth * ratio
        currentHeight = (compatible && clientHeight < maxHeight) ? clientHeight : maxHeight
      }
    } else if (maxHeight && imgHeight > maxHeight && imgHeight > imgWidth) {
      ratio = (compatible && clientHeight < maxHeight ? clientHeight : maxHeight) / imgHeight
      currentHeight = (compatible && clientHeight < maxHeight) ? clientHeight : maxHeight
      currentWidth = imgWidth * ratio
      if ((maxWidth && maxWidth < currentWidth) || (compatible && currentWidth > clientWidth)) {
        ratio = (compatible && clientWidth < currentWidth ? clientWidth : currentWidth) / imgWidth
        currentWidth = (compatible && clientWidth < maxWidth) ? clientWidth : maxWidth
        currentHeight = imgHeight * ratio
      }
    } else {
      currentWidth = imgWidth
      currentHeight = imgHeight
    }

    return { currentWidth: currentWidth, currentHeight: currentHeight }
  }

  onClickContent() {
    const { currentIndex, lightbox: { clickSwitch, loop } } = this.state
    const children = get(this.state, 'children.props.children')
    const isLastImage = children.length === currentIndex + 1
    if (!clickSwitch || (!loop && isLastImage)) return
    this.onClickNext()
  }

  cleanUp() {
    this._timeoutQueue.forEach((timeout) => {
      clearTimeout(timeout)
    })
    this._timeoutQueue = []
  }

  renderTitleBar() {
    const { currentIndex } = this.state
    const { className, closeText, prevText, nextText, closeButton, closeButtonClassName } = this.state.titleBar
    const children = get(this.state, 'children.props.children', [])
    const isLastImage = children.length === currentIndex + 1
    const isFirstImage = currentIndex === 0

    const customTitle = this.modal && this.modal.getPanel(currentIndex).title()
    var text = customTitle || ''
    if (currentIndex !== null && customTitle) {
      const links = customTitle.match(/\{\{([^}]+|\}[^}]+)*\}\}/g)
      if (links) {
        links.map((link) => {
          const matches = link.match(/\{\{(.*)\}\}/)[1].split('|')
          const el = `<a href=${matches[0]} target=${!matches[2] ? '_blank' : '_self'}>${matches[1]}</a>`
          text = text.replace(link, el)
        })
      }
    }

    const titleBarClass = {}
    if (className) {
      titleBarClass[className] = titleBarClass
    }

    return (
      <div className={ classNames('imagebox-titleBar', titleBarClass) }>
        <div className="lightbox-btns">
          <button
            onClick={this.onClickPrev}
            className="lightbox-btn lightbox-btn--prev"
            disabled={!this.state.lightbox.loop && isFirstImage}>
            { prevText }
          </button>
          <div className="lightbox-imgIndex">{currentIndex + 1} / {children.length}</div>
          <button
            onClick={this.onClickNext}
            className="lightbox-btn lightbox-btn--next"
            disabled={!this.state.lightbox.loop && isLastImage}>
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

    const { currentWidth, currentHeight } = this.getCurrentSize(this.state.currentIndex)
    this.setState({
      currentWidth: currentWidth,
      currentHeight: currentHeight
    })
  }

  renderChildren() {
    const { fadeMode, fadeSpeed, initHeight, initWidth } = this.state.lightbox
    const childProps = {
      show: this.state.show,
      fadeMode,
      fadeSpeed,
      setRef: c => this.modal = c,
      currentIndex: this.state.currentIndex,
      handleImageLoaded: this.handleImageLoaded,
      isSwitching: this.state.isSwitching,
      initHeight,
      initWidth
    }
    return cloneElement(this.state.children, childProps)
  }

  render() {
    const {
      overlayOpacity,
      show,
      className,
      titleBar,
      currentWidth,
      currentHeight,
      isSwitching,
      children,
      lightbox: {
        smoothResize,
        speed,
        maxWidth,
        maxHeight,
        minWidth,
        minHeight
      }
    } = this.state

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
        data-title={ (titleBar.enable) ? titleBar.position : undefined }
        style={{ transition: this.state.transition }}>
        <div className={classNames('imagebox-wrapper', className)}>
          { titleBar.enable && this.renderTitleBar() }
          <div className="imagebox-content" style={contentStyle} onClick={this.onClickContent}>
            <span className="imagebox-loading" hidden={!isSwitching}></span>
            {children && this.renderChildren()}
          </div>
        </div>
        <div className="imagebox-overlay" style={{ opacity: overlayOpacity }} onClick={this.closeImagebox} />
      </div>
    )
  }
}
