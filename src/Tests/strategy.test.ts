/* eslint-disable no-restricted-imports */
import pkg from 'package.json';
import axios, { Method } from 'axios';
import { RequestParams } from '../Types/rest';
import { ResponseState } from '../Types/response';

// eslint-disable-next-line max-len
const API_KEY = '';
const defaultOpts = {
    baseURL: 'https://staging-api.exchange-gate.io',
    timeout: 5 * 1000
};

const transport = axios.create({
    ...defaultOpts,
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': `exchange-gate.io client, ${pkg.name} [v${pkg.version}]`,
        'X-API-KEY': API_KEY,
        'Version': pkg.version
    }
});

let deploymentId = 0;
let deploymentConfigId = 0;

const invokeRestApi = async (method: Method, url: string, params?: RequestParams) => {
    try {
        const response = await transport.request({ method, url, data: params || {} });
        return {
            state: ResponseState.SUCCESS,
            data: response.data.data
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
};

test('GET /deployment/regions', async () => {
    const restResponse = await invokeRestApi('GET', '/api/deployment/regions');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /deployment/states', async () => {
    const restResponse = await invokeRestApi('GET', '/api/deployment/states');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('POST /api/deployment', async () => {
    const deploymentParams = {
        name: 'test1233',
        region: 'hetzner-fin',
        limitCpu: 1,
        limitRam: 1,
        limitHdd: 1,
        dockerImageUrl: 'test1233'
    };
    const restResponse = await invokeRestApi('POST', '/api/deployment', deploymentParams);
    deploymentId = restResponse.data.id;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/deployment/${deploymentId}', async () => {
    const restResponse = await invokeRestApi('GET', `/api/deployment/${deploymentId}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

// test('GET /api/deployment/${id}/logs/${periodFrom}/${periodTo}}', async () => {
//     const periodFrom = '';
//     const periodTo = '';
//     const restResponse = await invokeRestApi('GET', `/api/deployment/${deploymentId}/logs/${periodFrom}/${periodTo}`);
//     expect(restResponse.state).toBe(ResponseState.SUCCESS);
// });
// TODO: not passing because no logs?

test('POST /api/deployment/search', async () => {
    const restResponse = await invokeRestApi('POST', '/api/deployment/search');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('POST /api/deployment/config', async () => {
    const deploymentConfigParams = {
        name: 'teststring',
        dockerImageUrl: 'teststring'
    };
    const restResponse = await invokeRestApi('POST', '/api/deployment/config', deploymentConfigParams);
    deploymentConfigId = restResponse.data.id;
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/deployment/config/${deploymentConfigId}', async () => {
    const restResponse = await invokeRestApi('GET', `/api/deployment/config/${deploymentConfigId}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('GET /api/deployment/configs', async () => {
    const restResponse = await invokeRestApi('GET', '/api/deployment/configs');
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('PUT /api/deployment/${deploymentId}`, { event: START }', async () => {
    const restResponse = await invokeRestApi('PUT', `/api/deployment/${deploymentId}`, { event: 'START' });
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

it('4,5 SEC TIMEOUT', done => {
    setTimeout(() => {
        done();
    }, 4500);
});

test('PUT /api/deployment/${deploymentId}`, { event: STOP }', async () => {
    const restResponse = await invokeRestApi('PUT', `/api/deployment/${deploymentId}`, { event: 'STOP' });
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

it('4,5 SEC TIMEOUT', done => {
    setTimeout(() => {
        done();
    }, 4500);
});

test('DELETE /api/deployment/${deploymentId}', async () => {
    const restResponse = await invokeRestApi('DELETE', `/api/deployment/${deploymentId}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});

test('DELETE /api/deployment/config/${deploymentConfigId}', async () => {
    const restResponse = await invokeRestApi('DELETE', `/api/deployment/config/${deploymentConfigId}`);
    expect(restResponse.state).toBe(ResponseState.SUCCESS);
});
