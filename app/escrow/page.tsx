"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { useAccount } from "wagmi";

export default function EscrowPage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "create" | "deposit" | "manage"
  >("create");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Escrow Service</h1>
          <p className="text-muted-foreground">
            Create escrow agreements for secure transactions with third-party
            verification
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={activeSection === "create" ? "default" : "outline"}
                onClick={() => setActiveSection("create")}
              >
                Create Escrow
              </Button>
              <Button
                variant={activeSection === "deposit" ? "default" : "outline"}
                onClick={() => setActiveSection("deposit")}
              >
                Deposit Funds
              </Button>
              <Button
                variant={activeSection === "manage" ? "default" : "outline"}
                onClick={() => setActiveSection("manage")}
              >
                Manage Escrows
              </Button>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  {activeSection === "create"
                    ? "Create Escrow Agreement"
                    : activeSection === "deposit"
                      ? "Deposit to Escrow"
                      : "Manage Escrow Agreements"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "create"
                    ? "Set up a new escrow agreement between parties"
                    : activeSection === "deposit"
                      ? "Deposit funds into an existing escrow"
                      : "View and manage your escrow agreements"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "create" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="seller">Seller Address</Label>
                      <Input id="seller" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="buyer">Buyer Address</Label>
                      <Input id="buyer" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="arbiter">
                        Arbiter Address (Optional)
                      </Label>
                      <Input id="arbiter" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="amount">Amount (ETH)</Label>
                      <Input id="amount" type="number" placeholder="0.1" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="escrowPeriod">Escrow Period (days)</Label>
                      <Input id="escrowPeriod" type="number" placeholder="7" />
                    </div>
                    <Button className="w-full">Create Escrow</Button>
                  </div>
                )}

                {activeSection === "deposit" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="escrowAddress">Escrow Address</Label>
                      <Input id="escrowAddress" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="depositAmount">Amount (ETH)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        placeholder="0.1"
                      />
                    </div>
                    <div className="mb-4 rounded border p-4">
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">
                          Required Amount
                        </span>
                        <span className="text-sm">0 ETH</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Current Balance
                        </span>
                        <span className="text-sm">0 ETH</span>
                      </div>
                    </div>
                    <Button className="w-full">Deposit to Escrow</Button>
                  </div>
                )}

                {activeSection === "manage" && (
                  <div className="space-y-4">
                    <div className="mb-4 rounded border p-4">
                      <h3 className="mb-2 text-sm font-medium">Your Role</h3>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="text-xs">
                          As Buyer
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          As Seller
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs">
                          As Arbiter
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="font-medium">Escrow #1</h3>
                            <span className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                              Pending
                            </span>
                          </div>
                          <div className="mb-3 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Buyer:
                              </span>
                              <span className="max-w-[200px] truncate">
                                0x123...abc
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Seller:
                              </span>
                              <span className="max-w-[200px] truncate">
                                0x456...def
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Amount:
                              </span>
                              <span>0.1 ETH</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" className="w-full text-xs">
                              Release
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full text-xs"
                            >
                              Refund
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
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
                  Connect your wallet to access escrow features
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Implementing secure escrow contracts</li>
            <li>Working with multiple parties and roles</li>
            <li>Time-based contract conditions</li>
            <li>Implementing dispute resolution mechanisms</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
