"use client";

import React, { useState } from "react";
import {
  useAccount,
  useBalance,
  useChainId,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { parseEther } from "viem";
import { sepolia } from "@reown/appkit/networks";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ExternalLink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TransactionStatus from "@/components/TransactionStatus";

export default function SendTransaction() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  // Balance handling
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    chainId: sepolia.id,
    query: { refetchInterval: 10000 },
  });

  // Transaction handling
  const {
    writeContract,
    data: hash,
    isPending,
    reset: resetWrite,
  } = useWriteContract({
    mutation: {
      onSuccess: () => setError(""),
      onError: (error) => setError(error.message),
    },
  });

  // Wait for transaction receipt
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    refetch: refetchReceipt,
  } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  // Network switching
  const handleSwitchNetwork = async () => {
    try {
      await switchChain({ chainId: sepolia.id });
    } catch (err) {
      setError(
        `Failed to switch network: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  // Send transaction
  const handleSendTransaction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient || !amount) {
      setError("Please enter both recipient address and amount");
      return;
    }

    if (chainId !== sepolia.id) {
      setError("Please switch to Sepolia network first");
      return;
    }

    try {
      writeContract({
        chainId: sepolia.id,
        abi: [
          {
            name: "transfer",
            type: "function",
            stateMutability: "payable",
            inputs: [],
            outputs: [],
          },
        ],
        address: recipient as `0x${string}`,
        functionName: "transfer",
        value: parseEther(amount),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send transaction",
      );
    }
  };

  // Reset transaction
  const handleReset = () => {
    setRecipient("");
    setAmount("");
    resetWrite();
    setError("");
  };

  // Transaction status
  const getTxStatus = () => {
    if (isPending) return "Waiting for confirmation...";
    if (isConfirming) return "Transaction submitted, confirming...";
    if (isConfirmed) return "Transaction confirmed!";
    return "Ready";
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="container mx-auto w-full max-w-lg">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text -muted-foreground hover:text-primary mb-2 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sepolia Transaction</CardTitle>
            <CardDescription>
              Send testnet ETH on Sepolia network
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isConnected ? (
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

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">Balance:</span>
                      <span className="ml-2">
                        {balanceData
                          ? `${balanceData.formatted} ${balanceData.symbol}`
                          : "Loading..."}
                      </span>
                    </div>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => refetchBalance()}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh balance</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <form onSubmit={handleSendTransaction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="0x..."
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      disabled={
                        isPending || isConfirming || chainId !== sepolia.id
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (ETH)</Label>
                    <Input
                      id="amount"
                      placeholder="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={
                        isPending || isConfirming || chainId !== sepolia.id
                      }
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        !isConnected ||
                        isPending ||
                        isConfirming ||
                        chainId !== sepolia.id
                      }
                    >
                      {isPending || isConfirming ? "Processing..." : "Send ETH"}
                    </Button>
                  </div>
                </form>

                <TransactionStatus
                  hash={hash}
                  isPending={isPending}
                  isConfirming={isConfirming}
                  isConfirmed={isConfirmed}
                  error={error}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Please connect your wallet to test Sepolia transfers
                </p>
                <w3m-button />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col items-start border-t px-6 py-4">
            {(hash || error) && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
            <p className="text-muted-foreground text-sm">
              Need testnet ETH? Get some from a{" "}
              <a
                href="https://sepoliafaucet.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Sepolia faucet
              </a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
