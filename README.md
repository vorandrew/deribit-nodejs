# deribit-nodejs
Deribit.com v2.0.0 NodeJS REST API


# Install

```bash
yarn add deribit-nodejs
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
import { REST } from 'deribit-nodejs'
```

# REST

Constructor

```js
const rest = new REST(key, secret, testnet = false, timeout = 500, keepAlive = true)
```

Generic API calls (case-insesitive) from https://docs.deribit.com/ (https://www.deribit.com/api_console)

```js
const res = await rest.buy({
  // no need to write private/public
  instrument: 'BTC-PERPETUAL',
  amount: 100,
  type: 'market',
  label: 'my_label',
})
```

```js
rest.get_account_summary().then(console.log)
```
