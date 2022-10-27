import {Method} from 'axios';
import {
    CanceledOrder,
    CreatedOrder, Deployment, DeploymentConfig,
    DeploymentConfigListItem, DeploymentConfigParams,
    DeploymentListItem, DeploymentLog, DeploymentParams,
    DeploymentRegion,
    DeploymentSearchCriteria,
    DeploymentState,
    DeploymentStateEvent,
    Exchanger,
    ExchangerKey,
    ExchangerKeyDataMap,
    ExchangerKeySecret,
    ExchangerMarketMap,
    GeneralKey,
    GeneralKeyExchangers,
    HistoricalOHLCV,
    HistoricalTrades,
    LimitOrderParams,
    Market,
    MarketOrderParams,
    MyTrades,
    OpenOrders,
    Order,
    OrderBookSnapshot,
    OrderBookTicker,
    OrderParams,
    OrderSearchCriteria,
    PriceTicker,
    PublicTradesSnapshot,
    Response,
    ResponseState,
    Ticker,
    TickerType,
    WalletBalance
} from '@Types/response';
import {RequestParams, Rpc as IRpc} from '@Types/rpc';
import {Socket} from '@Types/realtime';
import {ResponseData} from '@Core/Rest/responseData';


export class Rpc implements IRpc {

    protected socket: Socket;

    public constructor(socket: Socket) {
        this.socket = socket;
    }


    public async invokeRestApi(method: Method, url: string, params?: RequestParams): Promise<Response<any>> {
        try {
            const response = await this.socket.invoke('rest-api', { requestMethod: method, path: url, params });
            return {
                state: ResponseState.SUCCESS,
                data: response
            };
        } catch (e) {
            return {
                state: ResponseState.ERROR,
                error: {
                    code: null, // TODO
                    message: JSON.stringify(e)
                }
            };
        }
    }

