import {AxiosRequestConfig, AxiosRequestHeaders, Method} from 'axios';
import RestClass from '@Core/rest';
import {
    CanceledOrder,
    CreatedOrder,
    MyTrades,
    OpenOrders,
    OrderBookSnapshot,
    PublicTradesSnapshot,
    Response,
    WalletBalance
} from '@Types/response';


export type Transport<T> = T;
export interface TransportOpts extends AxiosRequestConfig {
    baseUrl?: string;
    headers?: AxiosRequestHeaders;
    timeout: number;
}

export interface RequestParams {
    [param: string]: any;
}

export type RestConstruct = ConstructorParameters<typeof RestClass>;
export interface Rest {
    invokeRestApi(method: Method, url: string, params?: RequestParams): Promise<Response<any>>;

    fetchOrderBookSnapshot(exchanger: string, market: string): Promise<Response<OrderBookSnapshot>>;
    fetchPublicTradesSnapshot(exchanger: string, market: string): Promise<Response<PublicTradesSnapshot>>;
    fetchMyTrades(exchanger: string, market: string): Promise<Response<MyTrades>>;
    fetchOpenOrders(exchanger: string, market: string): Promise<Response<OpenOrders>>;
    fetchWalletBalance(exchanger: string, market: string): Promise<Response<WalletBalance>>;
    createOrder(exchanger: string, market: string, side: string, amount: string, limitPrice?: string|null): Promise<Response<CreatedOrder>>;
    createMarketOrder(exchanger: string, market: string, side: string, amount: string): Promise<Response<CreatedOrder>>;
    createLimitOrder(exchanger: string, market: string, side: string, amount: string, limitPrice: string): Promise<Response<CreatedOrder>>;
    cancelOrder(exchanger: string, market: string, uuid: string): Promise<Response<CanceledOrder>>;
}
