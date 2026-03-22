import { Address, toNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CreatorReputationRegistry } from '../wrappers/CreatorReputationRegistry';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const contractAddress = Address.parse(args[0] ?? await ui.input('Registry address'));

    if (!(await provider.isContractDeployed(contractAddress))) {
        ui.write(`Contract ${contractAddress.toString()} is not deployed.`);
        return;
    }

    const registry = provider.open(CreatorReputationRegistry.createFromAddress(contractAddress));
    await registry.sendRecordSubmission(provider.sender(), {
        value: toNano('0.02'),
    });

    ui.write('Submission recorded.');
}
