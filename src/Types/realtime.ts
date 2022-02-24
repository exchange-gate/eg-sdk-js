import socketCluster, { AGClientSocket } from 'socketcluster-client';
import WritableConsumableStreamConsumer from 'writable-consumable-stream/consumer';
import ConsumableStream from 'consumable-stream';
import RealtimeClass from '@Core/realtime';
import {Rpc as IRpc} from '@Types/rpc';
import {Stream as IStream} from '@Types/stream';
import {Consumer as IConsumer} from '@Types/realtime';


export type SocketEventName = `${SocketEvent}`;
export enum SocketEvent {
    CONNECT = 'connect',
    CONNECTING = 'connecting',
    CONNECT_ABORT = 'connectAbort',
    ERROR = 'error',
    DISCONNECT = 'disconnect',
    CLOSE = 'close',
    SUBSCRIBE_STATE_CHANGE = 'subscribeStateChange',
    SUBSCRIBE = 'subscribe',
    SUBSCRIBE_REQUEST = 'subscribeRequest',
    SUBSCRIBE_FAIL = 'subscribeFail',
    UNSUBSCRIBE = 'unsubscribe',
    KICK_OUT = 'kickOut'
}

export type Consumer<T> = WritableConsumableStreamConsumer<T>;
export interface SocketConsumableStream<T> extends ConsumableStream<T> {
    createConsumer(timeout?: number): Consumer<T>;
}
export interface Socket extends Omit<AGClientSocket, 'listener'> {
    listener(eventName: SocketEventName): SocketConsumableStream<any>;
}

export type RealtimeConstruct = ConstructorParameters<typeof RealtimeClass>;
export interface Realtime {
    readonly rpc: IRpc;
    readonly stream: IStream;

    connect: () => void;
    disconnect: () => void;
    kill: () => void;
    onSocketEvent: (socketEventName: SocketEventName, handler?: (arg: any) => void) => IConsumer<any>;
    getState: () => socketCluster.AGClientSocket.States;
    getSocket: () => Socket;
}
