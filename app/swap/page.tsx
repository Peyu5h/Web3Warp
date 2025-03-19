"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAccount } from "wagmi";

export default function SwapPage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<"swap" | "pool" | "stats">(
    "swap",
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Token Swap</h1>
          <p className="text-muted-foreground">
            Create liquidity pools and swap between tokens
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={activeSection === "swap" ? "default" : "outline"}
                onClick={() => setActiveSection("swap")}
              >
                Swap Tokens
              </Button>
              <Button
                variant={activeSection === "pool" ? "default" : "outline"}
                onClick={() => setActiveSection("pool")}
              >
                Liquidity Pool
              </Button>
              <Button
                variant={activeSection === "stats" ? "default" : "outline"}
                onClick={() => setActiveSection("stats")}
              >
                Pool Statistics
              </Button>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  {activeSection === "swap"
                    ? "Swap Tokens"
                    : activeSection === "pool"
                      ? "Manage Liquidity"
                      : "Pool Statistics"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "swap"
                    ? "Exchange tokens at the current pool rate"
                    : activeSection === "pool"
                      ? "Add or remove liquidity from pools"
                      : "View detailed pool statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "swap" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tokenIn">From</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tokenInAmount"
                          type="number"
                          placeholder="0.0"
                          className="flex-grow"
                        />
                        <Button variant="outline" className="w-[100px]">
                          ETH
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 rounded-full p-0"
                      >
                        ↓
                      </Button>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="tokenOut">To</Label>
                      <div className="flex gap-2">
                        <Input
                          id="tokenOutAmount"
                          type="number"
                          placeholder="0.0"
                          className="flex-grow"
                        />
                        <Button variant="outline" className="w-[100px]">
                          Token
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2 rounded border p-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Exchange Rate
                        </span>
                        <span className="text-sm">1 ETH = 0 Token</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Price Impact
                        </span>
                        <span className="text-sm">0.00%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Slippage Tolerance
                        </span>
                        <span className="text-sm">0.5%</span>
                      </div>
                    </div>

                    <Button className="w-full">Swap</Button>
                  </div>
                )}

                {activeSection === "pool" && (
                  <div className="space-y-4">
                    <div className="mb-4 flex justify-between">
                      <Button variant="outline" size="sm" className="w-[120px]">
                        Add Liquidity
                      </Button>
                      <Button variant="outline" size="sm" className="w-[120px]">
                        Remove Liquidity
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tokenA">Token A</Label>
                        <div className="flex gap-2">
                          <Input
                            id="tokenAAmount"
                            type="number"
                            placeholder="0.0"
                            className="flex-grow"
                          />
                          <Button variant="outline" className="w-[100px]">
                            ETH
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="tokenB">Token B</Label>
                        <div className="flex gap-2">
                          <Input
                            id="tokenBAmount"
                            type="number"
                            placeholder="0.0"
                            className="flex-grow"
                          />
                          <Button variant="outline" className="w-[100px]">
                            Token
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 rounded border p-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Pool Share
                        </span>
                        <span className="text-sm">0.00%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground text-sm">
                          Fee Tier
                        </span>
                        <span className="text-sm">0.3%</span>
                      </div>
                    </div>

                    <Button className="w-full">Confirm</Button>
                  </div>
                )}

                {activeSection === "stats" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="poolAddress">Pool Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="poolAddress"
                          placeholder="0x..."
                          className="flex-grow"
                        />
                        <Button>Load</Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="mb-1 text-sm font-medium">
                              Total Value Locked
                            </h3>
                            <p className="text-2xl font-bold">$0.00</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4">
                            <h3 className="mb-1 text-sm font-medium">
                              24h Volume
                            </h3>
                            <p className="text-2xl font-bold">$0.00</p>
                          </CardContent>
                        </Card>
                      </div>

                      <div className="space-y-2 rounded border p-4">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Pool Composition
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">
                            Token A
                          </span>
                          <span className="text-sm">0 ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">
                            Token B
                          </span>
                          <span className="text-sm">0 Token</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground text-sm">
                            Ratio
                          </span>
                          <span className="text-sm">-</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <p className="mb-4 text-center">
                  Connect your wallet to access token swap features
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Implementing Automated Market Maker (AMM) mechanics</li>
            <li>Creating and managing liquidity pools</li>
            <li>Implementing token swap functionality</li>
            <li>Calculating price impact and slippage</li>
            <li>Handling liquidity provider (LP) tokens</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
