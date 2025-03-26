"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Minus, RotateCcw } from "lucide-react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
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
import { useTransaction } from "~/lib/hooks/useTransaction";
import { toast } from "sonner";

export default function CounterPage() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

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
  // const {
  //   writeContract,
  //   data: hash,
  //   isPending,
  //   reset,
  // } = useWriteContract({
  //   mutation: {
  //     onSuccess: () => setError(""),
  //     onError: (error) => setError(error.message)
  //   }
  // });

  // Use transaction hook for contract writes
  const transaction = useTransaction({
    successMessage: "Counter updated successfully",
    onSuccess: () => {
      refetchCount();
    },
  });

  // Increment counter
  const handleIncrement = async () => {
    if (chainId !== sepolia.id) {
      toast.error("Please switch to Sepolia network first");
      return;
    }

    try {
      await transaction.writeAsync({
        address: getCounterAddress(sepolia.id) as `0x${string}`,
        abi: counterAbi,
        functionName: "increment",
        chainId: sepolia.id,
        _meta: {
          successMessage: "Counter incremented successfully",
        },
      });
    } catch (err) {
      console.error("Error incrementing counter:", err);
    }
  };

  // Decrement counter
  const handleDecrement = async () => {
    if (chainId !== sepolia.id) {
      toast.error("Please switch to Sepolia network first");
      return;
    }

    try {
      await transaction.writeAsync({
        address: getCounterAddress(sepolia.id) as `0x${string}`,
        abi: counterAbi,
        functionName: "decrement",
        chainId: sepolia.id,
        _meta: {
          successMessage: "Counter decremented successfully",
        },
      });
    } catch (err) {
      console.error("Error decrementing counter:", err);
    }
  };

  // Refresh counter value
  const handleRefresh = () => {
    refetchCount();
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="container mx-auto w-full max-w-lg">
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary my-4 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        <Card>
          <CardHeader>
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
                    disabled={transaction.isPending || transaction.isConfirming}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-8 flex gap-4">
                  <Button
                    onClick={handleDecrement}
                    disabled={
                      transaction.isPending ||
                      transaction.isConfirming ||
                      chainId !== sepolia.id
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
                      transaction.isPending ||
                      transaction.isConfirming ||
                      chainId !== sepolia.id
                    }
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Increment
                  </Button>
                </div>
              </div>

              {transaction.error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    {transaction.error.message}
                  </AlertDescription>
                </Alert>
              )}
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
