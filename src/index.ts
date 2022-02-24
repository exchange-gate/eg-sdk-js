import {ExchangeGate as IExchangeGate} from '@Types/exchangeGate';
import Realtime from '@Core/realtime';
import Rest from '@Core/rest';


export const ExchangeGate: IExchangeGate = {
    Rest,
    Realtime
};
