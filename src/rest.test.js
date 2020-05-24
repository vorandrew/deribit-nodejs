import 'dotenv/config'
import Debug from 'debug'
import Rest from './rest'

// eslint-disable-next-line no-unused-vars
const debug = Debug('deribit:api:rest:test')
const rest = new Rest()

describe('rest', async () => {
  it('public', async () => {
    expect(await rest.test({ some: 4 })).toHaveProperty('version')
  })

  it('getinstruments', async () => {
    const instruments = await rest.get_instruments({ currency: 'BTC' })
    debug(instruments[0])
    expect(instruments.length).toBeGreaterThan(10)
  })

  it('positions', async () => {
    let positions = await rest.get_positions({ currency: 'BTC' })
    debug(positions[0])
    expect(positions.length).toBeGreaterThan(0)
  })

  it('buy', async () => {
    let res = await rest.buy({
      instrument_name: 'BTC-PERPETUAL',
      amount: 20,
      type: 'market',
      label: '1123123',
    })
    expect(res).toHaveProperty('order.average_price')
  })
})
