import ConsumableStream from 'consumable-stream';
import {Event, MyTrade, OpenOrder, OrderBook, PublicTrade, SubscriptionDetails} from '@Types/event';


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
    subscriptionDetails(): StreamSubscription<Event<SubscriptionDetails>>;
}
