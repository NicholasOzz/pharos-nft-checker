---
name: pharos-nft-checker
description: Check NFT ownership on the Pharos Network. Use this skill whenever a user asks whether a wallet owns a specific NFT collection, how many NFTs from a collection an address holds, which token IDs a wallet owns, or anything involving NFT ownership lookups on Pharos. Trigger this for phrases like "does wallet X own", "check NFT balance", "what NFTs does this address hold", "is this address a holder", or any ERC-721 ownership question on Pharos mainnet or testnet.
license: MIT
---

# Pharos NFT Checker

This skill checks whether a wallet address owns NFTs from a given ERC-721 contract on the Pharos Network. It returns the balance and, when the contract supports ERC721Enumerable, the actual token IDs held.

## When to use

Use this skill when the user wants to:
- Verify holder status for a specific NFT collection
- Count how many NFTs from a collection a wallet holds
- List token IDs a wallet owns from a collection
- Gate access or rewards based on NFT ownership

## Inputs

The skill needs two values from the user:
1. **Wallet address** — the address to check (0x-prefixed, 42 chars)
2. **NFT contract address** — the ERC-721 contract on Pharos (0x-prefixed, 42 chars)

Optional:
- **Network** — `mainnet` (default, chain 1672) or `testnet` (chain 688688)

If the user gives only one address, ask which is the wallet and which is the contract. Don't guess.

## How to run it

The script lives at `scripts/check_nft.js` and uses Node.js + viem.

```bash
node scripts/check_nft.js <walletAddress> <contractAddress> [network]
```

Example:
```bash
node scripts/check_nft.js 0xabc...123 0xdef...456 mainnet
```

## Output format

Return a clear, human-readable summary:

```
Wallet: 0xabc...123
Collection: <name> (0xdef...456)
Network: Pharos Mainnet
Balance: 3 NFT(s)
Token IDs: 17, 42, 108
```

If the wallet holds zero NFTs, say so plainly. If the contract doesn't support ERC721Enumerable, return the balance only and note that token IDs aren't enumerable.

## Edge cases

- **Invalid address**: validate the 0x format before calling. Return a clear error if malformed.
- **Non-ERC-721 contract**: the `balanceOf(address)` call will revert. Catch the error and tell the user the contract doesn't look like an ERC-721.
- **Contract not deployed**: same — catch the revert and explain.
- **Enumerable not supported**: most modern collections skip ERC721Enumerable to save gas. Return balance without token IDs and mention this.
- **Network down**: catch RPC errors and suggest retrying.

## Dependencies

- Node.js 18+
- `viem` (installed via `npm install`)

See `README.md` for setup instructions.
