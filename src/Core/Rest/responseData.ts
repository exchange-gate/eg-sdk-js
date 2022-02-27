import {
    CanceledOrder,
    CreatedOrder, ExchangerMarketMap,
    MyTrades,
    OpenOrders,
    OrderBookData,
    OrderBookSnapshot, OrderBookTicker, PriceTicker,
    PublicTradesSnapshot, Ticker, TickerMap,
    WalletBalance
} from '@Types/response';
import {OrderSide} from '@Types/order';


export class ResponseData {
    public static FromMyTrades(exchanger: string, market: string, trades: any[]): MyTrades {
        return {
            exchanger,
            market,
            trades: trades.map((t: any) => ({
                id: t.id,
                orderId: t.orderId,
                time: t.execTs,
                price: t.price,
                amount: t.amount,
                commission: t.commission,
                side: t.side,
                execType: t.execType
            }))
        };
    }
    public static FromOrderBookSnapshot(exchanger: string, market: string, book: OrderBookData, sequenceProcessed: number): OrderBookSnapshot {
        return { exchanger, market, book, sequenceProcessed };
    }
    public static FromPublicTradesSnapshot(exchanger: string, market: string, trades: any[]): PublicTradesSnapshot {
        return {
            exchanger,
            market,
            trades: trades.map((t: any) => ({
                id: t.id,
                time: t.time,
                timeConsumed: t.timeReceived,
                timeReceived: Date.now(),
                price: t.price,
                amount: t.quantity,
                side: t.buy ? OrderSide.BUY : OrderSide.SELL
            }))
        };
    }
    public static FromOpenOrders(exchanger: string, market: string, orders: any[]): OpenOrders {
        return {
            exchanger,
            market,
            orders: orders.map((o: any) => ({
                market,
                uuid: o.uuid,
                side: o.side === 'BUY' ? OrderSide.BUY : OrderSide.SELL,
                state: o.state,
                limitPrice: o.limitPrice,
                amount: o.amount,
                amountFilled: o.amountFilled,
                quoteAmountFilled: o.quoteAmountFilled
            }))
        };
    }
    public static FromCreatedOrder(exchanger: string, market: string, order: any): CreatedOrder {
        return {
            exchanger,
            market,
            order: {
                id: order.orderId,
                uuid: order.uuid,
                state: order.state,
                type: order.type,
                amountFilled: order.amountFilled || '0',
                quoteAmountFilled: order.quoteAmountFilled || '0',
                trades: order.trades ? order.trades.map((t: any) => ({
                    id: t.tradeId,
                    price: t.price,
                    amount: t.amount,
                    commission: t.commission,
                    commissionCurrency: t.commissionCurrency,
                    commissionCurrencyId: t.commissionCurrencyId,
                    execType: t.execType
                })) : []
            }
        };
    }
    public static FromCanceledOrder(exchanger: string, market: string, order: any): CanceledOrder {
        return {
            exchanger,
            market,
            order: {
                uuid: order.uuid,
                state: order.state,
                amountFilled: order.amountFilled,
                quoteAmountFilled: order.quoteAmountFilled
            }
        };
    }
    public static FromWalletBalance(exchanger: string, market: string, balance: any): WalletBalance {
        const [baseCurrency, quoteCurrency] = market.toLowerCase().split('-');
        return {
            exchanger,
            market,
            balance: {
                [baseCurrency]: {
                    locked: balance[baseCurrency].locked,
                    available: balance[baseCurrency].available
                },
                [quoteCurrency]: {
                    locked: balance[quoteCurrency].locked,
                    available: balance[quoteCurrency].available
                }
            }
        };
    }
    public static FromPriceTicker(exchanger: string, hash: string, ticker: TickerMap<PriceTicker>): Ticker<PriceTicker|null> {
        return {
            exchanger,
            ticker,
            hash
        };
    }
    public static FromOrderBookTicker(exchanger: string, hash: string, ticker: TickerMap<OrderBookTicker>): Ticker<OrderBookTicker|null> {
        return {
            exchanger,
            ticker,
            hash
        };
    }
    public static FromExchangerMarkets(exchangerMarkets: ExchangerMarketMap): ExchangerMarketMap {
        return exchangerMarkets;
    }
}
