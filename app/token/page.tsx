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
import { useAccount, useReadContract, useBalance } from "wagmi";
import { parseEther, formatEther, isAddress } from "viem";
import { erc20Abi, getErc20Address } from "~/lib/abi/erc20";
import { sepolia } from "viem/chains";
import { toast } from "sonner";
import { useTransaction } from "~/lib/hooks/useTransaction";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TokenPage() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState("interact");
  const [recipient, setRecipient] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [tokenInfo, setTokenInfo] = useState<{
    name: string | undefined;
    symbol: string | undefined;
    decimals: number | undefined;
    balance: string;
    totalSupply: string;
  } | null>(null);

  const chainId = sepolia.id;
  const tokenAddress = getErc20Address(chainId);

  const {
    write: writeContract,
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
  } = useTransaction({
    successMessage: "Transaction confirmed on the blockchain",
    onSuccess: () => {
      // Refresh balances after success
      setTimeout(() => {
        if (address) {
          refetchBalance();
          refetchTotalSupply();
        }
        setRecipient("");
        setTransferAmount("");
      }, 1000);
    },
  });

  const { data: ethBalance } = useBalance({ address });

  const { data: tokenName, refetch: refetchName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "name",
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

  const { data: tokenOwner } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "owner",
  });

  useEffect(() => {
    if (tokenName && tokenBalance !== undefined && totalSupply !== undefined) {
      setTokenInfo({
        name: tokenName as string,
        symbol: "SYNK",
        decimals: 18,
        balance: tokenBalance ? formatEther(tokenBalance as bigint) : "0",
        totalSupply: totalSupply ? formatEther(totalSupply as bigint) : "0",
      });
    }
  }, [tokenName, tokenBalance, totalSupply]);

  useEffect(() => {
    if (isConnected && address) {
      refetchName();
      refetchBalance();
      refetchTotalSupply();
    }
  }, [isConnected, address, refetchName, refetchBalance, refetchTotalSupply]);

  const isOwner =
    address &&
    tokenOwner &&
    address.toLowerCase() === tokenOwner.toString().toLowerCase();

  const handleTransfer = () => {
    if (!recipient || !transferAmount || !isAddress(recipient)) {
      toast.error("Please enter a valid recipient address and amount");
      return;
    }

    if (Number(transferAmount) <= 0) {
      toast.error("Transfer amount must be greater than 0");
      return;
    }

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

  const handleMint = () => {
    if (!isOwner) {
      toast.error("Only the token owner can mint new tokens");
      return;
    }

    if (!recipient || !transferAmount || !isAddress(recipient)) {
      toast.error("Please enter a valid recipient address and amount");
      return;
    }

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "mint",
      args: [recipient as `0x${string}`, parseEther(transferAmount)],
    });
  };

  const [products] = useState([
    {
      id: 1,
      name: "Premium Feature",
      description: "Unlock all premium features",
      price: 500,
      image: "🎯",
    },
    {
      id: 2,
      name: "VIP Membership",
      description: "Get exclusive VIP benefits",
      price: 25000,
      image: "👑",
    },
    {
      id: 3,
      name: "Basic Feature",
      description: "Unlock basic features",
      price: 5,
      image: "✨",
    },
  ]);

  const SHOP_WALLET_ADDRESS =
    "0xD7f6b69d601A84F19971A91f25c2224A4e29a6ed" as `0x${string}`;

  const handlePurchase = async (productId: number) => {
    if (!tokenInfo) {
      toast.error("Token information not available");
      return;
    }

    const product = products.find((p) => p.id === productId);
    if (!product) {
      toast.error("Product not found");
      return;
    }

    const userBalance = parseFloat(tokenInfo.balance);
    if (userBalance < product.price) {
      toast.error(
        `Insufficient balance. You need ${product.price} SYNK but have ${userBalance} SYNK`,
      );
      return;
    }

    writeContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "transfer",
      args: [SHOP_WALLET_ADDRESS, parseEther(product.price.toString())],
    });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="">
        <Link
          href="/"
          className="text-muted-foreground hover:text-primary my-4 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </div>
      <Card className="flex flex-col space-y-8 p-6">
        {isConnected ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="interact">Token Info</TabsTrigger>
              <TabsTrigger value="transfer">Transfer & Mint</TabsTrigger>
              <TabsTrigger value="shop">Shop</TabsTrigger>
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
                            <span className="font-medium">Your Balance:</span>{" "}
                            {tokenInfo.balance} {tokenInfo.symbol}
                          </p>
                          <p>
                            <span className="font-medium">Total Supply:</span>{" "}
                            {tokenInfo.totalSupply} {tokenInfo.symbol}
                          </p>
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
                    </div>
                  </div>
                </CardContent>
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
                        onChange={(e) => setRecipient(e.target.value)}
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
                        placeholder="12345"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleTransfer}
                      disabled={
                        isTransactionLoading ||
                        !recipient ||
                        !transferAmount ||
                        !isAddress(recipient)
                      }
                    >
                      {isTransactionLoading
                        ? "Processing..."
                        : "Transfer Tokens"}
                    </Button>

                    {isOwner && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleMint}
                        disabled={
                          isTransactionLoading ||
                          !recipient ||
                          !transferAmount ||
                          !isAddress(recipient)
                        }
                      >
                        Mint Tokens to Address
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shop" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>SYNK Shop</CardTitle>
                  <CardDescription>
                    Purchase products using your SYNK tokens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {products.map((product) => (
                      <Card key={product.id} className="flex flex-col">
                        <CardHeader>
                          <div className="mb-2 text-4xl">{product.image}</div>
                          <CardTitle className="text-lg">
                            {product.name}
                          </CardTitle>
                          <CardDescription>
                            {product.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <div className="text-primary text-2xl font-bold">
                            {product.price} SYNK
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button
                            className="w-full"
                            onClick={() => handlePurchase(product.id)}
                            disabled={
                              isTransactionLoading ||
                              !tokenInfo ||
                              parseFloat(tokenInfo.balance) < product.price
                            }
                          >
                            {isTransactionLoading
                              ? "Processing..."
                              : "Purchase"}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {tokenInfo && (
                    <div className="mt-4 rounded border p-4">
                      <h3 className="mb-2 text-sm font-medium">Your Balance</h3>
                      <p className="text-lg font-bold">
                        {tokenInfo.balance} {tokenInfo.symbol}
                      </p>
                    </div>
                  )}
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
      </Card>
    </div>
  );
}
