import { EventEmitter } from 'events'

const Constants = {
  OPEN: 'open',
  CLOSE: 'close',
  CHANGE: 'change'
}

class Manager extends EventEmitter {
  constructor() {
    super()
    
    this.content = null
    this.config = null
    this.index = 0
    this.show = false
  }

  open(params) {
    const { content, config, index } = params
    this.content = content || null
    this.config = config || {}
    this.index = index || 0
    this.show = true
    this.emitChange()
  }

  close() {
    this.show = false
    this.emitChange()
  }

  emitChange() {
    this.emit(Constants.CHANGE, {
      children: this.content,
      config: this.config,
      index: this.index,
      show: this.show
    })
  }

  addChangeListener(callback) {
    this.addListener(Constants.CHANGE, callback)
  }

  removeChangeListener(callback) {
    this.removeListener(Constants.CHANGE, callback)
  }
}

export default new Manager()
