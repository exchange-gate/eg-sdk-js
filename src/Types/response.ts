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
    exchanger: string;
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
    exchanger: string;
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
    exchanger: string;
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
    exchanger: string;
    market: string;
    orders: OpenOrder[];
}
export interface WalletBalance {
    exchanger: string;
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
    exchanger: string;
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
export interface CanceledOrder {
    exchanger: string;
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
export interface ExchangerMarket {
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
    exchanger: string;
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
    exchanger: string;
    market: string;
    trades: HistoricalTrade[];
}

export type GeneralKey = string;
