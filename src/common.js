import crypto from 'crypto'
import Debug from 'debug'

// eslint-disable-next-line no-unused-vars
let debug = Debug('deribit:api:common')

export let privateMethods = [
  'activate_tfa',
  'add_to_address_book',
  'buy',
  'cancel',
  'cancel_all',
  'cancel_all_by_currency',
  'cancel_all_by_instrument',
  'cancel_by_label',
  'cancel_transfer_by_id',
  'cancel_withdrawal',
  'change_api_key_name',
  'change_password',
  'change_scope_in_api_key',
  'change_subaccount_name',
  'close_position',
  'create_api_key',
  'create_deposit_address',
  'create_subaccount',
  'deactivate_tfa',
  'disable_api_key',
  'disable_cancel_on_disconnect',
  'disable_tfa_for_subaccount',
  'disable_tfa_with_recovery_code',
  'edit',
  'enable_api_key',
  'enable_cancel_on_disconnect',
  'execute_block_trade',
  'get_access_log',
  'get_account_summary',
  'get_address_book',
  'get_block_trade',
  'get_cancel_on_disconnect',
  'get_current_deposit_address',
  'get_deposits',
  'get_email_language',
  'get_last_block_trades_by_currency',
  'get_margins',
  'get_new_announcements',
  'get_open_orders_by_currency',
  'get_open_orders_by_instrument',
  'get_order_history_by_currency',
  'get_order_history_by_instrument',
  'get_order_margin_by_ids',
  'get_order_state',
  'get_pme_data',
  'get_pme_params',
  'get_position',
  'get_positions',
  'get_settlement_history_by_currency',
  'get_settlement_history_by_instrument',
  'get_stats',
  'get_stop_order_history',
  'get_subaccounts',
  'get_tfa_activation_data',
  'get_transfers',
  'get_user_trades_by_currency',
  'get_user_trades_by_currency_and_time',
  'get_user_trades_by_instrument',
  'get_user_trades_by_instrument_and_time',
  'get_user_trades_by_order',
  'get_withdrawals',
  'invalidate_block_trade_signature',
  'list_api_keys',
  'logout',
  'remove_api_key',
  'remove_from_address_book',
  'reset_api_key',
  'sell',
  'set_announcement_as_read',
  'set_api_key_as_default',
  'set_email_for_subaccount',
  'set_email_language',
  'set_password_for_subaccount',
  'submit_transfer_to_subaccount',
  'submit_transfer_to_user',
  'subscribe',
  'toggle_deposit_address_creation',
  'toggle_notifications_from_subaccount',
  'toggle_subaccount_login',
  'unsubscribe',
  'verify_block_trade',
  'withdraw',
]

export function serialize(m) {
  return Object.keys(m)
    .sort()
    .map(k => (Array.isArray(m[k]) ? `${k}=${m[k].join('')}` : `${k}=${m[k]}`))
    .join('&')
}

export function sign({ method, url, json = {}, key, secret }) {
  if (!key || !secret) {
    const err = new Error('Deribit key/secret missing')
    err.name = 'deribit_auth'
    throw err
  }

  const ts = new Date().getTime()
  const nonce = crypto.randomBytes(15).toString('hex')

  const body = method === 'POST' ? JSON.stringify(json) : ''
  const qs = method === 'GET' ? '?' + serialize(json) : ''

  const reqData = [ts, nonce, method, `/${url}${qs}`, body].join('\n') + '\n'
  const sig = crypto.createHmac('sha256', secret).update(reqData).digest('hex')

  debug({ reqData, sig })

  return `deri-hmac-sha256 id=${key},ts=${ts},nonce=${nonce},sig=${sig}`
}
