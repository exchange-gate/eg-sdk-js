# ExchangeGate Javascript SDK

This ExchangeGate SDK library supports web browsers and NodeJS.

## Installation

#### NPM (or Yarn)

You can use any NPM-compatible package manager, including NPM itself and Yarn.

```bash
npm i @exchange-gate.io/eg-sdk-js
```

Then:

```javascript
import { ExchangeGate } from '@exchange-gate.io/eg-sdk-js';
```

Or, if you're not using ES6 modules:

```javascript
const ExchangeGate = require('@exchange-gate.io/eg-sdk-js').ExchangeGate;
```

## REST API

#### Initialize Rest Client
```js
const egRest = new ExchangeGate.Rest(API_KEY);
```

#### Public trades snapshot
Fetch latest x100 public trades
```js
const publicTrades = await egRest.fetchPublicTradesSnapshot('binance', 'btc-usdt');
```

#### Order Book snapshot
Fetch OrderBook snapshot x100 Bids/Asks
```js
const orderBook = await egRest.fetchOrderBookSnapshot('binance', 'btc-usdt');
```

#### Exchanger markets
Fetch available Exchanger Markets
```js
const exchangerMarkets = await egRest.fetchExchangerMarkets();
```

#### Price ticker
Fetch price ticker for selected markets based from last trade price
```js
const priceTicker = await egRest.fetchPriceTicker('binance', ['btc-usdt', 'btc-eth']);
```

#### OrderBook ticker
Fetch order book ticker for selected markets based from best bid/ask
```js
const orderBookTicker = await egRest.fetchOrderBookTicker('binance', ['btc-usdt', 'btc-eth']);
```

#### Wallet balance
Fetch Exchanger account wallet balance
```js
const walletBalance = await egRest.fetchWalletBalance('binance', 'btc-usdt');
```

#### Open orders
Fetch Exchanger account open orders
```js
const openOrders = await egRest.fetchOpenOrders('binance', 'btc-usdt');
```

#### My trades
Fetch Exchanger account trades
```js
const myTrades = await egRest.fetchMyTrades('binance', 'btc-usdt');
```

#### Market order
Create Market order
```js
const side = 'buy'; // sell
const marketOrder = await egRest.createMarketOrder('binance', 'btc-usdt', side, amount);
```

#### Limit order
Create Limit order
```js
const side = 'buy'; // sell
const limitOrder = await egRest.createLimitOrder('binance', 'btc-usdt', side, amount, limitPrice);
```

#### Cancel order
Cancel open order
```js
const order = await egRest.cancelOrder('binance', 'btc-usdt', uuid);
```

## REALTIME

#### Initialize Realtime Client
```js
const egRealtime = new ExchangeGate.Realtime(API_KEY);
```

### Socket events
Listen for socket events
```js
const socketEvents = ['connect', 'connecting', 'error', 'disconnect', 'close'];
for (const socketEvent of socketEvents) {
    egRealtime.onSocketEvent(socketEvent, (e) => {
        console.log('onSocketEvent', socketEvent, e);
    });
}
```

### Remote Procedure Call's (RPC) over WebSocket's
Any of REST API methods also available over WS as RPC
```js
const publicTrades = await egRealtime.rpc.fetchPublicTradesSnapshot('binance', 'btc-usdt');
```

### STREAMS

#### Public trades
Subscribe public trades stream
```js
const streamSubscription = egRealtime.stream.publicTrades('binance', 'btc-usdt');
const streamConsumerA = streamSubscription.consumer();
const streamConsumerB = streamSubscription.consumer();

(async () => {
    for await (const event of streamConsumerA) {
        console.log('event-A', event.name, event.data);
    }
    console.log('stream-A closed');
})();

(async () => {
    for await (const event of streamConsumerB) {
        console.log('event-B', event.name, event.data);
    }
    console.log('stream-B closed');
})();
```

Kill consumer-A but preserve subscription and any other consumers
```js
streamConsumerA.kill();
```

UnSubscribe stream and close all stream consumers
```js
streamSubscription.close();
// OR
egRealtime.stream.publicTrades('binance', 'btc-usdt').close();
```

!NOTE! It is safe to issue stream subscription multiple times within single connection
```js
egRealtime.stream.publicTrades('binance', 'btc-usdt');
// this will be same subscription - no double spend
egRealtime.stream.publicTrades('binance', 'btc-usdt');
```
Disconnect from socket server
```js
egRealtime.disconnect();
```

#### Order book
Subscribe order book stream.  
Always verified and synchronized with server snapshot, 
even after dropped connection silently sync's back to guarantee bid/ask precision;  
emitTimeoutMs - default 500, set to 0 for realtime.
```js
const streamSubscription = egRealtime.stream.orderBook('binance', 'btc-usdt', emitTimeoutMs);
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```

#### Price ticker
Subscribe market price ticker stream.  
Price ticker for selected markets based from last trade price, published once per second
```js
const streamSubscription = egRealtime.stream.priceTicker('binance', ['btc-usdt', 'btc-eth']);
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```

#### OrderBook ticker
Subscribe market order book ticker stream.  
Order book ticker for selected markets based from best bid/ask, published once per second
```js
const streamSubscription = egRealtime.stream.orderBookTicker('binance', ['btc-usdt', 'btc-eth']);
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```

#### My trades
Subscribe my trades stream
```js
const streamSubscription = egRealtime.stream.myTrades('binance', 'btc-usdt');
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```

#### Open orders
Subscribe Open orders stream.  
New orders or any existing order changes
```js
const streamSubscription = egRealtime.stream.openOrders('binance', 'btc-usdt');
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```

#### Wallet balance
Subscribe Wallet balance stream.
```js
const streamSubscription = egRealtime.stream.walletBalance('binance', 'btc-usdt');
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```

#### Subscription details
Subscribe Subscription details stream.  
Remaining credits, available/used socket connections
```js
const streamSubscription = egRealtime.stream.subscriptionDetails();
(async () => {
    for await (const event of streamSubscription.consumer()) {
        console.log('event', event.name, event.data);
    }
})();
```
