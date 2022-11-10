/* eslint-disable no-restricted-imports */
import { ExchangeGate } from '@exchange-gate.io/eg-sdk-js';
import { DeploymentStateEvent, ResponseState } from '@exchange-gate.io/eg-sdk-js/types/src/Types/response';


const config =  {
    timeout: 5*1000,
    baseURL: 'https://staging-api.exchange-gate.io'
};
// eslint-disable-next-line max-len
const egRest = new ExchangeGate.Rest('', config);

let deploymentId = 0;
let deploymentConfigId = 0;

test('fetchDeploymentRegions', async () => {
    const regions = await egRest.fetchDeploymentRegions();
    expect(regions.state).toBe(ResponseState.SUCCESS);
    expect(regions.data).not.toBeUndefined();
});

test('fetchDeploymentStates', async () => {
    const states = await egRest.fetchDeploymentStates();
    expect(states.state).toBe(ResponseState.SUCCESS);
    expect(states.data).not.toBeUndefined();
});

test('createDeployment', async () => {
    const deploymentParams = {
        name: 'JestTest',
        region: 'hetzner-fin',
        limitCpu: 1,
        limitRam: 1,
        limitHdd: 1,
        dockerImageUrl: 'JestTest'
    };
    const deployment = await egRest.createDeployment(deploymentParams);
    if (deployment.data) {
        deploymentId = deployment.data?.id;
    }
    expect(deployment.state).toBe(ResponseState.SUCCESS);
    expect(deployment.data).not.toBeUndefined();
});

test('fetchDeployment', async () => {
    const deployment = await egRest.fetchDeployment(deploymentId);
    expect(deployment.state).toBe(ResponseState.SUCCESS);
    expect(deployment.data).not.toBeUndefined();
});

test('fetchDeployments', async () => {
    const deployments = await egRest.fetchDeployments();
    expect(deployments.state).toBe(ResponseState.SUCCESS);
    expect(deployments.data?.length).toBeGreaterThanOrEqual(1);
});

test('createDeploymentConfig', async () => {
    const deploymentConfigParams = {
        name: 'JestTest',
        dockerImageUrl: 'JestTest'
    };
    const deploymentConfig = await egRest.createDeploymentConfig(deploymentConfigParams);
    if (deploymentConfig.data) {
        deploymentConfigId = deploymentConfig.data.id;
    }
    expect(deploymentConfig.state).toBe(ResponseState.SUCCESS);
    expect(deploymentConfig.data).not.toBeUndefined();
});

test('fetchDeploymentConfig', async () => {
    const config = await egRest.fetchDeploymentConfig(deploymentConfigId);
    expect(config.state).toBe(ResponseState.SUCCESS);
    expect(config.data).not.toBeUndefined();
});

test('fetchDeploymentConfigs', async () => {
    const configs = await egRest.fetchDeploymentConfigs();
    expect(configs.state).toBe(ResponseState.SUCCESS);
    expect(configs.data?.length).toBeGreaterThanOrEqual(1);
});

test('updateDeploymentState - START', async () => {
    const deployment = await egRest.updateDeploymentState(deploymentId , DeploymentStateEvent.START);
    expect(deployment.data).toBe(true);
});

it('4,5 SEC TIMEOUT', done => {
    setTimeout(() => {
        done();
    }, 4500);
});

test('updateDeploymentState - STOP', async () => {
    const deployment = await egRest.updateDeploymentState(deploymentId , DeploymentStateEvent.STOP);
    expect(deployment.data).toBe(true);
});

it('4,5 SEC TIMEOUT', done => {
    setTimeout(() => {
        done();
    }, 4500);
});

test('deleteDeployment', async () => {
    const deployment = await egRest.deleteDeployment(deploymentId);
    expect(deployment.data).toBe(true);
});

test('deleteDeploymentConfig', async () => {
    const config = await egRest.deleteDeploymentConfig(deploymentConfigId);
    expect(config.data).toBe(true);
});
