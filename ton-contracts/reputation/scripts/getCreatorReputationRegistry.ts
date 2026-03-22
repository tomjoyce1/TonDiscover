import { Address, fromNano } from '@ton/core';
import { NetworkProvider } from '@ton/blueprint';
import { CreatorReputationRegistry } from '../wrappers/CreatorReputationRegistry';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const contractAddress = Address.parse(args[0] ?? await ui.input('Registry address'));
    const ownerAddress = Address.parse(args[1] ?? await ui.input('Creator wallet address'));

    if (!(await provider.isContractDeployed(contractAddress))) {
        ui.write(`Contract ${contractAddress.toString()} is not deployed.`);
        return;
    }

    const registry = provider.open(CreatorReputationRegistry.createFromAddress(contractAddress));
    const reputation = await registry.getReputation(ownerAddress);

    ui.write(`Submitted: ${reputation.submittedCount}`);
    ui.write(`Boosts: ${reputation.boostedCount}`);
    ui.write(`Total TON spent: ${fromNano(reputation.totalTonSpentNano)}`);
}
