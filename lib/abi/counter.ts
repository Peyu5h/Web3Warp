import { sepolia } from "viem/chains";

export const counterAbi = [
  {
    inputs: [
      { internalType: "uint256", name: "_initialCount", type: "uint256" },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newCount",
        type: "uint256",
      },
    ],
    name: "CountChanged",
    type: "event",
  },
  {
    inputs: [],
    name: "decrement",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const counterAddresses: Record<number, `0x${string}`> = {
  [sepolia.id]: "0x085A0E3560a56721708F16c6e83d55Bb87C99967" as `0x${string}`,
} as const;

export function getCounterAddress(
  chainId: number | undefined,
): `0x${string}` | undefined {
  if (!chainId) return undefined;
  return counterAddresses[chainId];
}
