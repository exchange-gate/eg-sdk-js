import AsyncStreamEmitter from 'async-stream-emitter';
import {Rpc} from '@Types/rpc';
import * as IRealtime from '@Types/realtime';
import ConsumableStream from 'consumable-stream';
import {Stream as IStream, StreamSubscription} from '@Types/stream';
import {
    Event,
    EventType,
    MyTrade,
    OpenOrder,
    OrderBookTicker,
    PriceTicker,
    PublicTrade,
    SubscriptionDetails
} from '@Types/event';
import {EventData} from '@Core/Realtime/eventData';
import {OrderBookData as IOrderBook, TickerType} from '@Types/response';
import Socket = IRealtime.Socket;


export class Stream implements IStream {

    protected static NamePrefix: string = 'stream';

    protected socket: Socket;
    protected rpc: Rpc;
    protected subscriptions: Map<string, StreamSubscription<any>> = new Map();
    protected emitter: AsyncStreamEmitter<any> = new AsyncStreamEmitter();

    public constructor(socket: Socket, rpc: Rpc) {
        this.socket = socket;
        this.rpc = rpc;
    }


    public close(channelName?: string): boolean {
        if (!channelName) {
            this.socket.closeAllChannels();
            this.emitter.closeAllListeners();
            this.subscriptions.clear();
            return true;
        }

        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;
        if (!this.subscriptions.has(consumableStreamName)) {
            return false;
        }

        this.socket.unsubscribe(channelName);
        this.socket.closeChannel(channelName);
        this.emitter.closeListener(consumableStreamName);
        this.subscriptions.delete(consumableStreamName);
        return true;
    }

    public publicTrades(exchanger: string, market: string): StreamSubscription<Event<PublicTrade>> {
        const channelName = `stream:trades:${exchanger}:${market}`.toLowerCase();
        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;

        if (this.subscriptions.has(consumableStreamName)) {
            return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<PublicTrade>>;
        }

        const channelDataStore: any = {
            isProcessed: false,
            processedIds: [],
            queue: []
        };
        const emitUnique = (item: any) => {
            if (!channelDataStore.isProcessed) {
                if (channelDataStore.processedIds.includes(item.id)) {
                    return false;
                }
                channelDataStore.processedIds.push(item.id);
            }
            this.emitter.emit(consumableStreamName, EventData.FromPublicTradeEvent(item));
            return true;
        };

        const listener = this.emitter.listener(consumableStreamName);
        this.subscriptions.set(consumableStreamName, this.makeStreamSubscription(channelName, listener));

        (async () => {
            const tradesChannel = this.socket.subscribe(channelName);
            for await (const tradeEvent of tradesChannel) {
                if (channelDataStore.isProcessed) {
                    emitUnique(tradeEvent);
                } else {
                    channelDataStore.queue.push(tradeEvent);
                }
            }
        })();

        (async () => {
            const rpcResponse = await this.rpc.fetchPublicTradesSnapshot(exchanger, market);

            if (!rpcResponse.data) {
                this.close(channelName);
                throw new Error(`RPC failed: publicTrades ${exchanger}/${market}`);
            }

            for (const tradeData of [...rpcResponse.data.trades.reverse(), ...channelDataStore.queue]) {
                emitUnique(tradeData);
            }

            channelDataStore.isProcessed = true;
            channelDataStore.queue.length = 0;
            channelDataStore.processedIds.length = 0;
        })();

        return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<PublicTrade>>;
    }

    public orderBook(exchanger: string, market: string): StreamSubscription<Event<IOrderBook>> {
        const channelName = `stream:book:${exchanger}:${market}`.toLowerCase();
        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;

        if (this.subscriptions.has(consumableStreamName)) {
            return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<IOrderBook>>;
        }

        (async () => {
            const bookChannel = this.socket.subscribe(channelName);
            for await (const bookEvent of bookChannel) {
                this.emitter.emit(consumableStreamName, EventData.FromOrderBook(bookEvent.book));
            }
        })();

        const listener = this.emitter.listener(consumableStreamName);
        this.subscriptions.set(consumableStreamName, this.makeStreamSubscription(channelName, listener));

        return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<IOrderBook>>;
    }

    public myTrades(exchanger: string, market: string): StreamSubscription<Event<MyTrade>> {
        const channelName = `my-trades:${exchanger}:${market}`.toLowerCase();
        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;

        if (this.subscriptions.has(consumableStreamName)) {
            return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<MyTrade>>;
        }

        const channelDataStore: any = {
            isProcessed: false,
            processedIds: [],
            queue: []
        };

        const emitUnique = (item: any) => {
            if (!channelDataStore.isProcessed) {
                if (channelDataStore.processedIds.includes(item.id)) {
                    return false;
                }
                channelDataStore.processedIds.push(item.id);
            }
            this.emitter.emit(consumableStreamName, EventData.FromMyTradeEvent(item));
            return true;
        };

        (async () => {
            const tradesChannel = this.socket.subscribe(channelName);
            for await (const tradeEvent of tradesChannel) {
                if (channelDataStore.isProcessed) {
                    for (const t of tradeEvent.trades) {
                        emitUnique(t);
                    }
                } else {
                    for (const t of tradeEvent.trades) {
                        channelDataStore.queue.push(t);
                    }
                }
            }
        })();

        (async () => {
            const rpcResponse = await this.rpc.fetchMyTrades(exchanger, market);

            if (!rpcResponse.data) {
                this.close(channelName);
                throw new Error(`RPC failed: myTrades ${exchanger}/${market}`);
            }

            const myTradesSnapshot = rpcResponse.data.trades.map(t => ({
                ...t,
                eventType: EventType.SNAPSHOT
            }));
            for (const tradeData of [...myTradesSnapshot, ...channelDataStore.queue]) {
                emitUnique(tradeData);
            }

            channelDataStore.isProcessed = true;
            channelDataStore.queue.length = 0;
            channelDataStore.processedIds.length = 0;
        })();

        const listener = this.emitter.listener(consumableStreamName);
        this.subscriptions.set(consumableStreamName, this.makeStreamSubscription(channelName, listener));

        return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<MyTrade>>;
    }

