import Debug from 'debug'
import Axios from 'axios'
import https from 'https'
import { privateMethods, postMethods, sig, serialize } from './common'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:rest')

class Rest {
  constructor(key, secret, testnet = false, timeout = 1000, keepAlive = true) {
    this.key = key ? key : process.env.DERIBIT_KEY
    this.secret = secret ? secret : process.env.DERIBIT_SECRET

    if (process.env.DERIBIT_TESTNET) {
      testnet = true
    }

    debug('Connecting to testnet', testnet)

    this.axios = Axios.create({
      baseURL: testnet ? 'https://test.deribit.com' : 'https://www.deribit.com',
      timeout,
      httpsAgent: new https.Agent({ keepAlive }),
    })
  }

  execute(deribitMethod, json = {}) {
    deribitMethod = deribitMethod.toString().toLowerCase()

    let privacy = privateMethods.includes(deribitMethod) ? 'private' : 'public'
    let method = postMethods.includes(deribitMethod) ? 'post' : 'get'
    let url = `/api/v1/${privacy}/${deribitMethod}`

    if (method === 'post' && process.env.DERIBIT_SAFE) {
      let err = new Error('DERIBIT_SAFE mode is ON')
      err.name = 'deribit_safe'
      throw err
    }

    let data = {}
    let params = {}

    method === 'get' ? (params = json) : (data = serialize(json))

    debug('Method:', deribitMethod, ' Params:', json)

    let opt = {
      method,
      url,
      data,
      params,
    }

    if (privacy === 'private') {
      opt.headers = {
        'x-deribit-sig': sig(url, json, this.key, this.secret),
      }
    }

    return this.axios(opt).then(res => {
      if (!res.data.success) {
        let err = new Error(res.data.message)
        err.name = 'deribit_api'
        throw err
      }

      return res.data.result
    })
  }
}

export default function(key, secret, livenet = false, timeout = 500, keepAlive = true) {
  let rest = new Rest(key, secret, livenet, timeout, keepAlive)

  let handler = {
    get(_, deribitMethod) {
      return function(json) {
        return rest.execute(deribitMethod, json)
      }
    },
  }

  return new Proxy({}, handler)
}
