import {AxiosRequestConfig, AxiosRequestHeaders, Method} from 'axios';
import RestClass from '@Core/rest';
import {
    CanceledOrder,
    CreatedOrder, ExchangerMarketMap, HistoricalOHLCV, HistoricalTrades,
    MyTrades,
    OpenOrders,
    OrderBookSnapshot, OrderBookTicker, PriceTicker,
    PublicTradesSnapshot,
    Response, Ticker, TickerType,
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
    fetchOhlcv(exchanger: string, market: string, group: string, periodFrom: string, periodTo: string): Promise<Response<HistoricalOHLCV>>;
    fetchHistoricalTrades(exchanger: string, market: string, periodFrom: string, periodTo: string): Promise<Response<HistoricalTrades>>;
    fetchMyTrades(exchanger: string, market: string): Promise<Response<MyTrades>>;
    fetchOpenOrders(exchanger: string, market: string): Promise<Response<OpenOrders>>;
    fetchWalletBalance(exchanger: string, market: string): Promise<Response<WalletBalance>>;
    fetchTicker(exchanger: string, markets: string[], type: TickerType): Promise<Response<Ticker<PriceTicker|OrderBookTicker|null>>>;
    fetchPriceTicker(exchanger: string, markets: string[]): Promise<Response<Ticker<PriceTicker|null>>>;
    fetchOrderBookTicker(exchanger: string, markets: string[]): Promise<Response<Ticker<OrderBookTicker|null>>>;
    fetchExchangerMarkets(): Promise<Response<ExchangerMarketMap>>;
    createOrder(exchanger: string, market: string, side: string, amount: string, limitPrice?: string|null): Promise<Response<CreatedOrder>>;
    createMarketOrder(exchanger: string, market: string, side: string, amount: string): Promise<Response<CreatedOrder>>;
    createLimitOrder(exchanger: string, market: string, side: string, amount: string, limitPrice: string): Promise<Response<CreatedOrder>>;
    cancelOrder(exchanger: string, market: string, uuid: string): Promise<Response<CanceledOrder>>;
}
