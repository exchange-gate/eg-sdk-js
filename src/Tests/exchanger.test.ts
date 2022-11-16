import { ExchangeGate } from '@exchange-gate.io/eg-sdk-js';
import {
    LimitOrderParams,
    MarketOrderParams,
    OrderParams,
    ResponseState,
    TickerType
} from '@exchange-gate.io/eg-sdk-js/types/src/Types/response';
import { Exchanger } from '@Types/response';
import jwtDecode from 'jwt-decode';
import { expect, jest, test, describe } from '@jest/globals';

// eslint-disable-next-line max-len
let API_KEY = '';
const config = {
    timeout: 5 * 1000,
    baseURL: 'https://staging-api.exchange-gate.io'
};
const egRest = new ExchangeGate.Rest(API_KEY, config);
const markets = [
    'btc-usdt',
    'btc-eth'
];
const uniqueName = 'JESTTESTING'; // must be unique
const exchangerKey = ''; // must fill
const exchangerSecret = ''; // must fill
const periodFrom = '';
const periodTo = '';
const exchanger = 'binance';
let exchangerKeyId = 0;
let market = '';
let uuid = '';
let generalKey = '';
let generalKeyId = 0;
let exchangersArray: Exchanger[] = [];

jest.setTimeout(10000);

describe('Fetch Exchanger Data', () => {
    test('fetchExchangers', async () => {
        const exchangers = await egRest.fetchExchangers();
        if (exchangers.data) {
            exchangersArray = exchangers.data;
        }
        expect(exchangers.state).toBe(ResponseState.SUCCESS);
        expect(exchangers.data?.length).toBeGreaterThanOrEqual(1);
    });

    test('fetchMarkets', async () => {
        const markets = await egRest.fetchMarkets();
        if (markets.data) {
            market = markets.data[0].market;
        }
        expect(markets.state).toBe(ResponseState.SUCCESS);
        expect(markets.data?.length).toBeGreaterThanOrEqual(1);
    });

    test('fetchExchangerMarkets', async () => {
        const markets = await egRest.fetchExchangerMarkets();
        expect(markets.state).toBe(ResponseState.SUCCESS);
        expect(markets.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchOrderBookSnapshot', (exchanger: Exchanger) => {
    test(`fetchOrderBookSnapshot -  ${exchanger.name}`, async () => {
        const orderBook = await egRest.fetchOrderBookSnapshot(exchanger.name, market);
        expect(orderBook.state).toBe(ResponseState.SUCCESS);
        expect(orderBook.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchPublicTradesSnapshot', (exchanger: Exchanger) => {
    test(`fetchPublicTradesSnapshot -  ${exchanger.name}`, async () => {
        const publicTrades = await egRest.fetchPublicTradesSnapshot(exchanger.name, market);
        expect(publicTrades.state).toBe(ResponseState.SUCCESS);
        expect(publicTrades.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchOhlcv', (exchanger: Exchanger) => {
    test(`fetchOhlcv -  ${exchanger.name}`, async () => {
        const group = '1MTH';
        const publicTrades = await egRest.fetchOhlcv(exchanger.name, market, group, periodFrom, periodTo);
        expect(publicTrades.state).toBe(ResponseState.SUCCESS);
        expect(publicTrades.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchHistoricalTrades', (exchanger: Exchanger) => {
    test(`fetchHistoricalTrades -  ${exchanger.name}`, async () => {
        const historicalTrades = await egRest.fetchHistoricalTrades(exchanger.name, market, periodFrom, periodTo);
        expect(historicalTrades.state).toBe(ResponseState.SUCCESS);
        expect(historicalTrades.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchMyTrades', (exchanger: Exchanger) => {
    test(`fetchMyTrades -  ${exchanger.name}`, async () => {
        const myTrades = await egRest.fetchMyTrades(exchanger.name, market);
        expect(myTrades.state).toBe(ResponseState.SUCCESS);
        expect(myTrades.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchOpenOrders', (exchanger: Exchanger) => {
    test(`fetchOpenOrders -  ${exchanger.name}`, async () => {
        const openOrders = await egRest.fetchOpenOrders(exchanger.name, market);
        expect(openOrders.state).toBe(ResponseState.SUCCESS);
        expect(openOrders.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchTicker', (exchanger: Exchanger) => {
    test(`fetchTicker -  ${exchanger.name}`, async () => {
        const ticker = await egRest.fetchTicker(exchanger.name, markets, TickerType.PRICE);
        expect(ticker.state).toBe(ResponseState.SUCCESS);
        expect(ticker.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchPriceTicker', (exchanger: Exchanger) => {
    test(`fetchPriceTicker -  ${exchanger.name}`, async () => {
        const priceTicker = await egRest.fetchPriceTicker(exchanger.name, markets);
        expect(priceTicker.state).toBe(ResponseState.SUCCESS);
        expect(priceTicker.data).not.toBeUndefined();
    });
});

describe.each(exchangersArray)('fetchOrderBookTicker', (exchanger: Exchanger) => {
    test(`fetchOrderBookTicker -  ${exchanger.name}`, async () => {
        const orderBookTicker = await egRest.fetchOrderBookTicker(exchanger.name, markets);
        expect(orderBookTicker.state).toBe(ResponseState.SUCCESS);
        expect(orderBookTicker.data).not.toBeUndefined();
    });
});


test('createOrder', async () => {
    const orderParams: OrderParams = {
        exchanger: 'binance',
        market: 'btc-usdt',
        side: 2,
        amount: '0.04',
        limitPrice: 70
    };
    const order = await egRest.createOrder(orderParams);
    expect(order.state).toBe(ResponseState.SUCCESS);
    expect(order.data).not.toBeUndefined();
});

test('createMarketOrder', async () => {
    const marketOrderParams: MarketOrderParams = {
        exchanger: 'binance',
        market: 'btc-usdt',
        side: 2,
        amount: '0.04'
    };
    const marketOrder = await egRest.createMarketOrder(marketOrderParams);
    expect(marketOrder.state).toBe(ResponseState.SUCCESS);
    expect(marketOrder.data).not.toBeUndefined();
});

test('createLimitOrder', async () => {
    const limitOrderParams: LimitOrderParams = {
        exchanger: 'binance',
        market: 'btc-usdt',
        side: 2,
        amount: '0.04',
        limitPrice: 70
    };
    const limitOrder = await egRest.createLimitOrder(limitOrderParams);
    if (limitOrder.data) {
        uuid = limitOrder.data.order.uuid;
    }
    expect(limitOrder.state).toBe(ResponseState.SUCCESS);
    expect(limitOrder.data).not.toBeUndefined();
});

test('cancelOrder', async () => {
    const cancelOrder = await egRest.cancelOrder(exchanger, market, uuid);
    expect(cancelOrder.state).toBe(ResponseState.SUCCESS);
    expect(cancelOrder.data).not.toBeUndefined();
});

test('searchOrders', async () => {
    const searchOrders = await egRest.searchOrders();
    expect(searchOrders.state).toBe(ResponseState.SUCCESS);
    expect(searchOrders.data?.length).toBeGreaterThanOrEqual(1);
});

test('createGeneralApiKey', async () => {
    const generalApiKey = await egRest.createGeneralApiKey(uniqueName);
    if (generalApiKey.data) {
        generalKey = generalApiKey.data;
        API_KEY = generalKey;
    }
    expect(generalApiKey.state).toBe(ResponseState.SUCCESS);
    expect(typeof generalApiKey.data).toBe('string');
});

test('fetchGeneralApiKey', async () => {
    const decodedGeneralKey: any = jwtDecode(generalKey);
    generalKeyId = decodedGeneralKey.generalKeyId;
    const generalKeyData = await egRest.fetchGeneralApiKey(decodedGeneralKey.generalKeyId);
    expect(generalKeyData.state).toBe(ResponseState.SUCCESS);
});

test('fetchExchangerKeyDataMap', async () => {
    const keyMap = await egRest.fetchExchangerKeyDataMap();
    expect(keyMap.state).toBe(ResponseState.SUCCESS);
    expect(keyMap.data).not.toBeUndefined();
});

test('createExchangerKey', async () => {
    const data = {
        key: exchangerKey,
        secret: exchangerSecret
    };
    const key = await egRest.createExchangerKey(3, uniqueName, data);
    if (key.data) {
        exchangerKeyId = key.data.id;
    }
    expect(key.state).toBe(ResponseState.SUCCESS);
    expect(key.data).not.toBeUndefined();
});

test('addGeneralExchangerKeyLink', async () => {
    const exchangerKeyLink = await egRest.addGeneralExchangerKeyLink(generalKeyId, [exchangerKeyId]);
    expect(exchangerKeyLink.data).toBe(true);
});

test('fetchWalletBalance', async () => {
    const egRest = new ExchangeGate.Rest(generalKey, config);
    const walletBalance = await egRest.fetchWalletBalance('binance', market);
    expect(walletBalance.state).toBe(ResponseState.SUCCESS);
    expect(walletBalance.data).not.toBeUndefined();
});

test('removeGeneralExchangerKeyLink', async () => {
    const keyLink = await egRest.removeGeneralExchangerKeyLink(generalKeyId, [exchangerKeyId]);
    expect(keyLink.data).toBe(true);
});

test('deleteExchangerKey', async () => {
    const key = await egRest.deleteExchangerKey(exchangerKeyId);
    expect(key.data).toBe(true);
});
