# Pharos NFT Checker

An [Agent Skill](https://agentskills.io) for checking ERC-721 ownership on the [Pharos Network](https://www.pharos.xyz). Built for the **Pharos Agent Center Skill Builder Campaign**.

Lets an AI agent answer questions like:
- "Does wallet `0xabc...` own any NFTs from `0xdef...`?"
- "Which token IDs does this address hold?"
- "Is this wallet a holder of the collection?"

## How it works

The skill exposes a single script that:
1. Connects to a Pharos RPC (mainnet by default, testnet optional)
2. Calls `balanceOf(wallet)` on the ERC-721 contract
3. If the contract supports `ERC721Enumerable`, also lists the token IDs the wallet owns
4. Returns a clean, human-readable summary

All operations are **read-only**, so there's zero gas cost regardless of network.

## Installation

```bash
git clone https://github.com/<your-username>/pharos-nft-checker.git
cd pharos-nft-checker
npm install
```

Requires Node.js 18+.

## Usage

```bash
node scripts/check_nft.js <walletAddress> <contractAddress> [mainnet|testnet]
```

### Example

```bash
node scripts/check_nft.js \
  0x1234567890abcdef1234567890abcdef12345678 \
  0xabcdef1234567890abcdef1234567890abcdef12 \
  mainnet
```

Output:

```
Wallet:     0x1234567890abcdef1234567890abcdef12345678
Collection: Example Collection (EXC)
Contract:   0xabcdef1234567890abcdef1234567890abcdef12
Network:    Pharos Pacific Ocean Mainnet
Balance:    3 NFT(s)
Token IDs:  17, 42, 108
```

## Using as an Agent Skill

This repo follows the [open Agent Skills format](https://agentskills.io/specification):

```
pharos-nft-checker/
├── SKILL.md          # Metadata + instructions for the agent
├── scripts/
│   └── check_nft.js  # The actual ownership check
├── package.json
└── README.md
```

Agents that support the format (Claude Code, Codex, OpenClaw, and others compatible with Pharos Agent Center) will load `SKILL.md` automatically when a user asks an NFT-ownership question.

## Network details

| Network | Chain ID | RPC |
|---|---|---|
| Mainnet | 1672 | `https://rpc.pharos.xyz` |
| Testnet | 688688 | `https://testnet.dplabs-internal.com` |

## Compatibility

- Any ERC-721 contract for `balanceOf`
- Token ID enumeration only works on contracts that implement `ERC721Enumerable` (many modern collections skip this to save gas — in that case, the skill still returns the balance)

## License

MIT
