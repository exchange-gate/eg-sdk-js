import {OrderSide, OrderState, OrderType, TradeExecType} from '@Types/order';


export type ResponseData<T> = T;
export enum ResponseState {
    SUCCESS = 'success',
    ERROR = 'error',
}
export interface Response<T> {
    state: ResponseState;
    data?: ResponseData<T>;
    error?: {
        code: any;
        message: string;
    };
}

export type BidPrice = string;
export type BidAmount = string;
export type OrderBookSideData = [BidPrice, BidAmount];
export interface OrderBookData {
    bids: OrderBookSideData[];
    asks: OrderBookSideData[];
}
export interface OrderBookSnapshot {
    exchanger: ExchangerName;
    market: string;
    book: OrderBookData;
    sequenceProcessed: number;
}
export interface PublicTrade {
    id: number;
    time: number;
    timeConsumed: number;
    timeReceived: number;
    price: string;
    amount: string;
    side: OrderSide;
}
export interface PublicTradesSnapshot {
    exchanger: ExchangerName;
    market: string;
    trades: PublicTrade[];
}
export interface MyTrade {
    id: number;
    orderId: string;
    time: number;
    price: string;
    amount: string;
    commission: string;
    side: OrderSide;
    execType: TradeExecType;
}
export interface MyTrades {
    exchanger: ExchangerName;
    market: string;
    trades: MyTrade[];
}
export interface OpenOrder {
    market: string;
    uuid: string;
    side: OrderSide;
    state: OrderState;
    limitPrice: string;
    amount: string;
    amountFilled: string;
    quoteAmountFilled: string;
}
export interface OpenOrders {
    exchanger: ExchangerName;
    market: string;
    orders: OpenOrder[];
}
export interface OrderTrade {
    tradeId: number;
    price: string;
    amount: string;
    commission: string;
    executionType: string;
    createdAt: string;
    commissionCurrency: string;
}
export interface OrderMeta {
    [key: string]: string;
}
export interface Order {
    uuid: string;
    orderId: number;
    generalKeyId: number;
    exchangerId: number;
    marketId: number;
    exchangerMarketId: number;
    amount: string;
    amountFilled: string|null;
    quoteAmountFilled: string|null;
    limitPrice: string|null;
    side: string;
    type: string;
    state: string;
    responseFull: string|null;
    metaData: OrderMeta|null;
    createdAt: string;
    updatedAt: string;
    exchanger: string;
    market: string;
    trades: OrderTrade[];
}
export interface OrderSearchCriteria {
    exchangerIds?: ExchangerId[];
    marketIds?: MarketId[];
    exchangerMarketIds?: ExchangerMarketId[];
    state?: OrderState[];
    side?: OrderSide[];
    type?: OrderType[];
    meta?: OrderMeta;
    periodFrom?: string;
    periodTo?: string;
    sort?: 'asc'|'desc';
    limit?: number;
}
export interface WalletBalance {
    exchanger: ExchangerName;
    market: string;
    balance: {
        [currency: string]: {
            locked: string;
            available: string;
        };
    };
}
export interface CreatedOrderTrade {
    id: number;
    price: string;
    amount: string;
    commission: string;
    commissionCurrency: string;
    commissionCurrencyId: number;
    execType: TradeExecType;
}
export interface CreatedOrder {
    exchanger: ExchangerName;
    market: string;
    order: {
        id: number;
        uuid: string;
        state: OrderState;
        type: OrderType;
        amountFilled: string;
        quoteAmountFilled: string;
        trades: CreatedOrderTrade[];
    };
}
export interface OrderParams {
    exchanger: ExchangerName;
    market: string;
    side: OrderSide;
    amount: string;
    limitPrice?: number;
    timestamp?: number;
    metaData?: OrderMeta;
}
export type MarketOrderParams = Omit<OrderParams, 'limitPrice'>;
export interface LimitOrderParams extends Omit<OrderParams, 'limitPrice'> {
    limitPrice: number;
}
export interface CanceledOrder {
    exchanger: ExchangerName;
    market: string;
    order: {
        uuid: string;
        state: OrderState;
        amountFilled: string;
        quoteAmountFilled: string;
    };
}
export interface PriceTicker {
    market: string;
    price: string;
    time: number;
    side: OrderSide;
}
export interface OrderBookTicker {
    market: string;
    book: {
        bid: OrderBookSideData;
        ask: OrderBookSideData;
    };
    time: number;
}
export enum TickerType {
    PRICE = 'price',
    BOOK = 'book'
}
export interface TickerMap<T> {
    [market: string]: T;
}
export interface Ticker<T> {
    exchanger: string;
    ticker: TickerMap<T>;
    hash: string;
}
export type ExchangerId = number;
export type ExchangerName = string;
export interface Exchanger {
    id: ExchangerId;
    name: ExchangerName;
    isActive: boolean;
    isTradable: boolean;
}
export type MarketId = number;
export interface Market {
    id: MarketId;
    market: string;
    isActive: boolean;
}
export type ExchangerMarketId = number;
export interface ExchangerMarket {
    id: ExchangerMarketId;
    market: string;
    isActive: boolean;
    isTradable: boolean;
    orderLimits: any; // TODO
}
export interface ExchangerMarketMap {
    [exchanger: string]: {
        [market: string]: ExchangerMarket;
    };
}
export interface OHLCV {
    periodFrom: string;
    periodTo: string;
    timeOpen: string;
    timeClose: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
    trades: number;
}
export interface HistoricalOHLCV {
    exchanger: ExchangerName;
    market: string;
    ohlcv: OHLCV[];
}

