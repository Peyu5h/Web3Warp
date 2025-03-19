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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAccount } from "wagmi";

export default function TokenPage() {
  const { isConnected, address } = useAccount();
  const [activeTab, setActiveTab] = useState("deploy");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">ERC20 Token</h1>
          <p className="text-muted-foreground">
            Create and manage your own ERC20 token with custom properties
          </p>
        </div>

        {isConnected ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="deploy">Deploy Token</TabsTrigger>
              <TabsTrigger value="interact">Interact</TabsTrigger>
              <TabsTrigger value="transfer">Transfer</TabsTrigger>
            </TabsList>

            <TabsContent value="deploy" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deploy New Token</CardTitle>
                  <CardDescription>
                    Create your own ERC20 token with custom name, symbol, and
                    supply
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Token Name</Label>
                      <Input id="name" placeholder="My Token" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="symbol">Token Symbol</Label>
                      <Input id="symbol" placeholder="TKN" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="initialSupply">Initial Supply</Label>
                      <Input
                        id="initialSupply"
                        type="number"
                        placeholder="1000000"
                      />
                    </div>
                    <Button className="w-full">Deploy Token</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interact" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Interact with Token</CardTitle>
                  <CardDescription>
                    Manage your token&apos;s features after deployment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tokenAddress">Token Address</Label>
                      <Input id="tokenAddress" placeholder="0x..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button>Check Balance</Button>
                      <Button variant="outline">Get Token Info</Button>
                    </div>
                    <div className="mt-4 rounded border p-4">
                      <h3 className="mb-2 text-sm font-medium">Token Info</h3>
                      <p className="text-sm">
                        Connect and load a token to see details
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
                    Send tokens to other addresses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="tokenAddress">Token Address</Label>
                      <Input id="tokenAddress" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input id="recipient" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" placeholder="100" />
                    </div>
                    <Button className="w-full">Transfer</Button>
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
                  Connect your wallet to create and manage tokens
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Creating ERC20 tokens with OpenZeppelin contracts</li>
            <li>Managing token supply (minting, burning)</li>
            <li>Implementing token transfers</li>
            <li>Reading token metadata and balances</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
