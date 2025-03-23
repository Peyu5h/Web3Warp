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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import { counterAbi, getCounterAddress } from "~/lib/abi";
import TransactionStatus from "~/components/TransactionStatus";

export default function CounterPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [error, setError] = useState("");

  // Read the counter value
  const {
    data: count,
    isLoading: isCountLoading,
    refetch: refetchCount,
  } = useReadContract({
    address: getCounterAddress(sepolia.id) as `0x${string}`,
    abi: counterAbi,
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

  // Increment counter
  const handleIncrement = async () => {
    if (chainId !== sepolia.id) {
      setError("Please switch to Sepolia network first");
      return;
    }

    try {
      writeContract({
        address: getCounterAddress(sepolia.id) as `0x${string}`,
        abi: counterAbi,
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
        address: getCounterAddress(sepolia.id) as `0x${string}`,
        abi: counterAbi,
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

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="container mx-auto w-full max-w-lg">
        <Card>
          <CardHeader>
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <CardTitle>Counter dApp</CardTitle>
            <CardDescription>
              A simple counter on Sepolia testnet
            </CardDescription>
          </CardHeader>

          <CardContent>
            <>
              <div className="bg-muted mb-6 space-y-3 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Network:</span>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800"
                    >
                      Sepolia
                    </Badge>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium">Address:</span>
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

              <TransactionStatus
                hash={hash}
                isPending={isPending}
                isConfirming={isConfirming}
                isConfirmed={isConfirmed}
              />
            </>
          </CardContent>

          <CardFooter className="flex flex-col items-start border-t px-6 py-4">
            <p className="text-muted-foreground text-sm">
              Contract Address:{" "}
              <code className="bg-muted rounded p-1 text-xs">
                {getCounterAddress(sepolia.id)}
              </code>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
