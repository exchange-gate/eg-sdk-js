import axios, {AxiosInstance, Method} from 'axios';
import {Transport, TransportOpts, Rest as IRest, RequestParams} from '@Types/rest';
import {defaultOpts} from '@Core/Rest/defaultOpts';
import pkg from 'package.json';
import {
    Response,
    CanceledOrder,
    CreatedOrder,
    MyTrades,
    OpenOrders,
    OrderBookSnapshot,
    PublicTradesSnapshot, WalletBalance, ResponseState
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

    public async createLimitOrder(exchanger: string, market: string, side: string, amount: string, limitPrice: string): Promise<Response<CreatedOrder>> {
        return this.createOrder(exchanger, market, side, amount, limitPrice);
    }

    public async createMarketOrder(exchanger: string, market: string, side: string, amount: string): Promise<Response<CreatedOrder>> {
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
}
