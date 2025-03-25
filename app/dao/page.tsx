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

export default function DAOPage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "proposals" | "create" | "voting"
  >("proposals");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">DAO Governance</h1>
          <p className="text-muted-foreground">
            Create and participate in decentralized governance
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={activeSection === "proposals" ? "default" : "outline"}
                onClick={() => setActiveSection("proposals")}
              >
                View Proposals
              </Button>
              <Button
                variant={activeSection === "create" ? "default" : "outline"}
                onClick={() => setActiveSection("create")}
              >
                Create Proposal
              </Button>
              <Button
                variant={activeSection === "voting" ? "default" : "outline"}
                onClick={() => setActiveSection("voting")}
              >
                Voting Power
              </Button>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  {activeSection === "proposals"
                    ? "Active Proposals"
                    : activeSection === "create"
                      ? "Create New Proposal"
                      : "Your Voting Power"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "proposals"
                    ? "Browse and vote on active proposals"
                    : activeSection === "create"
                      ? "Submit a new proposal to the DAO"
                      : "Manage your governance tokens and voting power"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "proposals" && (
                  <div className="space-y-4">
                    <div className="mb-4 flex space-x-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                      >
                        Active
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      >
                        Passed
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      >
                        Failed
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      >
                        Executed
                      </Button>
                    </div>

                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">
                              Proposal #1: Treasury Fund Allocation
                            </h3>
                            <p className="text-muted-foreground text-xs">
                              Created by: 0x123...abc · 2 days ago
                            </p>
                          </div>
                          <div className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                            Active
                          </div>
                        </div>
                        <p className="mb-4 text-sm">
                          This proposal suggests allocating 10 ETH from the
                          treasury for community development initiatives.
                        </p>
                        <div className="mb-4 space-y-2">
                          <div className="bg-muted h-2 w-full rounded-full">
                            <div className="h-2 w-[65%] rounded-full bg-green-500"></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>For: 65%</span>
                            <span>Against: 35%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button className="w-full" size="sm">
                            Vote For
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                          >
                            Vote Against
                          </Button>
                          <Button className="w-full" variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="mb-4">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">
                              Proposal #2: Protocol Upgrade
                            </h3>
                            <p className="text-muted-foreground text-xs">
                              Created by: 0x456...def · 5 days ago
                            </p>
                          </div>
                          <div className="rounded bg-yellow-100 px-2 py-1 text-xs text-yellow-800">
                            Active
                          </div>
                        </div>
                        <p className="mb-4 text-sm">
                          Proposal to upgrade the protocol contracts to improve
                          security and add new features.
                        </p>
                        <div className="mb-4 space-y-2">
                          <div className="bg-muted h-2 w-full rounded-full">
                            <div className="h-2 w-[75%] rounded-full bg-green-500"></div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>For: 75%</span>
                            <span>Against: 25%</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button className="w-full" size="sm">
                            Vote For
                          </Button>
                          <Button
                            className="w-full"
                            variant="outline"
                            size="sm"
                          >
                            Vote Against
                          </Button>
                          <Button className="w-full" variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeSection === "create" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="proposalTitle">Proposal Title</Label>
                      <Input
                        id="proposalTitle"
                        placeholder="Treasury Fund Allocation"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="proposalDescription">Description</Label>
                      <textarea
                        id="proposalDescription"
                        rows={5}
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Describe your proposal in detail..."
                      />
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">
                        Actions to Execute
                      </h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="grid gap-2">
                            <Label htmlFor="targetContract">
                              Target Contract
                            </Label>
                            <Input id="targetContract" placeholder="0x..." />
                          </div>
                          <div className="mt-2 grid gap-2">
                            <Label htmlFor="calldata">
                              Function Signature & Parameters
                            </Label>
                            <Input
                              id="calldata"
                              placeholder="transfer(address,uint256)"
                            />
                          </div>
                          <div className="mt-2 grid gap-2">
                            <Label htmlFor="value">ETH Value</Label>
                            <Input id="value" type="number" placeholder="0" />
                          </div>
                        </CardContent>
                      </Card>
                      <Button variant="outline" size="sm">
                        + Add Action
                      </Button>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="votingPeriod">Voting Period (days)</Label>
                      <Input id="votingPeriod" type="number" placeholder="7" />
                    </div>
                    <div className="space-y-2 rounded border p-4">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Required Quorum
                        </span>
                        <span className="text-sm">10% of token supply</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          Threshold to Pass
                        </span>
                        <span className="text-sm">51% majority</span>
                      </div>
                    </div>
                    <Button className="w-full">Create Proposal</Button>
                  </div>
                )}

                {activeSection === "voting" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="mb-1 text-sm font-medium">
                            Your Voting Power
                          </h3>
                          <p className="text-2xl font-bold">0 Votes</p>
                          <p className="text-muted-foreground text-xs">
                            0% of total voting power
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="mb-1 text-sm font-medium">
                            Delegated To You
                          </h3>
                          <p className="text-2xl font-bold">0 Votes</p>
                          <p className="text-muted-foreground text-xs">
                            From 0 delegators
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h3 className="mb-1 text-sm font-medium">
                            Proposals Voted
                          </h3>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-muted-foreground text-xs">
                            0% participation rate
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          Manage Voting Power
                        </CardTitle>
                        <CardDescription>
                          Delegate your voting power or acquire more governance
                          tokens
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="delegateTo">
                              Delegate Voting Power To
                            </Label>
                            <Input id="delegateTo" placeholder="0x..." />
                          </div>
                          <Button>Delegate</Button>

                          <Separator className="my-4" />

                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              DAO Token Balance
                            </span>
                            <span className="text-sm">0 DAO</span>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="acquireAmount">
                              Amount to Acquire
                            </Label>
                            <Input
                              id="acquireAmount"
                              type="number"
                              placeholder="100"
                            />
                          </div>
                          <Button variant="outline">Get DAO Tokens</Button>
                        </div>
                      </CardContent>
                    </Card>
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
                  Connect your wallet to access DAO governance features
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Creating governance token contracts</li>
            <li>Implementing DAO proposal systems</li>
            <li>Creating voting mechanisms</li>
            <li>Implementing timelock contracts for security</li>
            <li>Executing on-chain governance decisions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
