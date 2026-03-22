import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Address, Cell, toNano } from '@ton/core';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';
import { CreatorReputationRegistry } from '../wrappers/CreatorReputationRegistry';

describe('CreatorReputationRegistry', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CreatorReputationRegistry');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let creator: SandboxContract<TreasuryContract>;
    let registry: SandboxContract<CreatorReputationRegistry>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();
        registry = blockchain.openContract(CreatorReputationRegistry.createFromConfig({}, code));
        deployer = await blockchain.treasury('deployer');
        creator = await blockchain.treasury('creator');

        const deployResult = await registry.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: registry.address,
            deploy: true,
            success: true,
        });
    });

    const expectReputation = async (
        owner: Address,
        expected: { submittedCount: number; boostedCount: number; totalTonSpentNano: bigint },
    ) => {
        const actual = await registry.getReputation(owner);
        expect(actual.submittedCount).toBe(expected.submittedCount);
        expect(actual.boostedCount).toBe(expected.boostedCount);
        expect(actual.totalTonSpentNano).toBe(expected.totalTonSpentNano);
    };

    it('tracks submission count per wallet', async () => {
        await registry.sendRecordSubmission(creator.getSender(), {
            value: toNano('0.02'),
        });

        await expectReputation(creator.address, {
            submittedCount: 1,
            boostedCount: 0,
            totalTonSpentNano: 0n,
        });
    });

    it('tracks boosts and total TON spent per wallet', async () => {
        await registry.sendRecordBoost(creator.getSender(), {
            amountNano: toNano('0.03'),
            value: toNano('0.02'),
        });

        await registry.sendRecordBoost(creator.getSender(), {
            amountNano: toNano('0.07'),
            value: toNano('0.02'),
        });

        await expectReputation(creator.address, {
            submittedCount: 0,
            boostedCount: 2,
            totalTonSpentNano: toNano('0.10'),
        });
    });
});
