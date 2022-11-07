/* eslint-disable no-restricted-imports */
/* eslint-disable import/no-relative-parent-imports */
import { RequestParams } from '@Types/rest';
import jwtDecode from 'jwt-decode';
import axios, { Method } from 'axios';
import { ResponseState, TickerType } from '../Types/response';
import pkg from '../../package.json';

// eslint-disable-next-line max-len
const API_KEY = '';
const defaultOpts = {
    baseURL: 'https://staging-api.exchange-gate.io',
    timeout: 5 * 1000
};

const transport = axios.create({
    ...defaultOpts,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': `exchange-gate.io client, ${pkg.name} [v${pkg.version}]`,
        'X-API-KEY': API_KEY,
        'Version': pkg.version
    }
});

const markets = [
    'btc-usdt',
    'btc-eth'
];
const UniqueName = 'JESTTEST12312';
let exchanger = '';
let market = '';
let uuid = '';
let generalKey = '';
let generalKeyId = 0;

const invokeRestApi = async (method: Method, url: string, params?: RequestParams) => {
    try {
        const response = await transport.request({ method, url, data: params || {} });
        return {
            state: ResponseState.SUCCESS,
            data: response.data.data
        };
    } catch (e) {
        return {
            state: ResponseState.ERROR,
            error: {
                code: null, // TODO
                message: JSON.stringify(e)
            }
        };
    }
};

test('GET /api/exchanger/available', async () => {
    const restResponse = await invokeRestApi('GET', '/api/exchanger/available');
    exchanger = restResponse.data[0].name;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/market/list', async () => {
    const restResponse = await invokeRestApi('GET', '/api/market/list');
    market = restResponse.data[0].market;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/exchanger/markets', async () => {
    const restResponse = await invokeRestApi('GET', '/api/exchanger/markets');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/market-data/book/${exchanger}/${marketFrom}/${marketTo}', async () => {
    const [marketFrom, marketTo] = market.toLowerCase().split('-');
    const restResponse = await invokeRestApi('GET', `/api/market-data/book/${exchanger}/${marketFrom}/${marketTo}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/market-data/trades/${exchanger}/${marketFrom}/${marketTo}', async () => {
    const [marketFrom, marketTo] = market.toLowerCase().split('-');
    const restResponse = await invokeRestApi('GET', `/api/market-data/trades/${exchanger}/${marketFrom}/${marketTo}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/market-data/ohlcv/${exchanger}/${marketFrom}/${marketTo}/${group}/${periodFrom}/${periodTo}', async () => {
    const [marketFrom, marketTo] = market.toLowerCase().split('-');
    const group = '1MTH';
    const periodFrom = '';
    const periodTo = '';
    const restResponse = await invokeRestApi('GET', `/api/market-data/ohlcv/${exchanger}/${marketFrom}/${marketTo}/${group}/${periodFrom}/${periodTo}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET `/api/market-data/trades/${exchanger}/${marketFrom}/${marketTo}/${periodFrom}/${periodTo}`}', async () => {
    const [marketFrom, marketTo] = market.toLowerCase().split('-');
    const periodFrom = '';
    const periodTo = '';
    const restResponse = await invokeRestApi('GET', `/api/market-data/trades/${exchanger}/${marketFrom}/${marketTo}/${periodFrom}/${periodTo}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/order/trades-history/${exchanger}/${marketFrom}/${marketTo}', async () => {
    const [marketFrom, marketTo] = market.toLowerCase().split('-');
    const restResponse = await invokeRestApi('GET', `/api/order/trades-history/${exchanger}/${marketFrom}/${marketTo}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/order/open/${exchanger}/${marketFrom}/${marketTo}', async () => {
    const [marketFrom, marketTo] = market.toLowerCase().split('-');
    const restResponse = await invokeRestApi('GET', `/api/order/open/${exchanger}/${marketFrom}/${marketTo}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

// test('GET /api/wallet/balance/${exchanger}/${marketFrom}/${marketTo}', async () => {
//     const [marketFrom, marketTo] = market.toLowerCase().split('-');
//     const restResponse = await invokeRestApi('GET', `/api/wallet/balance/${exchanger}/${marketFrom}/${marketTo}`);
//     expect(restResponse.state).toBe(ResponseState.SUCCESS);
// });
// TODO: not passing if exchanger not connected

test('GET /api/market-data/ticker/${TickerType.PRICE}/${exchanger}', async () => {
    const restResponse = await invokeRestApi(
        'GET',
        `/api/market-data/ticker/${TickerType.PRICE}/${exchanger}`,
        { markets }
    );
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/market-data/ticker/${TickerType.BOOK}/${exchanger}', async () => {
    const restResponse = await invokeRestApi(
        'GET',
        `/api/market-data/ticker/${TickerType.BOOK}/${exchanger}`,
        { markets }
    );
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('POST LIMIT /api/order', async () => {
    const exchanger = 'binance';
    const market = 'btc-usdt';
    const side = 2;
    const amount = '0.04';
    const limitPrice = '70';
    const restResponse = await invokeRestApi(
        'POST', '/api/order', { exchanger, market, side, amount, limitPrice }
    );
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('POST MARKET /api/order', async () => {
    const exchanger = 'binance';
    const market = 'btc-usdt';
    const side = 2;
    const amount = '0.04';
    const restResponse = await invokeRestApi(
        'POST', '/api/order', { exchanger, market, side, amount }
    );
    uuid = restResponse.data.uuid;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('DELETE /api/order/cancel/${uuid}', async () => {
    const restResponse = await invokeRestApi(
        'DELETE', `/api/order/cancel/${uuid}`
    );
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('POST, /api/order/search', async () => {
    const restResponse = await invokeRestApi('POST', '/api/order/search');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('POST, /api/key/general', async () => {
    const restResponse = await invokeRestApi('POST', '/api/key/general', { name: UniqueName });
    generalKey = restResponse.data;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET, /api/key/general/${keyId}', async () => {
    const decodedGeneralKey: any = jwtDecode(generalKey);
    generalKeyId = decodedGeneralKey.generalKeyId;
    const restResponse = await invokeRestApi('GET', `/api/key/general/${decodedGeneralKey.generalKeyId}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET, /api/key/exchangers-data-map', async () => {
    const restResponse = await invokeRestApi('GET', '/api/key/exchangers-data-map');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

let exchangerKeyId = 0;

test('POST, /api/key/exchanger', async () => {
    const data = {
        key: 'test123',
        secret: 'test123'
    };
    const restResponse = await invokeRestApi('POST', '/api/key/exchanger', { exchangerId: 3, name: UniqueName, data: JSON.stringify(data) });
    exchangerKeyId = restResponse.data.id;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('PUT , /api/key/general/${generalKeyId}/exchanger-keys', async () => {
    const restResponse = await invokeRestApi('PUT', `/api/key/general/${generalKeyId}/exchanger-keys`, { exchangerKeyIds: [exchangerKeyId] });
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('DELETE , /api/key/general/${generalKeyId}/exchanger-keys', async () => {
    const restResponse = await invokeRestApi('DELETE', `/api/key/general/${generalKeyId}/exchanger-keys`, { exchangerKeyIds: [exchangerKeyId] });
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('DELETE , /api/key/exchanger/${exchangerKeyId}', async () => {
    const restResponse = await invokeRestApi('DELETE', `/api/key/exchanger/${exchangerKeyId}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

