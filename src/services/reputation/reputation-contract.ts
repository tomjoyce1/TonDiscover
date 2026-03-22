import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  fromNano,
  Sender,
  SendMode,
  TupleBuilder,
  toNano,
} from '@ton/core';
import type { TonClient } from '@ton/ton';
import type { TonConnectUI } from '@tonconnect/ui';
import type { CreatorActivityMetrics, ReputationSnapshot } from '@/types/tondiscover.ts';
import { EMPTY_CREATOR_ACTIVITY } from '@/services/reputation/creator-activity.ts';

const RECORD_SUBMISSION_OPCODE = 0x5355424d;
const RECORD_BOOST_OPCODE = 0x424f4f53;
const REPUTATION_MESSAGE_VALUE = toNano('0.02');

type ReputationContractConfig = {
  address: Address;
};

export class CreatorReputationRegistryContract implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

  static createFromAddress(address: Address) {
    return new CreatorReputationRegistryContract(address);
  }

  async sendRecordSubmission(provider: ContractProvider, via: Sender, value = REPUTATION_MESSAGE_VALUE) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: buildRecordSubmissionBody(),
    });
  }

  async sendRecordBoost(
    provider: ContractProvider,
    via: Sender,
    amountNano: bigint,
    value = REPUTATION_MESSAGE_VALUE,
  ) {
    await provider.internal(via, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: buildRecordBoostBody(amountNano),
    });
  }

  async getReputation(provider: ContractProvider, owner: Address): Promise<CreatorActivityMetrics> {
    const args = new TupleBuilder();
    args.writeAddress(owner);

    const { stack } = await provider.get('get_reputation', args.build());
    const submittedCount = stack.readNumber();
    const boostedCount = stack.readNumber();
    const totalTonSpentNano = stack.readBigNumber();

    return {
      submittedCount,
      boostedCount,
      totalTonSpentNano: totalTonSpentNano.toString(),
      totalTonSpentTon: fromNano(totalTonSpentNano),
    };
  }
}

export const getReputationContractAddress = (): Address | null => {
  const configured = import.meta.env.VITE_CREATOR_REPUTATION_CONTRACT_ADDRESS?.trim();
  if (!configured) {
    return null;
  }

  try {
    return Address.parse(configured);
  } catch {
    return null;
  }
};

export const hasReputationContract = (): boolean => {
  return getReputationContractAddress() !== null;
};

export const buildRecordSubmissionBody = (): Cell => {
  return beginCell()
    .storeUint(RECORD_SUBMISSION_OPCODE, 32)
    .endCell();
};

export const buildRecordBoostBody = (amountNano: bigint): Cell => {
  return beginCell()
    .storeUint(RECORD_BOOST_OPCODE, 32)
    .storeUint(amountNano, 128)
    .endCell();
};

export const getOnChainReputation = async (
  tonClient: TonClient | undefined,
  walletAddress?: Address | null,
): Promise<ReputationSnapshot | null> => {
  const contractAddress = getReputationContractAddress();
  if (!tonClient || !walletAddress || !contractAddress) {
    return null;
  }

  try {
    const contract = tonClient.open(CreatorReputationRegistryContract.createFromAddress(contractAddress));
    const reputation = await contract.getReputation(walletAddress);
    return {
      ...reputation,
      source: 'ton',
    };
  } catch {
    return null;
  }
};

export const sendSubmissionReputationTransaction = async (
  tonConnectUI: TonConnectUI,
  contractAddress: Address,
) => {
  await tonConnectUI.sendTransaction({
    messages: [
      {
        address: contractAddress.toString(),
        amount: REPUTATION_MESSAGE_VALUE.toString(),
        payload: buildRecordSubmissionBody().toBoc().toString('base64'),
      },
    ],
    validUntil: Math.floor(Date.now() / 1000) + 5 * 60,
  });
};

export const sendBoostWithReputationTransaction = async (
  tonConnectUI: TonConnectUI,
  contractConfig: ReputationContractConfig | null,
  boostReceiver: Address,
  boostAmountTon: string,
) => {
  const messages: Array<{ address: string; amount: string; payload?: string }> = [
    {
      address: boostReceiver.toString(),
      amount: toNano(boostAmountTon).toString(),
    },
  ];

  if (contractConfig) {
    messages.push({
      address: contractConfig.address.toString(),
      amount: REPUTATION_MESSAGE_VALUE.toString(),
      payload: buildRecordBoostBody(toNano(boostAmountTon)).toBoc().toString('base64'),
    });
  }

  await tonConnectUI.sendTransaction({
    messages,
    validUntil: Math.floor(Date.now() / 1000) + 5 * 60,
  });
};

export const buildLocalReputationSnapshot = (metrics: CreatorActivityMetrics): ReputationSnapshot => {
  return {
    ...EMPTY_CREATOR_ACTIVITY,
    ...metrics,
    source: 'local',
  };
};
