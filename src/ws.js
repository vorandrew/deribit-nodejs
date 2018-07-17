import Debug from 'debug'
import WebSocket from 'ws'
import { sig } from './common'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:ws')

let wsEvents = {
  order_book_event: {
    hook: 'order_book',
    filter: (msg, filter) => {
      let arrFilter = Array.isArray(filter) ? filter : [filter]
      return arrFilter.includes(msg.instrument)
    },
  }, // order book change
  trade_event: {
    hook: 'trade',
    filter: (msg, filter) => {
      let arrFilter = Array.isArray(filter) ? filter : [filter]
      return arrFilter.includes(msg.instrument)
    },
  }, // trade notification
  user_orders_event: {
    hook: 'user_order',
    filter: (msg, filter) => {
      let arrFilter = Array.isArray(filter) ? filter : [filter]
      return arrFilter.includes(msg.instrument)
    },
  }, // change of user orders (openning, cancelling, filling)
  my_trade_event: {
    hook: 'my_trade',
    filter: (msg, filter) => {
      let arrFilter = Array.isArray(filter) ? filter : [filter]
      return arrFilter.includes(msg.instrument)
    },
  }, // my trade notification
}

export default class WS {
  constructor(key, secret, testnet = false) {
    this.key = key ? key : process.env.DERIBIT_KEY
    this.secret = secret ? secret : process.env.DERIBIT_SECRET

    if (process.env.DERIBIT_TESTNET) {
      testnet = true
    }

    this.hooks = {
      order_book: [], // order book change
      trade: [], // trade notification
      user_order: [], // change of user orders (openning, cancelling, filling)
      my_trade: [], // my trade notification
    }

    let url = testnet
      ? 'wss://test.deribit.com/ws/api/v1/'
      : 'wss://www.deribit.com/ws/api/v1/'

    this.ws = new WebSocket(url)

    this.ws.on('open', () => debug(`Connected to ${url}`))

    this.ws.on('message', debug)
    this.ws.on('message', msg => {
      if (msg.includes('notifications')) {
        this.notifications(JSON.parse(msg).notifications)
      }
    })

    this.connected = new Promise(resolve => this.ws.on('open', resolve))
  }

  disconnect() {
    let msg = {
      id: 'disconnect',
      action: '/api/v1/private/unsubscribe',
    }
    msg.sig = sig(msg.action, msg.arguments, this.key, this.secret)
    this.send(msg)
  }

  subscribe(event = 'order_book', instrument = 'all') {
    let msg = {
      id: 'subscribe',
      action: '/api/v1/private/subscribe',
      arguments: {
        instrument: Array.isArray(instrument) ? instrument : [instrument],
        event: Array.isArray(event) ? event : [event],
      },
    }

    msg.sig = sig(msg.action, msg.arguments, this.key, this.secret)
    this.send(msg)
  }

  send(json) {
    debug('Send', json)
    this.ws.send(JSON.stringify(json))
  }

  hook(...args) {
    let cb = args.pop()
    let event = args.shift()

    let filter = args[0] ? args[0] : null

    let one = { cb }

    if (filter) {
      one.subscribe = one.filter = Array.isArray(filter) ? filter : [filter]
      one.filter = one.filter.filter(
        o => !['all', 'futures', 'options', 'index'].includes(o),
      )
    }

    this.hooks[event].push(one)
    this.subscribe(event, one.subscribe ? one.subscribe : 'all')
  }

  notifications(ntfs) {
    ntfs.forEach(ntf => {
      let { hook, filter } = wsEvents[ntf.message]

      let hooks = this.hooks[hook] || []
      if (hooks.length === 0) return

      let msgs = Array.isArray(ntf.result) ? ntf.result : [ntf.result]

      hooks.forEach(oneHook => {
        msgs.forEach(msg => {
          if (!oneHook.filter.length) {
            process.nextTick(oneHook.cb, msg)
            return
          }

          if (filter(msg, oneHook.filter)) {
            process.nextTick(oneHook.cb, msg)
          }
        })
      })
    })
  }
}
