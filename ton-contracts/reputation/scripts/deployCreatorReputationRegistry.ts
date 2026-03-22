import { toNano } from '@ton/core';
import { CreatorReputationRegistry } from '../wrappers/CreatorReputationRegistry';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const creatorReputationRegistry = provider.open(
        CreatorReputationRegistry.createFromConfig({}, await compile('CreatorReputationRegistry'))
    );

    await creatorReputationRegistry.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(creatorReputationRegistry.address);

    provider.ui().write(`CreatorReputationRegistry deployed at: ${creatorReputationRegistry.address.toString()}`);
}
