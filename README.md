# deribit-ws-js
Generic Deribit.com JS API with WebSocket support


# Install

```bash
yarn add deribit-ws-js
```

# Setup

ENV vars (used if no params provided to constructor)

```bash
DERIBIT_SAFE=1              // Read-only mode
DERIBIT_TESTNET=1           // Testnet
DERIBIT_KEY=key_here        // API Key
DERIBIT_SECRET=secret_here  // API Secret
```

Import

```js
import { REST, WS } from 'deribit-ws-js'
```

# REST

Constructor

```js
const rest = new REST(key, secret, testnet = false, timeout = 500, keepAlive = true)
```

Generic API calls (case-insesitive) from https://www.deribit.com/main#/pages/docs/api

```js
let res = await rest.buy({
  instrument: 'BTC-28DEC18-15000-C',
  quantity: 1,
  type: 'market',
  label: '1123123',
})
```

```js
rest.Account().then(acc => console.log(acc))
```

# WebSocket

Constructor

```js
const ws = new WS(key, secret, testnet = false)
```

Wait for connection

```js
await ws.connected
```

Disconnect when done

```js
ws.disconnect()
```

## Event hooks

Filters and events (see https://www.deribit.com/main#/pages/docs/api -> WebSocket API -> Subscribe)

```js
let filters = ['all', 'futures', 'options', 'index', 'any_instrument_name']
```
```js
let events = ['order_book', 'trade', 'user_order', 'my_trade']
```

Hooks

```js
ws.hook('my_trade', trade => console.log(trade))
```

With filter

```js
ws.hook('order_book', 'BTC-28SEP18', cb)
```

Array as filter

```js
ws.hook('trade', ['BTC-28SEP18','BTC-28DEC18'], cb)
```
