import Debug from 'debug'
import Got from 'got'
import https from 'https'
import { privateMethods, sign } from './common'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:rest')

class Rest {
  constructor(key, secret, testnet, timeout, keepAlive) {
    this.key = key ? key : process.env.DERIBIT_KEY
    this.secret = secret ? secret : process.env.DERIBIT_SECRET

    if (process.env.DERIBIT_TESTNET) {
      testnet = true
    }

    debug('Connecting to testnet', testnet)

    this.got = Got.extend({
      prefixUrl: testnet ? 'https://test.deribit.com' : 'https://www.deribit.com',
      timeout,
      agent: {
        https: new https.Agent({ keepAlive }),
      },
    })
  }

  execute(deribitMethod, json = {}) {
    deribitMethod = deribitMethod.toString().toLowerCase()

    const privacy = privateMethods.includes(deribitMethod) ? 'private' : 'public'
    const method = deribitMethod.startsWith('get_') || deribitMethod.startsWith('list_') ? 'GET' : 'POST'
    const url = `api/v2/${privacy}/${deribitMethod}`

    if (method === 'POST' && process.env.DERIBIT_SAFE) {
      const err = new Error('DERIBIT_SAFE mode is ON')
      err.name = 'deribit_safe'
      throw err
    }

    debug({ dt: new Date(), method: deribitMethod, params: json })

    const opts = {
      method,
    }

    if (method === 'GET') {
      opts.searchParams = json
    } else {
      opts.json = { jsonrpc: '2.0', method: `${privacy}/${deribitMethod}`, params: { ...json } }
    }

    if (privacy === 'private') {
      opts.headers = {
        Authorization: sign({
          key: this.key,
          secret: this.secret,
          method,
          url,
          json: method === 'GET' ? opts.searchParams : opts.json,
        }),
      }
    }

    return this.got(url, opts)
      .json()
      .then(res => {
        if (!res.result) {
          let err = new Error(res.message)
          err.name = 'deribit_api'
          throw err
        }

        return res.result
      })
      .catch(error => {
        debug('Deribit error', error.response.body)
        const body = JSON.parse(error.response.body)
        const err = new Error(body.error.message)
        err.name = 'deribit_api'
        err.code = body.error.code
        err.body = body.error
        throw err
      })
  }
}

export default function (key, secret, livenet = false, timeout = 1000, keepAlive = true) {
  let rest = new Rest(key, secret, livenet, timeout, keepAlive)

  let handler = {
    get(_, deribitMethod) {
      return function (json) {
        return rest.execute(deribitMethod, json)
      }
    },
  }

  return new Proxy({}, handler)
}
