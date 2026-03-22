import {
    Address,
    beginCell,
    Cell,
    Contract,
    ContractABI,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleBuilder
} from '@ton/core';

export type CreatorReputationRegistryConfig = {};

export function creatorReputationRegistryConfigToCell(config: CreatorReputationRegistryConfig): Cell {
    return beginCell().storeDict(null).endCell();
}

export const CreatorReputationRegistryOpcodes = {
    recordSubmission: 0x5355424d,
    recordBoost: 0x424f4f53,
};

export class CreatorReputationRegistry implements Contract {
    abi: ContractABI = { name: 'CreatorReputationRegistry' }

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new CreatorReputationRegistry(address);
    }

    static createFromConfig(config: CreatorReputationRegistryConfig, code: Cell, workchain = 0) {
        const data = creatorReputationRegistryConfigToCell(config);
        const init = { code, data };
        return new CreatorReputationRegistry(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendRecordSubmission(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(CreatorReputationRegistryOpcodes.recordSubmission, 32)
                .endCell(),
        });
    }

    async sendRecordBoost(
        provider: ContractProvider,
        via: Sender,
        opts: {
            amountNano: bigint;
            value: bigint;
        }
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(CreatorReputationRegistryOpcodes.recordBoost, 32)
                .storeUint(opts.amountNano, 128)
                .endCell(),
        });
    }

    async getReputation(provider: ContractProvider, owner: Address) {
        const args = new TupleBuilder();
        args.writeAddress(owner);
        const result = await provider.get('get_reputation', args.build());
        return {
            submittedCount: result.stack.readNumber(),
            boostedCount: result.stack.readNumber(),
            totalTonSpentNano: result.stack.readBigNumber(),
        };
    }
}