export interface HistoricalTrade {
    id: number;
    time: string;
    price: string;
    amount: string;
    side: number;
}
export interface HistoricalTrades {
    exchanger: ExchangerName;
    market: string;
    trades: HistoricalTrade[];
}

export type GeneralKey = string;
export interface Exchanger {
    id: number;
    name: ExchangerName;
}
export interface ExchangerKey {
    id: number;
    name: string;
    exchanger?: Exchanger[];
}
export interface GeneralKeyExchangers {
    id: number;
    name: string;
    exchangerKeys: ExchangerKey[];
}
export type KeySecretValue = string;
export type KeySecret = string;
export interface ExchangerKeySecret {
    [keySecret: KeySecret]: KeySecretValue;
}
export interface ExchangerKeyData {
    data: KeySecret;
    label: string;
}
export interface ExchangerKeyDataMap {
    [exchanger: ExchangerName]: ExchangerKeyData[];
}

export interface DeploymentConfig {
    id: number;
    name: string;
    dockerImageUrl: string;
    dockerContainerCommand: string;
    dockerContainerEnv: JsonString;
}
export type Region = string;
export interface DeploymentRegion {
    [region: Region]: {
        id: number;
        name: ExchangerName;
        latency: number;
    }[];
}
export type DeploymentStateId = number;
export enum DeploymentState {
    CREATED = 1,
    STARTING = 2,
    ACTIVE = 3,
    STOPPING = 4,
    INACTIVE = 5,
    DELETING = 6,
    FAILED = 7,
    DELETED = 8
}
export enum DeploymentStateEvent {
    START = 'START',
    STOP = 'STOP',
    DELETE = 'DELETE'
}
export interface DeploymentMeta {
    [key: string]: string;
}
export interface Deployment {
    id: number;
    configId: number;
    name: string;
    region: Region;
    limitCpu: number;
    limitRam: number;
    limitHdd: number;
    dockerImageUrl: string;
    dockerContainerCommand: string;
    dockerContainerEnv: string;
    metaData: JsonString;
    state: {
        id: DeploymentStateId;
        value: keyof typeof DeploymentState;
    };
    availableEvents: (keyof typeof DeploymentStateEvent)[];
}
export interface DeploymentListItem extends Omit<Deployment, 'metaData'> {
    metaData: DeploymentMeta;
    createdAt: string;
    config: DeploymentConfig;
}
export type JsonString = string;
export interface DeploymentConfigListItem extends Omit<DeploymentConfig, 'dockerContainerEnv'> {
    dockerContainerEnv: string[];
}
export interface DeploymentSearchCriteria {
    region?: Region;
    state?: DeploymentStateId[];
    meta?: DeploymentMeta;
    periodFrom?: string;
    periodTo?: string;
    sort?: 'asc'|'desc';
    limit?: number;
}
export interface DeploymentParams {
    name: string;
    region: Region;
    limitCpu: number;
    limitRam: number;
    limitHdd: number;
    configId?: number;
    dockerImageUrl?: string;
    dockerContainerCommand?: string;
    dockerContainerEnv?: string[];
    metaData?: DeploymentMeta;
}
export interface DeploymentConfigParams {
    name: string;
    dockerImageUrl: string;
    dockerContainerCommand?: string;
    dockerContainerEnv?: string[];
}
