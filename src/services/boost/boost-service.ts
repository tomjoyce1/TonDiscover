import { Address, Sender, toNano } from '@ton/core';
import type { TonConnectUI } from '@tonconnect/ui';
import { getReputationContractAddress, sendBoostWithReputationTransaction } from '@/services/reputation/reputation-contract.ts';
import type { BoostOption, BoostState } from '@/types/tondiscover.ts';


export const BOOST_RECEIVER_RAW =
  "0QBegGpGDQL88FDGNHn9fy0heTWuiv35cNfKlvfHnm2ucW2p";
const BOOST_RECEIVER = Address.parse(BOOST_RECEIVER_RAW);

type CreateBoostServiceParams = {
  sender: Sender;
  connected: boolean;
  tonConnectUI: TonConnectUI;
  openConnectModal: () => void;
};

export interface BoostService {
  connectWallet: () => Promise<boolean>;
  activateBoost: (entityId: string, option: BoostOption) => Promise<BoostState>;
  getBoostState: (
    entityId: string,
    states: Record<string, BoostState>
  ) => BoostState;
}

const addHours = (hours: number): string => {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
};

export const createBoostService = ({
  sender,
  connected,
  tonConnectUI,
  openConnectModal,
}: CreateBoostServiceParams): BoostService => {
  return {
    connectWallet: async () => {
      if (connected) {
        return true;
      }

      openConnectModal();
      return false;
    },

    activateBoost: async (entityId, option) => {
      const startedAt = new Date().toISOString();
      const expiresAt = addHours(option.durationHours);

      try {
        if (!connected || !sender.address) {
          throw new Error("Wallet not connected");
        }

        const reputationContract = getReputationContractAddress();

        if (reputationContract) {
          await sendBoostWithReputationTransaction(
            tonConnectUI,
            { address: reputationContract },
            BOOST_RECEIVER,
            option.amountTon,
          );
        } else {
          await sender.send({
            to: BOOST_RECEIVER,
            value: toNano(option.amountTon),
          });
        }

        return {
          entityId,
          status: "active",
          startedAt,
          expiresAt,
          source: "ton",
        };
      } catch {
        return {
          entityId,
          status: "active",
          startedAt,
          expiresAt,
          source: "mock",
        };
      }
    },

    getBoostState: (entityId, states) => {
      return (
        states[entityId] ?? { entityId, status: "inactive", source: "mock" }
      );
    },
  };
};
