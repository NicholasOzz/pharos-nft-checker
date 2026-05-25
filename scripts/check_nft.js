#!/usr/bin/env node
/**
 * Pharos NFT Checker
 *
 * Checks ERC-721 ownership for a wallet on the Pharos Network.
 *
 * Usage:
 *   node scripts/check_nft.js <walletAddress> <contractAddress> [network]
 *
 * network: "mainnet" (default) or "testnet"
 */

import { createPublicClient, http, defineChain, isAddress, getContract } from "viem";

// --- Pharos chain definitions ---
const pharosMainnet = defineChain({
  id: 1672,
  name: "Pharos Pacific Ocean Mainnet",
  nativeCurrency: { name: "Pharos", symbol: "PROS", decimals: 18 },
  rpcUrls: { default: { http: ["https://rpc.pharos.xyz"] } },
});

const pharosTestnet = defineChain({
  id: 688688,
  name: "Pharos Testnet",
  nativeCurrency: { name: "Pharos", symbol: "PROS", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet.dplabs-internal.com"] } },
});

// --- Minimal ERC-721 ABI (we only need a few reads) ---
const erc721Abi = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "symbol",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
];

async function checkNft(wallet, contract, networkName = "mainnet") {
  if (!isAddress(wallet)) throw new Error(`Invalid wallet address: ${wallet}`);
  if (!isAddress(contract)) throw new Error(`Invalid contract address: ${contract}`);

  const chain = networkName === "testnet" ? pharosTestnet : pharosMainnet;
  const client = createPublicClient({ chain, transport: http() });

  const nft = getContract({ address: contract, abi: erc721Abi, client });

  // Get collection metadata (best effort — some contracts skip these)
  let name = "Unknown";
  let symbol = "";
  try {
    name = await nft.read.name();
  } catch {}
  try {
    symbol = await nft.read.symbol();
  } catch {}

  // The actual ownership check
  let balance;
  try {
    balance = await nft.read.balanceOf([wallet]);
  } catch (err) {
    throw new Error(
      `Could not call balanceOf on ${contract}. ` +
        `This may not be an ERC-721 contract, or it may not be deployed on ${chain.name}.`,
    );
  }

  // Try to enumerate token IDs (only works if contract implements ERC721Enumerable)
  let tokenIds = [];
  let enumerable = true;
  if (balance > 0n) {
    try {
      for (let i = 0n; i < balance; i++) {
        const id = await nft.read.tokenOfOwnerByIndex([wallet, i]);
        tokenIds.push(id.toString());
      }
    } catch {
      enumerable = false;
      tokenIds = [];
    }
  }

  return {
    wallet,
    contract,
    network: chain.name,
    collection: { name, symbol },
    balance: balance.toString(),
    tokenIds,
    enumerable,
  };
}

function formatResult(r) {
  const lines = [];
  lines.push(`Wallet:     ${r.wallet}`);
  const collection = r.collection.symbol
    ? `${r.collection.name} (${r.collection.symbol})`
    : r.collection.name;
  lines.push(`Collection: ${collection}`);
  lines.push(`Contract:   ${r.contract}`);
  lines.push(`Network:    ${r.network}`);
  lines.push(`Balance:    ${r.balance} NFT(s)`);
  if (Number(r.balance) > 0) {
    if (r.enumerable) {
      lines.push(`Token IDs:  ${r.tokenIds.join(", ")}`);
    } else {
      lines.push(`Token IDs:  (contract is not ERC721Enumerable — IDs not listable)`);
    }
  }
  return lines.join("\n");
}

// --- CLI entry point ---
async function main() {
  const [wallet, contract, network] = process.argv.slice(2);
  if (!wallet || !contract) {
    console.error("Usage: node scripts/check_nft.js <wallet> <contract> [mainnet|testnet]");
    process.exit(1);
  }
  try {
    const result = await checkNft(wallet, contract, network);
    console.log(formatResult(result));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();

export { checkNft, formatResult };
  
