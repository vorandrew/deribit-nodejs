import 'dotenv/config'
import Debug from 'debug'
import Rest from './rest'

// eslint-disable-next-line no-unused-vars
const debug = Debug('deribit:api:rest:test')
const rest = new Rest()

describe('rest', () => {
  it('public', async () => {
    expect(await rest.test({ some: 4 })).toHaveProperty('version')
  })

  it('get_user_trades_by_currency_and_time', async () => {
    const res = await rest.get_user_trades_by_currency_and_time({
      currency: 'BTC',
      include_old: true,
      count: 10,
      start_timestamp: 1262350861000,
    })

    debug(res)
    expect(res.trades.length).toBeGreaterThanOrEqual(1)
  })

  it('get_subaccounts', async () => {
    const accounts = await rest.get_subaccounts({ with_portfolio: false })
    debug(accounts[0])
    expect(accounts.length).toBeGreaterThanOrEqual(1)
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

  it('ticker', async () => {
    let ticker = await rest.ticker({ instrument_name: 'BTC-PERPETUAL' })
    expect(ticker).toHaveProperty('best_bid_price')
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
