import Debug from 'debug'
import Axios from 'axios'
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

    this.client = Axios.create({
      baseURL: testnet ? 'https://test.deribit.com' : 'https://www.deribit.com',
      timeout,
      httpsAgent: new https.Agent({ keepAlive }),
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
      url,
    }

    if (method === 'GET') {
      opts.params = json
    } else {
      opts.data = { jsonrpc: '2.0', method: `${privacy}/${deribitMethod}`, params: { ...json } }
    }

    if (privacy === 'private') {
      opts.headers = {
        Authorization: sign({
          key: this.key,
          secret: this.secret,
          method,
          url,
          json: method === 'GET' ? opts.params : opts.data,
        }),
      }
    }

    return this.client(opts)
      .then(res => {
        if (res.data.result === undefined) {
          let err = new Error(res.data.message)
          err.name = 'deribit_api'
          throw err
        }

        return res.data.result
      })
      .catch(e => {
        if (e.response && e.response.data) {
          const body = e.response.data
          debug('Deribit error', body)
          const err = new Error(body.error.message)
          err.name = 'deribit_api'
          err.code = body.error.code
          err.body = body.error
          throw err
        } else {
          throw e
        }
      })
  }
}

export default function (key, secret, livenet = false, timeout = 1000, keepAlive = true) {
  const rest = new Rest(key, secret, livenet, timeout, keepAlive)

  const handler = {
    get(_, deribitMethod) {
      return function (json) {
        return rest.execute(deribitMethod, json)
      }
    },
  }

  return new Proxy({}, handler)
}
