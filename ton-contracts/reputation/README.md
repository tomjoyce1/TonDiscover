# Creator Reputation Contract

This workspace contains the TON smart contract used by TonDiscover to track:

- `submittedCount`
- `boostedCount`
- `totalTonSpentNano`

The contract is self-managed:

- any wallet can increase its own submission count
- any wallet can increase its own boost count and TON-spent total
- no wallet can edit another wallet's record

## Files

- `contracts/creator_reputation_registry.tolk`: on-chain logic
- `wrappers/CreatorReputationRegistry.ts`: TypeScript wrapper
- `scripts/deployCreatorReputationRegistry.ts`: deploy script
- `scripts/getCreatorReputationRegistry.ts`: read reputation for a wallet
- `scripts/recordSubmissionCreatorReputationRegistry.ts`: manually record a submission
- `scripts/recordBoostCreatorReputationRegistry.ts`: manually record a boost
- `tests/CreatorReputationRegistry.spec.ts`: sandbox tests

## ELI5 Deploy

1. Open a terminal in `ton-contracts/reputation`
2. Build the contract:
   `.\node_modules\.bin\blueprint.cmd build CreatorReputationRegistry`
3. Deploy to testnet:
   `.\node_modules\.bin\blueprint.cmd run deployCreatorReputationRegistry --testnet`
4. Blueprint will ask you to choose or connect a wallet
5. Approve the deployment transaction
6. Copy the deployed contract address printed in the terminal
7. Put that address into the app env:
   `VITE_CREATOR_REPUTATION_CONTRACT_ADDRESS=<deployed-address>`
8. Restart the Vite app

After that:

- registering while connected will send a submission update to the contract
- boosting while connected will send the boost payment and the reputation update in the same wallet action
- `My Profile -> Identity` will read on-chain metrics when available

## Useful Commands

Build:

```bash
.\node_modules\.bin\blueprint.cmd build CreatorReputationRegistry
```

Test:

```bash
node .\node_modules\jest\bin\jest.js --runInBand --verbose
```

Deploy:

```bash
.\node_modules\.bin\blueprint.cmd run deployCreatorReputationRegistry --testnet
```

Read one wallet's reputation:

```bash
.\node_modules\.bin\blueprint.cmd run getCreatorReputationRegistry --testnet -- <contract-address> <wallet-address>
```
