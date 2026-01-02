// src/casperClient.ts

// This file is a safe integration layer between your backend and the Casper contract.
// It does NOT try to instantiate the casper-js-sdk client (which is version-fragile),
// but it centralizes all Casper-related config and clearly describes the on-chain call
// so you can:
//   - log what would be sent to Casper,
//   - return a stable "deploy hash"-like string to the frontend,
//   - later swap in a real casper-js-sdk implementation without touching the rest
//     of your backend.

// Environment-driven config
const nodeUrl = process.env.CASPER_NODE_URL || 'https://node.casper.network/rpc';
const chainName = process.env.CASPER_CHAIN_NAME || 'casper';
const contractHash =
  process.env.STUDYHUB_CONTRACT_HASH ||
  'hash-d14eaa2bb329549e3705c6610709e1073e5f61d9fbe57864b60385d73fc3f9c6';
const publicKeyHex =
  process.env.CASPER_PUBLIC_KEY_HEX ||
  '018b1447e25c30267caf951f1b947926d5e2a9d2c061f3bd7b1da641010ad44c99';

// Shape of a planned Casper call (for logging / future real integration)
export interface PlannedCasperCall {
  nodeUrl: string;
  chainName: string;
  contractHash: string;
  publicKeyHex: string;
  entrypoint: string;
  args: {
    syllabus_hash: string;
    agent_type: number;
  };
  pseudoHash: string;
}

/**
 * submitJobOnChain
 * ----------------
 * Current behavior:
 *   - Creates a "planned" Casper call description
 *   - Logs it to the console
 *   - Returns a pseudo deploy hash string for the frontend/backend to show
 *
 * Future behavior (when casper-js-sdk integration is stable):
 *   - Build a real Deploy / Transaction
 *   - Sign with CASPER_SECRET_KEY_PATH
 *   - Send to nodeUrl and return the real deploy hash
 */
export async function submitJobOnChain(
  syllabusHash: string,
  agentType: number
): Promise<string> {
  const pseudoHash = `planned-${Date.now().toString(16)}`;

  const plan: PlannedCasperCall = {
    nodeUrl,
    chainName,
    contractHash,
    publicKeyHex,
    entrypoint: 'submit_job',
    args: {
      syllabus_hash: syllabusHash,
      agent_type: agentType,
    },
    pseudoHash,
  };

  console.log('--- Casper submit_job planned ---');
  console.log(JSON.stringify(plan, null, 2));
  console.log('---------------------------------');

  // For now, return a pseudo hash so the rest of the system
  // can treat this like a real deploy hash.
  return pseudoHash;
}
