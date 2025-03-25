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

export default function NFTPage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "create" | "mint" | "view"
  >("create");

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col space-y-8">
        <div>
          <h1 className="mb-2 text-3xl font-bold">NFT Collection</h1>
          <p className="text-muted-foreground">
            Create and manage your own NFT collection
          </p>
        </div>

        {isConnected ? (
          <>
            <div className="flex space-x-4 overflow-x-auto">
              <Button
                variant={activeSection === "create" ? "default" : "outline"}
                onClick={() => setActiveSection("create")}
              >
                Create Collection
              </Button>
              <Button
                variant={activeSection === "mint" ? "default" : "outline"}
                onClick={() => setActiveSection("mint")}
              >
                Mint NFT
              </Button>
              <Button
                variant={activeSection === "view" ? "default" : "outline"}
                onClick={() => setActiveSection("view")}
              >
                View Collection
              </Button>
            </div>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  {activeSection === "create"
                    ? "Create NFT Collection"
                    : activeSection === "mint"
                      ? "Mint New NFT"
                      : "View Your NFTs"}
                </CardTitle>
                <CardDescription>
                  {activeSection === "create"
                    ? "Set up a new NFT collection with custom properties"
                    : activeSection === "mint"
                      ? "Mint a new NFT to your collection"
                      : "Browse your NFT collection"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSection === "create" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="collectionName">Collection Name</Label>
                      <Input
                        id="collectionName"
                        placeholder="My NFT Collection"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="symbol">Collection Symbol</Label>
                      <Input id="symbol" placeholder="NFT" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="baseUri">Base URI (optional)</Label>
                      <Input id="baseUri" placeholder="ipfs://..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="royaltyFee">Royalty Fee (%)</Label>
                      <Input id="royaltyFee" type="number" placeholder="2.5" />
                    </div>
                    <Button className="w-full">Create Collection</Button>
                  </div>
                )}

                {activeSection === "mint" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contractAddress">
                        Collection Address
                      </Label>
                      <Input id="contractAddress" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="recipient">Recipient</Label>
                      <Input id="recipient" placeholder="0x..." />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tokenURI">Token URI</Label>
                      <Input id="tokenURI" placeholder="ipfs://..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="imageUpload" className="mb-2 block">
                          Upload Image
                        </Label>
                        <div className="hover:bg-muted/50 cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors">
                          <p className="text-muted-foreground text-sm">
                            Click to upload
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="preview" className="mb-2 block">
                          Preview
                        </Label>
                        <div className="bg-muted flex aspect-square items-center justify-center rounded-md">
                          <p className="text-muted-foreground text-sm">
                            No preview
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button className="w-full">Mint NFT</Button>
                  </div>
                )}

                {activeSection === "view" && (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="contractAddress">
                        Collection Address
                      </Label>
                      <div className="flex gap-2">
                        <Input id="contractAddress" placeholder="0x..." />
                        <Button>Load</Button>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="bg-muted mb-3 flex aspect-square items-center justify-center rounded-md">
                            <p className="text-muted-foreground text-sm">
                              No NFTs found
                            </p>
                          </div>
                          <div>
                            <p className="truncate font-medium">NFT #1</p>
                            <p className="text-muted-foreground text-xs">
                              Owner: You
                            </p>
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
                  Connect your wallet to create and manage NFT collections
                </p>
                <w3m-button />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-muted rounded-lg p-4">
          <h3 className="mb-2 font-medium">Learnings:</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Creating ERC721 NFT collections</li>
            <li>Working with metadata and IPFS</li>
            <li>Implementing minting functionality</li>
            <li>Handling royalties for creators</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
