"use client";

import React, { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
  useBalance,
} from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { erc20Abi, getErc20Address } from "~/lib/abi/erc20";
import { sepolia } from "viem/chains";
import { toast } from "sonner";

export default function TokenPage() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState("interact");
  const [debugMode, setDebugMode] = useState(false);

  // Get the correct token address based on chain
  const chainId = sepolia.id;
  const erc20Address = getErc20Address(chainId);

  // State variables
  const [tokenAddress, setTokenAddress] = useState(erc20Address);
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{
    name: string | undefined;
    symbol: string | undefined;
    decimals: number | undefined;
    balance: string;
    totalSupply: string;
  } | null>(null);

  // Contract write hooks
  const {
    data: transferHash,
    isPending: isTransferring,
    writeContract,
    error: writeError,
  } = useWriteContract();

  // Transaction receipt hooks
  const { isLoading: isTransferLoading, isSuccess: isTransferSuccess } =
    useWaitForTransactionReceipt({ hash: transferHash });

  // Read account's ETH balance
  const { data: ethBalance } = useBalance({
    address,
  });

  // Read token info
  const { data: tokenName, refetch: refetchName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "name",
  });

  const { data: tokenSymbol, refetch: refetchSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const { data: tokenDecimals, refetch: refetchDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
  });

  const { data: totalSupply, refetch: refetchTotalSupply } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "totalSupply",
  });

  const { data: tokenOwner, refetch: refetchOwner } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "owner",
  });

  // Update the isOwner check to be more reliable
  const isOwner =
    address &&
    tokenOwner &&
    address.toLowerCase() === tokenOwner.toString().toLowerCase();

  // Load deployed token info on initial render
  useEffect(() => {
    if (isConnected && tokenAddress) {
      handleCheckToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address, tokenAddress]);

  // Handle check token info
  const handleCheckToken = async () => {
    if (!tokenAddress || !isAddress(tokenAddress)) {
      toast.error("Please enter a valid token address");
      return;
    }

    try {
      // Force cache invalidation by requesting a fresh fetch
      await Promise.all([
        refetchName(),
        refetchSymbol(),
        refetchDecimals(),
        address ? refetchBalance() : Promise.resolve(),
        refetchTotalSupply(),
        refetchOwner(),
      ]);

      // Add a small delay to ensure the data is refreshed
      await new Promise((resolve) => setTimeout(resolve, 500));

      setTokenInfo({
        name: tokenName as string | undefined,
        symbol: tokenSymbol as string | undefined,
        decimals: tokenDecimals as number | undefined,
        balance: tokenBalance ? formatEther(tokenBalance as bigint) : "0",
        totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
      });

      toast.success("Token information refreshed successfully");
    } catch (error) {
      console.error("Error loading token info:", error);
      toast.error(
        "Failed to load token info. Check that the address is a valid ERC20 token.",
      );
    }
  };

  // Add automatic refresh interval
  useEffect(() => {
    if (isConnected && address) {
      // Initial load
      handleCheckToken();

      // Set up refresh interval every 10 seconds
      const intervalId = setInterval(() => {
        console.log("Auto-refreshing token balance...");
        refetchBalance();
        refetchTotalSupply();
      }, 10000);

      return () => clearInterval(intervalId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  // Ensure quick refresh after transactions
  useEffect(() => {
    if (isTransferSuccess) {
      toast.success("Transaction completed successfully");

      // Immediate check to update UI
      setTimeout(() => {
        if (address) {
          refetchBalance();
          refetchTotalSupply();

          // Second refresh after a longer delay to ensure blockchain data is updated
          setTimeout(() => {
            handleCheckToken();
          }, 3000);
        }
      }, 1000);

      // Clear form
      setRecipient("");
      setTransferAmount("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTransferSuccess]);

  // Update the handleMint function to properly handle decimals
  const handleMint = () => {
    if (!isOwner) {
      toast.error("Only the token owner can mint new tokens");
      return;
    }

    if (!recipient || !transferAmount || !isAddress(recipient)) {
      toast.error("Please enter a valid recipient address and amount");
      return;
    }

    console.log("Minting tokens to:", recipient, "amount:", transferAmount);

    try {
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "mint",
        args: [recipient as `0x${string}`, parseEther(transferAmount)],
      });
    } catch (error) {
      console.error("Mint error:", error);
      toast.error(
        "Failed to mint tokens: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  };

  // Handle token transfer
  const handleTransfer = () => {
    if (!recipient || !transferAmount || !isAddress(recipient)) {
      toast.error("Please enter a valid recipient address and amount");
      return;
    }

    if (Number(transferAmount) <= 0) {
      toast.error("Transfer amount must be greater than 0");
      return;
    }

    // Check if user has enough balance
    if (
      tokenInfo &&
      parseFloat(tokenInfo.balance) < parseFloat(transferAmount)
    ) {
      toast.error(
        `Insufficient balance. You only have ${tokenInfo.balance} ${tokenInfo.symbol}`,
      );
      return;
    }

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "transfer",
      args: [recipient as `0x${string}`, parseEther(transferAmount)],
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">SYNK Token</h1>
          <Button
            variant="ghost"
            onClick={() => setDebugMode(!debugMode)}
            size="sm"
          >
            {debugMode ? "Hide Debug" : "Debug"}
          </Button>
        </div>

        <p className="text-muted-foreground">
          Interact with the deployed SYNK token on Sepolia testnet
        </p>

        {debugMode && (
          <Card className="bg-slate-50 dark:bg-slate-900">
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-xs">
              <div className="space-y-2">
                <p>Your address: {address || "Not connected"}</p>
                <p>
                  Token owner: {tokenOwner ? tokenOwner.toString() : "Unknown"}
                </p>
                <p>Is owner: {isOwner ? "Yes" : "No"}</p>
                <p>
                  Address comparison: {address?.toLowerCase()} vs{" "}
                  {tokenOwner?.toString().toLowerCase()}
                </p>
                <p>
                  Token ABI mint function:{" "}
                  {JSON.stringify(erc20Abi.find((x: any) => x.name === "mint"))}
                </p>
                {writeError && (
                  <div className="mt-2 rounded bg-red-100 p-2 text-red-800">
                    <p>Last error: {writeError.message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {isConnected ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="interact">Token Info</TabsTrigger>
              <TabsTrigger value="transfer">Transfer & Mint</TabsTrigger>
            </TabsList>

            <TabsContent value="interact" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>SYNK Token Info</CardTitle>
                  <CardDescription>
                    View token details and your balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tokenAddress">Token Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tokenAddress"
                          value={tokenAddress}
                          className="font-mono text-xs"
                          readOnly
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="whitespace-nowrap"
                          onClick={() => {
                            navigator.clipboard.writeText(tokenAddress);
                            toast.success("Address copied to clipboard");
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </div>

                    <Button onClick={handleCheckToken}>
                      Refresh Token Info
                    </Button>

                    <div className="mt-4 rounded border p-4">
                      <h3 className="mb-2 text-sm font-medium">Token Info</h3>
                      {tokenInfo ? (
                        <div className="space-y-2 text-sm">
                          <p>
                            <span className="font-medium">Name:</span>{" "}
                            {tokenInfo.name}
                          </p>
                          <p>
                            <span className="font-medium">Symbol:</span>{" "}
                            {tokenInfo.symbol}
                          </p>
                          <p>
                            <span className="font-medium">Decimals:</span>{" "}
                            {tokenInfo.decimals?.toString()}
                          </p>
                          <p>
                            <span className="font-medium">Your Balance:</span>{" "}
                            {tokenInfo.balance} {tokenInfo.symbol}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Total Supply:</span>{" "}
                            <span className="flex items-center gap-2">
                              {tokenInfo.totalSupply} {tokenInfo.symbol}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 py-0"
                                onClick={handleCheckToken}
                              >
                                Refresh
                              </Button>
                            </span>
                          </div>
                          <p>
                            <span className="font-medium">Owner:</span>{" "}
                            {isOwner ? (
                              <span className="text-green-500">
                                You are the owner
                              </span>
                            ) : (
                              <span className="font-mono text-xs break-all">
                                {tokenOwner as string}
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm">Loading token information...</p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <Button
                        className="mt-2 bg-blue-600 hover:bg-blue-700"
                        onClick={handleCheckToken}
                      >
                        Force Refresh Balances
                      </Button>
                    </div>

                    <div className="mt-2 rounded border p-4">
                      <h3 className="mb-2 text-sm font-medium">
                        Your ETH Balance
                      </h3>
                      <p className="text-sm">
                        {ethBalance ? (
                          <span>
                            {parseFloat(formatEther(ethBalance.value)).toFixed(
                              4,
                            )}{" "}
                            {ethBalance.symbol}
                          </span>
                        ) : (
                          "Loading..."
                        )}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        You need ETH to pay for transaction fees
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <a
                    href={`https://sepolia.etherscan.io/address/${tokenAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    View on Etherscan
                  </a>
                  <a
                    href="https://sepoliafaucet.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Get Sepolia ETH
                  </a>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="transfer" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Transfer Tokens</CardTitle>
                  <CardDescription>
                    Send SYNK tokens to other addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipient}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setRecipient(e.target.value)
                        }
                      />
                      {recipient && !isAddress(recipient) && (
                        <p className="mt-1 text-xs text-red-500">
                          Please enter a valid Ethereum address
                        </p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        value={transferAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setTransferAmount(e.target.value)
                        }
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleTransfer}
                      disabled={
                        isTransferring ||
                        isTransferLoading ||
                        !recipient ||
                        !transferAmount ||
                        !isAddress(recipient)
                      }
                    >
                      {isTransferring || isTransferLoading
                        ? "Processing..."
                        : "Transfer Tokens"}
                    </Button>

                    {tokenInfo && (
                      <p className="text-muted-foreground text-center text-sm">
                        Your current balance: {tokenInfo.balance}{" "}
                        {tokenInfo.symbol}
                      </p>
                    )}

                    {isOwner ? (
                      <div className="mt-6 border-t pt-6">
                        <h3 className="mb-4 font-medium">Owner Functions</h3>
                        <p className="mb-4 text-sm">
                          As the token owner, you can mint new tokens to any
                          address.
                        </p>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={handleMint}
                          disabled={
                            isTransferring ||
                            isTransferLoading ||
                            !recipient ||
                            !transferAmount ||
                            !isAddress(recipient)
                          }
                        >
                          Mint Tokens to Address
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-6 border-t pt-6">
                        <p className="text-muted-foreground text-sm">
                          Owner functions are only available to the token owner:{" "}
                          {tokenOwner ? tokenOwner.toString() : "Unknown"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <p className="mb-4 text-center">
                  Connect your wallet to interact with the SYNK token
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">SYNK Token Contract:</h3>
          <p className="mb-2 text-xs break-all">{erc20Address}</p>
          <p className="mb-4">
            <a
              href={`https://sepolia.etherscan.io/address/${erc20Address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:underline"
            >
              View on Etherscan
            </a>
          </p>
          <h3 className="mb-2 font-medium">How to use:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Get Sepolia ETH from{" "}
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Sepolia Faucet
              </a>
            </li>
            <li>View your token balance and total supply</li>
            <li>If you&apos;re the owner, you can mint new tokens</li>
            <li>Transfer tokens to other addresses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
