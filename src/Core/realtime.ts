import socketCluster, {AGClientSocket} from 'socketcluster-client';
import {defaultOpts} from '@Core/Realtime/defaultOpts';
import {Stream} from '@Core/Realtime/stream';
import {Rpc} from '@Core/Realtime/rpc';
import * as Rtm from '@Types/realtime';
import {Stream as IStream} from '@Types/stream';
import {Rpc as IRpc} from '@Types/rpc';
import pkg from 'package.json';
import Socket = Rtm.Socket;
import SocketEventName = Rtm.SocketEventName;
import IRealtime = Rtm.Realtime;


export default class Realtime implements IRealtime {

    public readonly rpc: IRpc;
    public readonly stream: IStream;

    private readonly socket: Socket;


    public constructor(apiKey: string, opts?: AGClientSocket.ClientOptions) {
        this.socket = socketCluster.create({
            ...defaultOpts,
            ...opts,
            query: {apiKey, version: pkg.version}
        }) as unknown as Socket;

        this.rpc = new Rpc(this.socket);
        this.stream = new Stream(this.socket, this.rpc);
    }

    public connect = () => this.socket.connect();

    public disconnect = () => this.socket.disconnect();

    public kill = () => {
        this.stream.close();
        this.socket.disconnect();
    };

    public onSocketEvent(socketEventName: SocketEventName, handler?: (arg: any) => void) {
        const consumer = this.socket.listener(socketEventName).createConsumer();
        if (handler && (typeof handler === 'function')) {
            (async () => {
                for await (const eventData of consumer) {
                    handler(eventData);
                }
            })();
        }
        return consumer;
    }

    public getState() {
        return this.socket.state;
    }

    public getSocket() {
        return this.socket;
    }
}
