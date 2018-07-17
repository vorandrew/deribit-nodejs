import 'dotenv/config'
import Debug from 'debug'
import Rest from './rest'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:rest:test')
let rest = new Rest()

describe('rest', async () => {
  it('public', async () => {
    expect(await rest.test({ some: 4 })).toBeUndefined()
  })

  it('getinstruments', async () => {
    let instruments = await rest.getinstruments()
    debug(instruments[0])
    expect(instruments.length).toBeGreaterThan(10)
  })

  it('positions', async () => {
    let positions = await rest.positions()
    debug(positions[0])
    expect(positions.length).toBeGreaterThan(1)
  })

  it('buy', async () => {
    let res = await rest.buy({
      instrument: 'BTC-28DEC18-15000-C',
      quantity: 1,
      type: 'market',
      label: '1123123',
    })
    expect(res).toHaveProperty('order.avgPrice')
  })
})
