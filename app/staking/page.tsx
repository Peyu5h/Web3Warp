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

export default function StakingPage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "stake" | "unstake" | "rewards"
  >("stake");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Token Staking</h1>
          <p className="text-muted-foreground">
            Stake your tokens to earn rewards over time
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={activeSection === "stake" ? "default" : "outline"}
                onClick={() => setActiveSection("stake")}
              >
                Stake Tokens
              </Button>
              <Button
                variant={activeSection === "unstake" ? "default" : "outline"}
                onClick={() => setActiveSection("unstake")}
              >
                Unstake
              </Button>
              <Button
                variant={activeSection === "rewards" ? "default" : "outline"}
                onClick={() => setActiveSection("rewards")}
              >
                View Rewards
              </Button>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  {activeSection === "stake"
                    ? "Stake Your Tokens"
                    : activeSection === "unstake"
                      ? "Unstake Your Tokens"
                      : "Your Staking Rewards"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "stake"
                    ? "Lock your tokens to earn staking rewards"
                    : activeSection === "unstake"
                      ? "Withdraw your staked tokens"
                      : "View and claim your earned rewards"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "stake" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tokenAddress">Token Address</Label>
                      <Input id="tokenAddress" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stakeAmount">Amount to Stake</Label>
                      <Input id="stakeAmount" type="number" placeholder="100" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="stakeDuration">
                        Staking Duration (days)
                      </Label>
                      <Input
                        id="stakeDuration"
                        type="number"
                        placeholder="30"
                      />
                    </div>
                    <Button className="w-full">Stake Tokens</Button>
                  </div>
                )}

                {activeSection === "unstake" && (
                  <div className="space-y-4">
                    <div className="mb-4 rounded border p-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">
                          Currently Staked
                        </span>
                        <span className="text-sm">0 Tokens</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Staking Period
                        </span>
                        <span className="text-sm">0 days remaining</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="unstakeAmount">Amount to Unstake</Label>
                      <Input
                        id="unstakeAmount"
                        type="number"
                        placeholder="100"
                      />
                    </div>
                    <Button className="w-full">Unstake Tokens</Button>
                  </div>
                )}

                {activeSection === "rewards" && (
                  <div className="space-y-4">
                    <div className="rounded border p-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">
                          Available Rewards
                        </span>
                        <span className="text-sm">0 Tokens</span>
                      </div>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">Reward Rate</span>
                        <span className="text-sm">0% APY</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Next Reward</span>
                        <span className="text-sm">0 days</span>
                      </div>
                    </div>
                    <Button className="w-full">Claim Rewards</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Total Staked</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0 Tokens</p>
                  <p className="text-muted-foreground text-xs">
                    Across all pools
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Your Stake</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0 Tokens</p>
                  <p className="text-muted-foreground text-xs">
                    In current pool
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Earned Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0 Tokens</p>
                  <p className="text-muted-foreground text-xs">Unclaimed</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card className="w-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8">
                <p className="mb-4 text-center">
                  Connect your wallet to access staking features
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Implementing token staking contracts</li>
            <li>Creating time-based reward distribution</li>
            <li>Managing staking periods and early withdrawal penalties</li>
            <li>Calculating APY for staking rewards</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
