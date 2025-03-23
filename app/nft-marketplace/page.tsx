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

export default function NFTMarketplacePage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "browse" | "sell" | "owned"
  >("browse");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">NFT Marketplace</h1>
          <p className="text-muted-foreground">
            Buy, sell, and browse NFTs from various collections
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={activeSection === "browse" ? "default" : "outline"}
                onClick={() => setActiveSection("browse")}
              >
                Browse Market
              </Button>
              <Button
                variant={activeSection === "sell" ? "default" : "outline"}
                onClick={() => setActiveSection("sell")}
              >
                Sell NFT
              </Button>
              <Button
                variant={activeSection === "owned" ? "default" : "outline"}
                onClick={() => setActiveSection("owned")}
              >
                My NFTs
              </Button>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  {activeSection === "browse"
                    ? "Browse NFTs"
                    : activeSection === "sell"
                      ? "List NFT for Sale"
                      : "Your NFT Collection"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "browse"
                    ? "Discover and purchase NFTs from various collections"
                    : activeSection === "sell"
                      ? "List your NFT for sale on the marketplace"
                      : "View and manage your owned NFTs"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "browse" && (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <div className="flex-grow">
                        <Input placeholder="Search NFTs or collections..." />
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Price: All
                        </Button>
                        <Button variant="outline" size="sm">
                          Recently Listed
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden">
                          <div className="bg-muted flex aspect-square items-center justify-center">
                            <p className="text-muted-foreground">
                              NFT Image #{i}
                            </p>
                          </div>
                          <CardContent className="p-4">
                            <div className="mb-2 flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">Cool NFT #{i}</h3>
                                <p className="text-muted-foreground text-xs">
                                  Collection Name
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">0.05 ETH</p>
                                <p className="text-muted-foreground text-xs">
                                  $100.00
                                </p>
                              </div>
                            </div>
                            <Button className="mt-2 w-full" size="sm">
                              Buy Now
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {activeSection === "sell" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="nftCollection">
                        NFT Collection Address
                      </Label>
                      <Input id="nftCollection" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tokenId">Token ID</Label>
                      <Input id="tokenId" type="number" placeholder="1" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="price">Price (ETH)</Label>
                      <Input id="price" type="number" placeholder="0.05" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="duration">Listing Duration (days)</Label>
                      <Input id="duration" type="number" placeholder="7" />
                    </div>

                    <div className="mt-6 flex gap-4">
                      <div className="w-1/3">
                        <div className="bg-muted flex aspect-square items-center justify-center rounded-md">
                          <p className="text-muted-foreground text-sm">
                            NFT Preview
                          </p>
                        </div>
                      </div>
                      <div className="w-2/3">
                        <div className="h-full space-y-2 rounded border p-4">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Marketplace Fee
                            </span>
                            <span className="text-sm">2.5%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              Creator Royalties
                            </span>
                            <span className="text-sm">5.0%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">
                              You Receive
                            </span>
                            <span className="text-sm">0.04625 ETH</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="mt-4 w-full">List for Sale</Button>
                  </div>
                )}

                {activeSection === "owned" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[1, 2].map((i) => (
                        <Card key={i} className="overflow-hidden">
                          <div className="bg-muted flex aspect-square items-center justify-center">
                            <p className="text-muted-foreground">
                              Your NFT #{i}
                            </p>
                          </div>
                          <CardContent className="p-4">
                            <div className="mb-2">
                              <h3 className="font-medium">Your NFT #{i}</h3>
                              <p className="text-muted-foreground text-xs">
                                Collection Name
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="w-full"
                                size="sm"
                                variant="outline"
                              >
                                List
                              </Button>
                              <Button
                                className="w-full"
                                size="sm"
                                variant="outline"
                              >
                                Transfer
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Card className="overflow-hidden border-dashed">
                        <div className="flex aspect-square items-center justify-center">
                          <div className="p-4 text-center">
                            <p className="text-muted-foreground mb-2">
                              No more NFTs found
                            </p>
                            <Button variant="outline" size="sm">
                              Browse Market
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Active Listings</h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-muted flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md">
                              <p className="text-muted-foreground text-xs">
                                NFT
                              </p>
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium">Listed NFT #1</h4>
                              <p className="text-muted-foreground text-xs">
                                Listed for 0.05 ETH · 5 days remaining
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Cancel
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
                  Connect your wallet to access the NFT marketplace
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Creating a decentralized NFT marketplace</li>
            <li>Implementing listing and auction mechanics</li>
            <li>Handling royalties for creators</li>
            <li>Creating NFT metadata standards</li>
            <li>Implementing marketplace fees and revenue distribution</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
