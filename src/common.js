import crypto from 'crypto'
import Debug from 'debug'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:common')

export let privateMethods = [
  'account',
  'buy',
  'cancel',
  'cancelall',
  'edit',
  'getopenorders',
  'newannouncements',
  'orderhistory',
  'orderstate',
  'positions',
  'sell',
  'tradehistory',
]

export let postMethods = ['buy', 'sell', 'edit', 'cancelall', 'cancel']

export function serialize(m) {
  return Object.keys(m)
    .sort()
    .map(k => (Array.isArray(m[k]) ? `${k}=${m[k].join('')}` : `${k}=${m[k]}`))
    .join('&')
}

export function sig(action, obj = {}, key, sec) {
  if (!key || !sec) {
    let err = new Error('Deribit key/secret missing')
    err.name = 'deribit_auth'
    throw err
  }

  let time = new Date().getTime()

  let m = Object.assign(
    {
      _: time,
      _ackey: key,
      _acsec: sec,
      _action: action,
    },
    obj,
  )

  let str = serialize(m)

  let hash = crypto.createHash('sha256')
  hash.update(str)

  let sig = `${key}.${time}.${hash.digest('base64')}`

  debug({ sig, str })

  return sig
}
