import {Method} from 'axios';
import {
    CanceledOrder,
    CreatedOrder,
    MyTrades,
    OpenOrders,
    OrderBookSnapshot,
    PublicTradesSnapshot,
    Response,
    ResponseState,
    WalletBalance
} from '@Types/response';
import {RequestParams, Rpc as IRpc} from '@Types/rpc';
import {Socket} from '@Types/realtime';
import {ResponseData} from '@Core/Rest/responseData';


export class Rpc implements IRpc {

    protected socket: Socket;

    public constructor(socket: Socket) {
        this.socket = socket;
    }


    public async invokeRestApi(method: Method, url: string, params: RequestParams): Promise<Response<any>> {
        try {
            const response = await this.socket.invoke('rest-api', { requestMethod: method, path: url, params });
            return {
                state: ResponseState.SUCCESS,
                data: response
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

    public async fetchMyTrades(exchanger: string, market: string): Promise<Response<MyTrades>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'order/trades-history/:exchanger/:marketFrom/:marketTo',
            { exchanger, marketFrom, marketTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromMyTrades(exchanger, market, rpcResponse.data.trades)
        };
    }

    public async fetchOpenOrders(exchanger: string, market: string): Promise<Response<OpenOrders>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'order/open/:exchanger/:marketFrom/:marketTo',
            { exchanger, marketFrom, marketTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOpenOrders(exchanger, market, rpcResponse.data)
        };
    }

    public async fetchWalletBalance(exchanger: string, market: string): Promise<Response<WalletBalance>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'wallet/balance/:exchanger/:marketFrom/:marketTo',
            { exchanger, marketFrom, marketTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromWalletBalance(exchanger, market, rpcResponse.data)
        };
    }

    public async fetchOrderBookSnapshot(exchanger: string, market: string): Promise<Response<OrderBookSnapshot>> {
        const [from, to] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/book/:exchanger/:from/:to',
            { exchanger, from, to }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOrderBookSnapshot(exchanger, market, rpcResponse.data.book, rpcResponse.data.sequenceProcessed)
        };
    }

    public async fetchPublicTradesSnapshot(exchanger: string, market: string): Promise<Response<PublicTradesSnapshot>> {
        const [from, to] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/trades/:exchanger/:from/:to',
            { exchanger, from, to }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromPublicTradesSnapshot(exchanger, market, rpcResponse.data.trades)
        };
    }

    public async createOrder(exchanger: string, market: string, side: string, amount: string, limitPrice?: string|null): Promise<Response<CreatedOrder>> {
        if (!limitPrice) {
            limitPrice = null;
        }
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'order', { exchanger, market, side, amount, limitPrice }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromCreatedOrder(exchanger, market, rpcResponse.data)
        };
    }

    public async createLimitOrder(exchanger: string, market: string, side: string, amount: string, limitPrice: string): Promise<Response<CreatedOrder>> {
        return this.createOrder(exchanger, market, side, amount, limitPrice);
    }

    public async createMarketOrder(exchanger: string, market: string, side: string, amount: string): Promise<Response<CreatedOrder>> {
        return this.createOrder(exchanger, market, side, amount);
    }

    public async cancelOrder(exchanger: string, market: string, uuid: string): Promise<Response<CanceledOrder>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'DELETE', 'order/cancel/:uuid', { uuid }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromCanceledOrder(exchanger, market, rpcResponse.data)
        };
    }
}
