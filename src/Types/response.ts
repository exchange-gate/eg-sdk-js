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
