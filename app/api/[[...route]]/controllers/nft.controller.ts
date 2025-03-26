import { Context } from "hono";
import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { nftCollectionAbi } from "~/lib/abi/erc721";
import { success, err, validationErr } from "../utils/response";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

/**
 * Helper function to fetch metadata from IPFS
 */
async function fetchMetadata(uri: string) {
  try {
    const url = uri.startsWith("ipfs://")
      ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
      : uri;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching metadata:", error);
    return null;
  }
}

export const getTokensByOwner = async (c: Context) => {
  try {
    const contractAddress = c.req.query("address");
    const ownerAddress = c.req.query("owner");

    if (!contractAddress || !ownerAddress) {
      return c.json(
        err("Contract address and owner address are required"),
        400,
      );
    }

    const tokenIds = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: nftCollectionAbi,
      functionName: "tokensOfOwner",
      args: [ownerAddress as `0x${string}`],
    });

    if (!tokenIds || !Array.isArray(tokenIds) || tokenIds.length === 0) {
      return c.json(success({ tokens: [] }));
    }

    const tokens = await Promise.all(
      (tokenIds as bigint[]).map(async (tokenId) => {
        try {
          const tokenURI = await publicClient.readContract({
            address: contractAddress as `0x${string}`,
            abi: nftCollectionAbi,
            functionName: "tokenURI",
            args: [tokenId],
          });

          const metadata = await fetchMetadata(tokenURI as string);

          return {
            id: tokenId.toString(),
            tokenURI,
            metadata,
          };
        } catch (error) {
          console.error(`Error fetching token ${tokenId}:`, error);
          return {
            id: tokenId.toString(),
            tokenURI: null,
            error: "Failed to fetch token data",
          };
        }
      }),
    );

    return c.json(success({ tokens }));
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return c.json(
      err(error instanceof Error ? error.message : "Unknown error occurred"),
      500,
    );
  }
};
