import {Realtime as IRealtime, RealtimeConstruct} from '@Types/realtime';
import {Rest as IRest, RestConstruct} from '@Types/rest';


export interface ExchangeGate {
    Realtime: new(...args: RealtimeConstruct) => IRealtime;
    Rest: new(...args: RestConstruct) => IRest;
}
