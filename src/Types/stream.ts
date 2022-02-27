import ConsumableStream from 'consumable-stream';
import {
    Event,
    MyTrade,
    OpenOrder,
    OrderBook,
    OrderBookTicker,
    PriceTicker,
    PublicTrade,
    SubscriptionDetails
} from '@Types/event';
import {TickerType} from '@Types/response';


export interface StreamSubscription<T> {
    channelName: string;
    consumer(): ConsumableStream.Consumer<T>;
    close(): boolean;
}

export interface Stream {
    close(channelName?: string): boolean;
    publicTrades(exchanger: string, market: string): StreamSubscription<Event<PublicTrade>>;
    orderBook(exchanger: string, market: string, emitTimeout: number): StreamSubscription<Event<OrderBook>>;
    myTrades(exchanger: string, market: string): StreamSubscription<Event<MyTrade>>;
    openOrders(exchanger: string, market: string): StreamSubscription<Event<OpenOrder>>;
    ticker(exchanger: string, markets: string[], type: TickerType): Promise<StreamSubscription<Event<PriceTicker|OrderBookTicker>>>;
    priceTicker(exchanger: string, markets: string[]): Promise<StreamSubscription<Event<PriceTicker>>>;
    orderBookTicker(exchanger: string, markets: string[]): Promise<StreamSubscription<Event<OrderBookTicker>>>;
    subscriptionDetails(): StreamSubscription<Event<SubscriptionDetails>>;
}
