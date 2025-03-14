"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, RotateCcw } from "lucide-react";
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { sepolia } from "@reown/appkit/networks";
import { COUNTER_ABI, COUNTER_ADDRESS } from "@/lib/counterABI";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function CounterPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [error, setError] = useState("");

  // Read the counter value
  const {
    data: count,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useReadContract({
    address: COUNTER_ADDRESS as `0x${string}`,
    abi: COUNTER_ABI,
    functionName: "getCount",
    chainId: sepolia.id,
  });

  // Write contract functions
  const {
    writeContract,
    data: hash,
    isPending,
    reset,
  } = useWriteContract({
    mutation: {
      onSuccess: () => setError(""),
      onError: (error) => setError(error.message),
    },
  });

  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      confirmations: 1,
    });

  // Handle network switching
  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (err) {
      setError(
        `Failed to switch network: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  // Increment counter
  const handleIncrement = async () => {
    if (chainId !== sepolia.id) {
      setError("Please switch to Sepolia network first");
      return;
    }

    try {
      writeContract({
        address: COUNTER_ADDRESS as `0x${string}`,
        abi: COUNTER_ABI,
        functionName: "increment",
        chainId: sepolia.id,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to increment counter",
      );
    }
  };

  // Decrement counter
  const handleDecrement = async () => {
    if (chainId !== sepolia.id) {
      setError("Please switch to Sepolia network first");
      return;
    }

    try {
      writeContract({
        address: COUNTER_ADDRESS as `0x${string}`,
        abi: COUNTER_ABI,
        functionName: "decrement",
        chainId: sepolia.id,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decrement counter",
      );
    }
  };

  // Refresh counter value
  const handleRefresh = () => {
    refetchCount();
  };

  // Get transaction status
  const getActionStatus = () => {
    if (isPending) return "Submitting transaction...";
    if (isConfirming) return "Confirming transaction...";
    if (isConfirmed) {
      // Refresh the count after confirmation
      setTimeout(() => refetchCount(), 1000);
      return "Transaction confirmed!";
    }
    return null;
  };

  const actionStatus = getActionStatus();

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="container mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="text-muted-foreground hover:text-primary flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <w3m-button />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Counter dApp</CardTitle>
            <CardDescription>
              A simple counter on Sepolia testnet
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isConnected ? (
              <>
                <div className="bg-muted mb-6 space-y-3 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Network:</span>
                      {chainId === sepolia.id ? (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          Sepolia
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          Wrong Network
                        </Badge>
                      )}
                    </div>

                    {chainId !== sepolia.id && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSwitchNetwork}
                      >
                        Switch to Sepolia
                      </Button>
                    )}
                  </div>

                  <div>
                    <span className="font-medium">Connected Address:</span>
                    <span className="text-muted-foreground ml-2 text-sm">
                      {address}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-8">
                  <h3 className="mb-2 text-lg font-medium">Current Count</h3>
                  <div className="flex items-center gap-2">
                    {isCountLoading ? (
                      <Skeleton className="h-20 w-20 rounded-full" />
                    ) : (
                      <div className="bg-primary text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold">
                        {count !== undefined ? Number(count) : "?"}
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={isPending || isConfirming}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-8 flex gap-4">
                    <Button
                      onClick={handleDecrement}
                      disabled={
                        isPending || isConfirming || chainId !== sepolia.id
                      }
                      variant="outline"
                      size="lg"
                    >
                      <Minus className="mr-2 h-4 w-4" />
                      Decrement
                    </Button>
                    <Button
                      onClick={handleIncrement}
                      disabled={
                        isPending || isConfirming || chainId !== sepolia.id
                      }
                      size="lg"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Increment
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {actionStatus && (
                  <Alert
                    className={`mt-4 ${isConfirmed ? "bg-green-50" : "bg-blue-50"}`}
                  >
                    <AlertTitle>
                      {isConfirmed ? "Success!" : "Processing"}
                    </AlertTitle>
                    <AlertDescription>
                      {actionStatus}
                      {hash && (
                        <div className="mt-2">
                          <a
                            href={`https://sepolia.etherscan.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary flex items-center text-sm hover:underline"
                          >
                            View on Etherscan
                          </a>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Please connect your wallet to interact with the counter
                </p>
                <w3m-button />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start border-t px-6 py-4">
            <p className="text-muted-foreground text-sm">
              Contract Address:{" "}
              <code className="bg-muted rounded p-1 text-xs">
                {COUNTER_ADDRESS}
              </code>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