    public openOrders(exchanger: string, market: string): StreamSubscription<Event<OpenOrder>> {
        const channelName = `my-orders:${exchanger}:${market}`.toLowerCase();
        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;

        if (this.subscriptions.has(consumableStreamName)) {
            return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<OpenOrder>>;
        }

        const channelDataStore: any = {
            isProcessed: false,
            processedIds: [],
            queue: []
        };

        const emitUnique = (item: any) => {
            if (!channelDataStore.isProcessed) {
                if (channelDataStore.processedIds.includes(item.uuid)) {
                    return false;
                }
                channelDataStore.processedIds.push(item.uuid);
            }
            this.emitter.emit(consumableStreamName, EventData.FromOpenOrderEvent(item));
            return true;
        };

        (async () => {
            const ordersChannel = this.socket.subscribe(channelName);
            for await (const orderEvent of ordersChannel) {
                if (channelDataStore.isProcessed) {
                    emitUnique(orderEvent);
                } else {
                    channelDataStore.queue.push(orderEvent);
                }
            }
        })();

        (async () => {
            const openOrders = await this.rpc.fetchOpenOrders(exchanger, market);

            if (!openOrders.data) {
                this.close(channelName);
                throw new Error(`RPC failed: Open orders ${exchanger}/${market}`);
            }

            for (const orderData of [...openOrders.data.orders, ...channelDataStore.queue]) {
                emitUnique(orderData);
            }

            channelDataStore.isProcessed = true;
            channelDataStore.queue.length = 0;
            channelDataStore.processedIds.length = 0;
        })();

        const listener = this.emitter.listener(consumableStreamName);
        this.subscriptions.set(consumableStreamName, this.makeStreamSubscription(channelName, listener));

        return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<OpenOrder>>;
    }

    public async ticker(exchanger: string, markets: string[], type: TickerType): Promise<StreamSubscription<Event<PriceTicker|OrderBookTicker>>> {
        const tickerResp = await this.rpc.fetchTicker(exchanger, markets, type);
        if (!tickerResp.data) {
            throw new Error(`RPC failed: ticker ${type}/${exchanger}/${markets.join('_')}`);
        }

        const channelName = `ticker:${type}:${exchanger}:${tickerResp.data.hash}`;
        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;

        if (this.subscriptions.has(consumableStreamName)) {
            return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<PriceTicker|OrderBookTicker>>;
        }

        (async () => {
            const tickerChannel = this.socket.subscribe(channelName, {data: {markets}});
            for await (const tickerEvent of tickerChannel) {
                const data = EventData[type === TickerType.PRICE ? 'FromPriceTickerEvent' : 'FromOrderBookTickerEvent'](tickerEvent);
                this.emitter.emit(consumableStreamName, data);
            }
        })();

        const listener = this.emitter.listener(consumableStreamName);
        this.subscriptions.set(consumableStreamName, this.makeStreamSubscription(channelName, listener));

        return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<PriceTicker|OrderBookTicker>>;
    }

    public priceTicker(exchanger: string, markets: string[]): Promise<StreamSubscription<Event<PriceTicker>>> {
        return this.ticker(exchanger, markets, TickerType.PRICE) as Promise<StreamSubscription<Event<PriceTicker>>>;
    }

    public orderBookTicker(exchanger: string, markets: string[]): Promise<StreamSubscription<Event<OrderBookTicker>>> {
        return this.ticker(exchanger, markets, TickerType.BOOK) as Promise<StreamSubscription<Event<OrderBookTicker>>>;
    }

    public subscriptionDetails(): StreamSubscription<Event<SubscriptionDetails>> {
        const channelName = 'subscription-details';
        const consumableStreamName = `${Stream.NamePrefix}:${channelName}`;

        if (this.subscriptions.has(consumableStreamName)) {
            return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<SubscriptionDetails>>;
        }

        (async () => {
            const subscriptionDetailsChannel = this.socket.subscribe(channelName);
            for await (const subscriptionDetailsEvent of subscriptionDetailsChannel) {
                this.emitter.emit(consumableStreamName, EventData.FromSubscriptionDetailsEvent(subscriptionDetailsEvent));
            }
        })();

        const listener = this.emitter.listener(consumableStreamName);
        this.subscriptions.set(consumableStreamName, this.makeStreamSubscription(channelName, listener));

        return this.subscriptions.get(consumableStreamName) as StreamSubscription<Event<SubscriptionDetails>>;
    }

    protected makeStreamSubscription(channelName: string, listener: ConsumableStream<any>): StreamSubscription<any> {
        return {
            channelName,
            consumer: () => listener.createConsumer(),
            close: () => this.close(channelName)
        };
    };
}
