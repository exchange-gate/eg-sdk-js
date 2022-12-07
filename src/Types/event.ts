import {
    PublicTrade as IPublicTrade,
    MyTrade as IMyTrade,
    OrderBookData as IOrderBook,
    OrderBookSideData as IOrderBookSideData,
    PriceTicker as IPriceTicker,
    OrderBookTicker as IOrderBookTicker,
    Ticker
} from '@Types/response';
import {OrderSide, OrderState} from '@Types/order';


export type EventData<T> = T;
export interface Event<T> {
    name: string;
    data: EventData<T>;
}
export enum EventType {
    NEW = 1,
    UPDATE = 2,
    SNAPSHOT = 3
}

export type PublicTrade = IPublicTrade;
export interface MyTrade extends IMyTrade {
    eventType: EventType;
}
export interface OrderBookEvent {
    book: IOrderBook;
    sequenceProcessed: number;
}
export type OrderBookSideData = IOrderBookSideData;
export interface OpenOrder {
    uuid: string;
    state: OrderState;
    amount: string;
    amountFilled: string;
    quoteAmountFilled: string;
    eventType: EventType;
    market?: string;
    side?: OrderSide;
    limitPrice?: string;
}
export interface SubscriptionDetails {
    creditsRemaining: string;
    activeConnections: number;
    allowedConnections: number;
}
export type PriceTicker = Ticker<IPriceTicker|null>;
export type OrderBookTicker = Ticker<IOrderBookTicker|null>;
