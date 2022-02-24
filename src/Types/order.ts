export enum OrderType {
    MARKET = 1,
    LIMIT = 2
}
export type OrderSideKeys = keyof typeof OrderSide;
export enum OrderSide {
    BUY = 1,
    SELL = 2
}
export enum OrderState {
    CREATED = 1,
    ERROR = 2,
    CANCELED = 3,
    PARTLY_FILLED = 4,
    FILLED = 5,
    EXPIRED = 6,
    UNKNOWN = 7
}
export enum TradeExecType {
    MAKER = 1,
    TAKER = 2
}

