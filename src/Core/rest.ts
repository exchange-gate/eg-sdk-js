import axios, {AxiosInstance, Method} from 'axios';
import {RequestParams, Rest as IRest, Transport, TransportOpts} from '@Types/rest';
import {defaultOpts} from '@Core/Rest/defaultOpts';
import pkg from 'package.json';
import {
    CanceledOrder,
    CreatedOrder, Exchanger, ExchangerKey, ExchangerKeyDataMap, ExchangerKeySecret,
    ExchangerMarketMap, GeneralKey, GeneralKeyExchangers, HistoricalOHLCV, HistoricalTrades, Market,
    MyTrades,
    OpenOrders, Order,
    OrderBookSnapshot,
    OrderBookTicker, OrderSearchCriteria,
    PriceTicker,
    PublicTradesSnapshot,
    Response,
    ResponseState,
    Ticker,
    TickerType,
    WalletBalance
} from '@Types/response';
import {ResponseData} from '@Core/Rest/responseData';


export default class Rest implements IRest {

    protected transport: Transport<AxiosInstance>;


    public constructor(apiKey: string, opts?: TransportOpts) {
        this.transport = axios.create({
            ...defaultOpts,
            ...opts,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': `exchange-gate.io client, ${pkg.name} [v${pkg.version}]`,
                'X-API-KEY': apiKey,
                'Version': pkg.version
            }
        });
    }


    public async invokeRestApi(method: Method, url: string, params?: RequestParams): Promise<Response<any>> {
        try {
            const response = await this.transport.request({method, url, data: params || {}});
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
    }

    public async cancelOrder(exchanger: string, market: string, uuid: string): Promise<Response<CanceledOrder>> {
        const restResponse: Response<any> = await this.invokeRestApi(
            'DELETE', `/api/order/cancel/${uuid}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromCanceledOrder(exchanger, market, restResponse.data)
        };
    }

    public createLimitOrder(exchanger: string, market: string, side: string, amount: string, limitPrice: string): Promise<Response<CreatedOrder>> {
        return this.createOrder(exchanger, market, side, amount, limitPrice);
    }

    public createMarketOrder(exchanger: string, market: string, side: string, amount: string): Promise<Response<CreatedOrder>> {
        return this.createOrder(exchanger, market, side, amount);
    }

    public async createOrder(exchanger: string, market: string, side: string, amount: string, limitPrice?: string | null): Promise<Response<CreatedOrder>> {
        if (!limitPrice) {
            limitPrice = null;
        }
        const restResponse: Response<any> = await this.invokeRestApi(
            'POST', '/api/order', { exchanger, market, side, amount, limitPrice }
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromCreatedOrder(exchanger, market, restResponse.data)
        };
    }

    public async searchOrders(orderSearchCriteria: OrderSearchCriteria): Promise<Response<Order[]>> {
        const restResponse: Response<any> = await this.invokeRestApi(
            'POST', '/api/order/search', orderSearchCriteria
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: restResponse.data
        };
    }

    public async fetchMyTrades(exchanger: string, market: string): Promise<Response<MyTrades>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/order/trades-history/${exchanger}/${marketFrom}/${marketTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromMyTrades(exchanger, market, restResponse.data.trades)
        };
    }

    public async fetchOpenOrders(exchanger: string, market: string): Promise<Response<OpenOrders>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/order/open/${exchanger}/${marketFrom}/${marketTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOpenOrders(exchanger, market, restResponse.data)
        };
    }

    public async fetchOrderBookSnapshot(exchanger: string, market: string): Promise<Response<OrderBookSnapshot>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/market-data/book/${exchanger}/${marketFrom}/${marketTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOrderBookSnapshot(exchanger, market, restResponse.data.book, restResponse.data.sequenceProcessed)
        };
    }

    public async fetchPublicTradesSnapshot(exchanger: string, market: string): Promise<Response<PublicTradesSnapshot>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/market-data/trades/${exchanger}/${marketFrom}/${marketTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromPublicTradesSnapshot(exchanger, market, restResponse.data.trades)
        };
    }

    public async fetchWalletBalance(exchanger: string, market: string): Promise<Response<WalletBalance>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/wallet/balance/${exchanger}/${marketFrom}/${marketTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromWalletBalance(exchanger, market, restResponse.data)
        };
    }

    public async fetchTicker(exchanger: string, markets: string[], type: TickerType): Promise<Response<Ticker<PriceTicker|OrderBookTicker|null>>> {
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/market-data/ticker/${type}/${exchanger}`,
            { markets }
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        const data = ResponseData[type === TickerType.PRICE ? 'FromPriceTicker' : 'FromOrderBookTicker'](
            exchanger,
            restResponse.data.hash,
            restResponse.data.ticker
        );
        return {
            state: ResponseState.SUCCESS,
            data
        };
    }

    public fetchOrderBookTicker(exchanger: string, markets: string[]): Promise<Response<Ticker<OrderBookTicker|null>>> {
        return this.fetchTicker(exchanger, markets, TickerType.BOOK) as Promise<Response<Ticker<OrderBookTicker|null>>>;
    }

    public fetchPriceTicker(exchanger: string, markets: string[]): Promise<Response<Ticker<PriceTicker|null>>> {
        return this.fetchTicker(exchanger, markets, TickerType.PRICE) as Promise<Response<Ticker<PriceTicker|null>>>;
    }

    public async fetchExchangerMarkets(): Promise<Response<ExchangerMarketMap>> {
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            '/api/exchanger/markets'
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromExchangerMarkets(restResponse.data.exchangers)
        };
    }

    public async fetchExchangers(): Promise<Response<Exchanger[]>> {
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            '/api/exchanger/available'
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: restResponse.data
        };
    }

    public async fetchMarkets(): Promise<Response<Market[]>> {
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            '/api/market/list'
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: restResponse.data
        };
    }

    public async fetchOhlcv(exchanger: string, market: string, group: string, periodFrom: string, periodTo: string): Promise<Response<HistoricalOHLCV>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/market-data/ohlcv/${exchanger}/${marketFrom}/${marketTo}/${group}/${periodFrom}/${periodTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOhlcv(restResponse.data)
        };
    }

    public async fetchHistoricalTrades(exchanger: string, market: string, periodFrom: string, periodTo: string): Promise<Response<HistoricalTrades>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            `/api/market-data/trades/${exchanger}/${marketFrom}/${marketTo}/${periodFrom}/${periodTo}`
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromHistoricalTrades(restResponse.data)
        };
    }

    public async createGeneralApiKey(name: string): Promise<Response<GeneralKey>> {
        const restResponse: Response<any> = await this.invokeRestApi('POST', '/api/key/general', { name });

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }

    public async fetchGeneralApiKey(keyId: number): Promise<Response<GeneralKeyExchangers>> {
        const restResponse: Response<any> = await this.invokeRestApi('GET', `/api/key/general/${keyId}`);

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }

    public async fetchExchangerKeyDataMap(): Promise<Response<ExchangerKeyDataMap>> {
        const restResponse: Response<any> = await this.invokeRestApi('GET', '/api/key/exchangers-data-map');

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }

    public async createExchangerKey(exchangerId: number, name: string, data: ExchangerKeySecret): Promise<Response<ExchangerKey>> {
        const restResponse: Response<any> = await this.invokeRestApi('POST', '/api/key/exchanger', { exchangerId, name, data });

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }

    public async addGeneralExchangerKeyLink(generalKeyId: number, exchangerKeyIds: number[]): Promise<Response<boolean>> {
        const restResponse: Response<any> = await this.invokeRestApi('PUT', `/api/key/general/${generalKeyId}/exchanger-keys`, { exchangerKeyIds });

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }

    public async removeGeneralExchangerKeyLink(generalKeyId: number, exchangerKeyIds: number[]): Promise<Response<boolean>> {
        const restResponse: Response<any> = await this.invokeRestApi('DELETE', `/api/key/general/${generalKeyId}/exchanger-keys`, { exchangerKeyIds });

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }

    public async deleteExchangerKey(exchangerKeyId: number): Promise<Response<boolean>> {
        const restResponse: Response<any> = await this.invokeRestApi('DELETE', `/api/key/exchanger/${exchangerKeyId}`);

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return Promise.resolve({
            state: ResponseState.SUCCESS,
            data: restResponse.data
        });
    }
}
