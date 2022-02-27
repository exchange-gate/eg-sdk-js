import {OrderSide} from '@Types/order';
import {
    Event,
    MyTrade,
    OpenOrder,
    OrderBook,
    PublicTrade,
    SubscriptionDetails,
    EventType,
    PriceTicker, OrderBookTicker
} from '@Types/event';
import {ExchangerMarketMap, OrderBookData as IOrderBook, Ticker} from '@Types/response';


export class EventData {
    public static FromPublicTradeEvent(trade: any): Event<PublicTrade> {
        return {
            name: 'publicTrades',
            data: {
                id: trade.id,
                time: trade.time,
                timeConsumed: trade.timeReceived,
                timeReceived: Date.now(),
                price: trade.price,
                amount: trade.amount || trade.quantity,
                side: trade.side || trade.buy ? OrderSide.BUY : OrderSide.SELL
            }
        };
    }
    public static FromOrderBookEvent(book: IOrderBook, sequenceProcessed: number): Event<OrderBook> {
        return {
            name: 'orderBook',
            data: {
                book,
                sequenceProcessed
            }
        };
    }
    public static FromMyTradeEvent(trade: any): Event<MyTrade> {
        return {
            name: 'myTrades',
            data: {
                id: trade.id,
                orderId: trade.orderId,
                time: trade.execTs || trade.time,
                price: trade.price,
                amount: trade.amount,
                commission: trade.commission,
                side: trade.side,
                execType: trade.execType,
                eventType: trade.eventType || EventType.NEW
            }
        };
    }
    public static FromOpenOrderEvent(order: any): Event<OpenOrder> {
        return {
            name: 'openOrders',
            data: {
                uuid: order.uuid,
                state: order.state,
                amount: order.amount,
                amountFilled: order.amountFilled,
                quoteAmountFilled: order.quoteAmountFilled,
                eventType: order.eventType || EventType.SNAPSHOT,
                ...(order.market && {market: order.market}),
                ...(order.side && {side: order.side}),
                ...(order.limitPrice && {limitPrice: order.limitPrice})
            }
        };
    }
    public static FromSubscriptionDetailsEvent(subscription: any): Event<SubscriptionDetails> {
        return {
            name: 'subscriptionDetails',
            data: {
                creditsRemaining: subscription.creditsRemaining,
                activeConnections: subscription.activeConnections,
                allowedConnections: subscription.allowedConnections
            }
        };
    }
    public static FromPriceTickerEvent(ticker: PriceTicker): Event<PriceTicker> {
        return {
            name: 'priceTicker',
            data: ticker
        };
    }
    public static FromOrderBookTickerEvent(ticker: OrderBookTicker): Event<OrderBookTicker> {
        return {
            name: 'orderBookTicker',
            data: ticker
        };
    }
}