    public async fetchMyTrades(exchanger: string, market: string): Promise<Response<MyTrades>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'order/trades-history/:exchanger/:marketFrom/:marketTo',
            { exchanger, marketFrom, marketTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromMyTrades(exchanger, market, rpcResponse.data.trades)
        };
    }

    public async fetchOpenOrders(exchanger: string, market: string): Promise<Response<OpenOrders>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'order/open/:exchanger/:marketFrom/:marketTo',
            { exchanger, marketFrom, marketTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOpenOrders(exchanger, market, rpcResponse.data)
        };
    }

    public async fetchWalletBalance(exchanger: string, market: string): Promise<Response<WalletBalance>> {
        const [marketFrom, marketTo] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'wallet/balance/:exchanger/:marketFrom/:marketTo',
            { exchanger, marketFrom, marketTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromWalletBalance(exchanger, market, rpcResponse.data)
        };
    }

    public async fetchOrderBookSnapshot(exchanger: string, market: string): Promise<Response<OrderBookSnapshot>> {
        const [from, to] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/book/:exchanger/:from/:to',
            { exchanger, from, to }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOrderBookSnapshot(exchanger, market, rpcResponse.data.book, rpcResponse.data.sequenceProcessed)
        };
    }

    public async fetchPublicTradesSnapshot(exchanger: string, market: string): Promise<Response<PublicTradesSnapshot>> {
        const [from, to] = market.toLowerCase().split('-');
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/trades/:exchanger/:from/:to',
            { exchanger, from, to }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromPublicTradesSnapshot(exchanger, market, rpcResponse.data.trades)
        };
    }

    public async fetchTicker(exchanger: string, markets: string[], type: TickerType): Promise<Response<Ticker<PriceTicker|OrderBookTicker|null>>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/ticker/:type/:exchanger',
            { exchanger, markets, type }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        const data = ResponseData[type === TickerType.PRICE ? 'FromPriceTicker' : 'FromOrderBookTicker'](
            exchanger,
            rpcResponse.data.hash,
            rpcResponse.data.ticker
        );
        return {
            state: ResponseState.SUCCESS,
            data
        };
    }

    public fetchOrderBookTicker(exchanger: string, markets: string[]): Promise<Response<Ticker<OrderBookTicker|null>>> {
        return this.fetchTicker(exchanger, markets, TickerType.BOOK) as Promise<Response<Ticker<OrderBookTicker|null>>>;
    }

    public fetchPriceTicker(exchanger: string, markets: string[]): Promise<Response<Ticker<PriceTicker|null>>> {
        return this.fetchTicker(exchanger, markets, TickerType.PRICE) as Promise<Response<Ticker<PriceTicker|null>>>;
    }

    public async fetchExchangerMarkets(): Promise<Response<ExchangerMarketMap>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('GET', 'exchanger/markets');

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromExchangerMarkets(rpcResponse.data.exchangers)
        };
    }

    public async fetchExchangers(): Promise<Response<Exchanger[]>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('GET', 'exchanger/available');

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchMarkets(): Promise<Response<Market[]>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('GET', 'market/list');

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchOhlcv(exchanger: string, market: string, group: string, periodFrom: string, periodTo: string): Promise<Response<HistoricalOHLCV>> {
        const [from, to] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/ohlcv/:exchanger/:from/:to/:group/:periodFrom/:periodTo',
            {exchanger, from, to, group, periodFrom, periodTo}
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromOhlcv(restResponse.data)
        };
    }

    public async fetchHistoricalTrades(exchanger: string, market: string, periodFrom: string, periodTo: string): Promise<Response<HistoricalTrades>> {
        const [from, to] = market.toLowerCase().split('-');
        const restResponse: Response<any> = await this.invokeRestApi(
            'GET',
            'market-data/trades/:exchanger/:from/:to/:periodFrom/:periodTo',
            {exchanger, from, to, periodFrom, periodTo}
        );

        if (restResponse.state === ResponseState.ERROR) {
            return restResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromHistoricalTrades(restResponse.data)
        };
    }

    public async createOrder(orderParams: OrderParams): Promise<Response<CreatedOrder>> {
        const { exchanger, market, side, amount, limitPrice, metaData } = orderParams;
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'order', { exchanger, market, side, amount, limitPrice: limitPrice || null, metaData }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromCreatedOrder(exchanger, market, rpcResponse.data)
        };
    }

    public async searchOrders(orderSearchCriteria?: OrderSearchCriteria): Promise<Response<Order[]>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'order/search', orderSearchCriteria
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public createLimitOrder(limitOrderParams: LimitOrderParams): Promise<Response<CreatedOrder>> {
        return this.createOrder(limitOrderParams);
    }

    public createMarketOrder(marketOrderParams: MarketOrderParams): Promise<Response<CreatedOrder>> {
        return this.createOrder(marketOrderParams);
    }

    public async cancelOrder(exchanger: string, market: string, uuid: string): Promise<Response<CanceledOrder>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'DELETE', 'order/cancel/:uuid', { uuid }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: ResponseData.FromCanceledOrder(exchanger, market, rpcResponse.data)
        };
    }

    public async createGeneralApiKey(name: string): Promise<Response<GeneralKey>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'key/general', { name }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchGeneralApiKey(keyId: number): Promise<Response<GeneralKeyExchangers>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'key/general/:keyId', { keyId }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchExchangerKeyDataMap(): Promise<Response<ExchangerKeyDataMap>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('GET', 'key/exchangers-data-map');

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async createExchangerKey(exchangerId: number, name: string, data: ExchangerKeySecret): Promise<Response<ExchangerKey>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('POST', 'key/exchanger', { exchangerId, name, data: JSON.stringify(data) });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async addGeneralExchangerKeyLink(id: number, exchangerKeyIds: number[]): Promise<Response<boolean>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('PUT', 'key/general/:id/exchanger-keys', { id, exchangerKeyIds });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async removeGeneralExchangerKeyLink(id: number, exchangerKeyIds: number[]): Promise<Response<boolean>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('DELETE', 'key/general/:id/exchanger-keys', { id, exchangerKeyIds });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async deleteExchangerKey(id: number): Promise<Response<boolean>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('DELETE', 'key/exchanger/:id', { id });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async createDeployment(deploymentParams: DeploymentParams): Promise<Response<Deployment>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'deployment', deploymentParams
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async createDeploymentConfig(deploymentConfigParams: DeploymentConfigParams): Promise<Response<DeploymentConfig>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'deployment/config', deploymentConfigParams
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async deleteDeployment(id: number): Promise<Response<boolean>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('DELETE', 'deployment/:id', { id });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async deleteDeploymentConfig(id: number): Promise<Response<boolean>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('DELETE', 'deployment/config/:id', { id });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeployment(id: number): Promise<Response<DeploymentListItem>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'deployment/:id', { id }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeploymentLogs(id: number, periodFrom: string, periodTo: string): Promise<Response<DeploymentLog[]>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'deployment/:id/logs/:periodFrom/:periodTo', { id, periodFrom, periodTo }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeploymentConfig(id: number): Promise<Response<DeploymentConfigListItem>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'deployment/config/:id', { id }
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeploymentConfigs(): Promise<Response<DeploymentConfigListItem[]>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'deployment/configs'
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeploymentRegions(): Promise<Response<DeploymentRegion>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'deployment/regions'
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeploymentStates(): Promise<Response<DeploymentState>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'GET', 'deployment/states'
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async fetchDeployments(deploymentSearchCriteria?: DeploymentSearchCriteria): Promise<Response<DeploymentListItem[]>> {
        const rpcResponse: Response<any> = await this.invokeRestApi(
            'POST', 'deployment/search', deploymentSearchCriteria
        );

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }

    public async updateDeploymentState(id: number, event: DeploymentStateEvent): Promise<Response<boolean>> {
        const rpcResponse: Response<any> = await this.invokeRestApi('PUT', 'deployment/:id', { id, event });

        if (rpcResponse.state === ResponseState.ERROR) {
            return rpcResponse;
        }

        return {
            state: ResponseState.SUCCESS,
            data: rpcResponse.data
        };
    }
}
