import {AGClientSocket} from 'socketcluster-client';


export const defaultOpts: AGClientSocket.ClientOptions = {
    hostname: 'ws.exchange-gate.io',
    secure: true,
    port: 443, // 80
    path: '/stream/',
    protocolScheme: 'wss', // ws
    ackTimeout: 10*1000,
    connectTimeout: 5*1000,
    autoConnect: true,
    autoReconnect: true,
    autoReconnectOptions: {
        initialDelay: 2*1000,
        randomness: 5*1000,
        multiplier: 1.5,
        maxDelay: 10*1000
    },
    disconnectOnUnload: true,
    autoSubscribeOnConnect: true
};
