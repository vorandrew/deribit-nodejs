import 'dotenv/config'
import Debug from 'debug'
import WS from './ws'
import Rest from './rest'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:ws:test')

function delay(msec) {
  return new Promise(resolve => setTimeout(resolve, msec))
}

describe('ws', async () => {
  describe('hooks', async () => {
    it('order_book', async () => {
      let ws = new WS()
      await ws.connected
      const cb = jest.fn(debug)
      ws.hook('order_book', 'BTC-28SEP18', cb)
      await delay(1000)
      expect(cb).toBeCalled()
      ws.disconnect()
    })

    it('user_order', async () => {
      let ws = new WS()
      let rest = new Rest()
      await ws.connected
      const cb = jest.fn(debug)
      ws.hook('user_order', cb)

      await rest.buy({
        instrument: 'BTC-28SEP18',
        quantity: 1,
        type: 'limit',
        price: 5000,
      })

      await delay(1000)
      expect(cb).toBeCalled()
      ws.disconnect()
    })

    it('my_trade', async () => {
      let ws = new WS()
      let rest = new Rest()
      await ws.connected
      const cb = jest.fn(debug)
      ws.hook('my_trade', cb)

      await rest.buy({
        instrument: 'BTC-28SEP18',
        quantity: 1,
        type: 'market',
        price: 7000,
      })

      await delay(1000)
      expect(cb).toBeCalled()
      ws.disconnect()
    })
  })
})
