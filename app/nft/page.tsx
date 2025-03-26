"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Separator } from "~/components/ui/separator";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import {
  nftFactoryAbi,
  nftCollectionAbi,
  getNFTFactoryAddress,
} from "~/lib/abi/erc721";
import { sepolia } from "wagmi/chains";
import { toast } from "sonner";
import { useTransaction } from "~/lib/hooks/useTransaction";
import { isAddress } from "viem";
import Image from "next/image";
import { uploadToPinata } from "~/lib/hooks/usePinata";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Eye, ImagePlus, Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function NFTPage() {
  const { isConnected, address } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "create" | "mint" | "view"
  >("create");

  const [collectionName, setCollectionName] = useState("");
  const [collectionSymbol, setCollectionSymbol] = useState("");
  const [baseUri, setBaseUri] = useState("");
  const [royaltyFee, setRoyaltyFee] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [recipient, setRecipient] = useState("");
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewContractAddress, setViewContractAddress] = useState("");
  const [userNfts, setUserNfts] = useState<
    Array<{ id: string; tokenURI: string; metadata?: any }>
  >([]);
  const [isLoadingNfts, setIsLoadingNfts] = useState(false);
  const [pinataError, setPinataError] = useState<string | null>(null);

  const chainId = sepolia.id;
  const factoryAddress = getNFTFactoryAddress(chainId);

  const { data: userCollections } = useReadContract({
    address: factoryAddress,
    abi: nftFactoryAbi,
    functionName: "getCollectionsByCreator",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const createTransaction = useTransaction({
    successMessage: "NFT Collection created successfully!",
    onSuccess: () => {
      setCollectionName("");
      setCollectionSymbol("");
      setBaseUri("");
      setRoyaltyFee("");
    },
  });

  const mintTransaction = useTransaction({
    successMessage: "NFT minted successfully!",
    onSuccess: () => {
      setNftName("");
      setNftDescription("");
      setImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
  });

  const [isUploading, setIsUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);

      //preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateCollection = async () => {
    if (!collectionName || !collectionSymbol) {
      toast.error("Collection name and symbol are required");
      return;
    }

    const feeValue = parseFloat(royaltyFee);
    if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
      toast.error("Royalty fee must be between 0 and 100");
      return;
    }

    const royaltyBasisPoints = Math.round(feeValue * 100);

    try {
      createTransaction.write({
        address: factoryAddress,
        abi: nftFactoryAbi,
        functionName: "createNFTCollection",
        args: [
          collectionName,
          collectionSymbol,
          baseUri || "",
          royaltyBasisPoints,
        ],
      });
    } catch (error) {
      console.error("Error creating collection:", error);
    }
  };

  const handleMintNFT = async () => {
    if (!contractAddress || !isAddress(contractAddress)) {
      toast.error("Please enter a valid contract address");
      return;
    }

    if (!recipient || !isAddress(recipient)) {
      toast.error("Please enter a valid recipient address");
      return;
    }

    if (!nftName) {
      toast.error("NFT name is required");
      return;
    }

    if (!image) {
      toast.error("Please upload an image for your NFT");
      return;
    }

    try {
      setIsUploading(true);

      if (!(image instanceof File)) {
        toast.error("Invalid image file");
        return;
      }

      toast.info("Uploading image to IPFS...");
      const imageUrl = await uploadToPinata(image);

      if (!imageUrl) {
        toast.error("Failed to upload image to IPFS");
        return;
      }

      setIpfsUrl(imageUrl);

      toast.info("Creating metadata...");
      const metadata = {
        name: nftName,
        description: nftDescription || "",
        image: imageUrl,
        attributes: [],
      };

      // Convert metadata to Blob and upload
      const metadataBlob = new Blob([JSON.stringify(metadata)], {
        type: "application/json",
      });
      const metadataFile = new File(
        [metadataBlob],
        `${nftName.replace(/\s+/g, "-")}-metadata.json`,
        {
          type: "application/json",
        },
      );

      const metadataUrl = await uploadToPinata(metadataFile);

      if (!metadataUrl) {
        toast.error("Failed to upload metadata to IPFS");
        return;
      }

      mintTransaction.write({
        address: contractAddress as `0x${string}`,
        abi: nftCollectionAbi,
        functionName: "mintNFT",
        args: [recipient as `0x${string}`, metadataUrl],
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error(
        "Failed to mint NFT: " +
          (error instanceof Error ? error.message : String(error)),
      );
      setPinataError(
        error instanceof Error ? error.message : "Failed to upload to IPFS",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadNFTs = async () => {
    if (!viewContractAddress || !isAddress(viewContractAddress) || !address) {
      toast.error("Please enter a valid contract address");
      return;
    }

    setIsLoadingNfts(true);
    setUserNfts([]);

    try {
      // Get all tokens owned by the user
      const response = await fetch(
        `/api/nft/tokens?address=${viewContractAddress}&owner=${address}`,
      );
      const data = await response.json();
      console.log(data);

      if (data.success && data.data && data.data.tokens) {
        const uniqueNfts = data.data.tokens.reduce((acc: any[], nft: any) => {
          if (!acc.some((item) => item.id === nft.id)) {
            acc.push(nft);
          }
          return acc;
        }, []);

        setUserNfts(uniqueNfts);
      } else {
        toast.error(
          "Failed to load NFTs: " + (data.message || "Unknown error"),
        );
      }
    } catch (error) {
      console.error("Error loading NFTs:", error);
      toast.error("Failed to load NFTs");
    } finally {
      setIsLoadingNfts(false);
    }
  };

  // Effects
  useEffect(() => {
    if (pinataError) {
      toast.error(pinataError);
    }
  }, [pinataError]);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <Link
        href="/"
        className="text-muted-foreground hover:text-primary my-4 flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>
      <Card className="flex flex-col p-6">
        {isConnected ? (
          <>
            <Tabs
              defaultValue="create"
              value={activeSection}
              onValueChange={(value) =>
                setActiveSection(value as "create" | "mint" | "view")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Collection</TabsTrigger>
                <TabsTrigger value="mint">Mint NFT</TabsTrigger>
                <TabsTrigger value="view">View Collection</TabsTrigger>
              </TabsList>

              <Card className="mt-4 w-full">
                <CardHeader className="mb-2">
                  <CardTitle className="text-md">
                    {activeSection === "create"
                      ? "Create NFT Collection"
                      : activeSection === "mint"
                        ? "Mint New NFT"
                        : "View Your NFTs"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeSection === "create"
                      ? "Set up a new NFT collection with custom properties"
                      : activeSection === "mint"
                        ? "Mint a new NFT to your collection"
                        : "Browse your NFT collection"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsContent value="create">
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="collectionName">
                            Collection Name
                          </Label>
                          <Input
                            id="collectionName"
                            placeholder="My NFT Collection"
                            value={collectionName}
                            onChange={(e) => setCollectionName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="symbol">Collection Symbol</Label>
                          <Input
                            id="symbol"
                            placeholder="NFT"
                            value={collectionSymbol}
                            onChange={(e) =>
                              setCollectionSymbol(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="baseUri">Base URI (optional)</Label>
                          <Input
                            id="baseUri"
                            placeholder="ipfs://..."
                            value={baseUri}
                            onChange={(e) => setBaseUri(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="royaltyFee">Royalty Fee (%)</Label>
                          <Input
                            id="royaltyFee"
                            type="number"
                            placeholder="2.5"
                            value={royaltyFee}
                            onChange={(e) => setRoyaltyFee(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button
                        className="mt-2 w-full"
                        onClick={handleCreateCollection}
                        disabled={createTransaction.isLoading}
                      >
                        {createTransaction.isLoading
                          ? "Creating..."
                          : "Create Collection"}
                      </Button>

                      {userCollections ? (
                        userCollections.length > 0 ? (
                          <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium">
                                Your Collections ({userCollections.length})
                              </h3>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setActiveSection("mint");
                                  if (userCollections.length > 0) {
                                    setContractAddress(userCollections[0]);
                                  }
                                }}
                              >
                                Mint New NFT
                              </Button>
                            </div>
                            <div className="max-h-48 overflow-y-auto rounded-md border">
                              {userCollections.map((collection, index) => (
                                <div
                                  key={index}
                                  className="border-border/40 hover:bg-accent/50 flex items-center justify-between border-b p-2 transition-colors last:border-b-0"
                                >
                                  <div className="overflow-hidden">
                                    <div className="flex items-center space-x-2">
                                      <span className="bg-primary/10 text-primary w-8 rounded-full px-2 py-0.5 text-center text-xs">
                                        #{index + 1}
                                      </span>
                                      <div className="text-muted-foreground truncate font-mono text-xs">
                                        {collection}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-muted-foreground hover:text-foreground h-7 w-7"
                                      onClick={() => {
                                        setActiveSection("view");
                                        setViewContractAddress(collection);
                                        handleLoadNFTs();
                                      }}
                                    >
                                      <Eye className="h-6 w-6" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-muted-foreground hover:text-foreground h-7 w-7"
                                      onClick={() => {
                                        setActiveSection("mint");
                                        setContractAddress(collection);
                                      }}
                                    >
                                      <Plus className="h-6 w-6" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-6 rounded-md border border-dashed p-6 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted-foreground mx-auto mb-3"
                            >
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="3"
                                rx="2"
                                ry="2"
                              />
                              <path d="M12 8v8" />
                              <path d="M8 12h8" />
                            </svg>
                            <h3 className="mb-1 text-sm font-medium">
                              No collections yet
                            </h3>
                            <p className="text-muted-foreground mb-3 text-xs">
                              Create your first NFT collection above
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="mt-6 flex justify-center">
                          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="mint">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="contractAddress">
                          Collection Address
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="contractAddress"
                            placeholder="0x..."
                            value={contractAddress}
                            onChange={(e) => setContractAddress(e.target.value)}
                          />
                        </div>
                        {userCollections && userCollections.length > 0 && (
                          <div className="mt-1">
                            <Select
                              value={contractAddress || ""}
                              onValueChange={(value) => {
                                if (value) setContractAddress(value);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select one of your collections" />
                              </SelectTrigger>
                              <SelectContent>
                                {userCollections.map((collection, index) => (
                                  <SelectItem key={index} value={collection}>
                                    Collection #{index + 1}:{" "}
                                    {collection.substring(0, 10)}...
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="recipient">Recipient</Label>
                        <div className="flex gap-2">
                          <Input
                            id="recipient"
                            placeholder="0x..."
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => address && setRecipient(address)}
                            className="whitespace-nowrap"
                          >
                            Use My Wallet
                          </Button>
                        </div>
                      </div>
                      <div className="flex w-full items-center gap-2">
                        <div className="grid w-full gap-2">
                          <Label htmlFor="nftName">NFT Name</Label>
                          <Input
                            id="nftName"
                            placeholder="My Awesome NFT"
                            value={nftName}
                            onChange={(e) => setNftName(e.target.value)}
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="nftDescription">
                            Description (optional)
                          </Label>
                          <Input
                            id="nftDescription"
                            placeholder="Description of your NFT"
                            value={nftDescription}
                            onChange={(e) => setNftDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Label htmlFor="imageUpload" className="mb-1">
                            Upload Image
                          </Label>
                          <div
                            className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed p-4 text-center transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                            style={{ height: "160px" }}
                          >
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="hidden"
                            />
                            <ImagePlus className="text-muted-foreground h-6 w-6" />
                            <p className="text-muted-foreground text-sm font-medium">
                              Click to upload
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              SVG, PNG, JPG or GIF (max. 5MB)
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="preview" className="mb-1">
                            Preview
                          </Label>
                          <div
                            className="bg-muted flex items-center justify-center overflow-hidden rounded-md"
                            style={{ height: "160px" }}
                          >
                            {imagePreview ? (
                              <Image
                                height={300}
                                width={300}
                                src={imagePreview}
                                alt="NFT Preview"
                                className="h-full w-full object-contain"
                              />
                            ) : (
                              <div className="text-center">
                                <p className="text-muted-foreground text-sm">
                                  No preview
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs">
                                  Upload an image to see preview
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleMintNFT}
                        disabled={mintTransaction.isLoading}
                      >
                        {mintTransaction.isLoading
                          ? "Processing..."
                          : "Mint NFT"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="view">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="viewContractAddress">
                          Collection Address
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="viewContractAddress"
                            placeholder="0x..."
                            value={viewContractAddress}
                            onChange={(e) =>
                              setViewContractAddress(e.target.value)
                            }
                          />
                          <Button
                            onClick={handleLoadNFTs}
                            disabled={isLoadingNfts}
                            className="whitespace-nowrap"
                          >
                            {isLoadingNfts ? "Loading..." : "Load NFTs"}
                          </Button>
                        </div>

                        {userCollections && userCollections.length > 0 && (
                          <div className="mt-1">
                            <Select
                              value={viewContractAddress || ""}
                              onValueChange={(value) => {
                                if (value) {
                                  setViewContractAddress(value);
                                  // Automatically load NFTs when a collection is selected
                                  setTimeout(() => {
                                    if (address && isAddress(value)) {
                                      handleLoadNFTs();
                                    }
                                  }, 100);
                                }
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select one of your collections" />
                              </SelectTrigger>
                              <SelectContent>
                                {userCollections.map((collection, index) => (
                                  <SelectItem key={index} value={collection}>
                                    Collection #{index + 1}:{" "}
                                    {collection.substring(0, 10)}...
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {userNfts.length > 0 ? (
                          userNfts.map((nft, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="bg-muted mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-md">
                                  {nft.metadata?.image ? (
                                    <Image
                                      height={300}
                                      width={300}
                                      src={nft.metadata.image.replace(
                                        "ipfs://",
                                        "https://gateway.pinata.cloud/ipfs/",
                                      )}
                                      alt={nft.metadata.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <p className="text-muted-foreground text-sm">
                                      No image
                                    </p>
                                  )}
                                </div>
                                <div>
                                  <p className="truncate font-medium">
                                    {nft.metadata?.name || `NFT #${nft.id}`}
                                  </p>
                                  <p className="text-muted-foreground truncate text-xs">
                                    {nft.metadata?.description ||
                                      "No description"}
                                  </p>
                                  <p className="text-muted-foreground mt-1 text-xs">
                                    Owner: You
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="48"
                              height="48"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-muted-foreground mb-4"
                            >
                              <rect
                                width="18"
                                height="18"
                                x="3"
                                y="3"
                                rx="2"
                                ry="2"
                              />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                            <p className="text-muted-foreground font-medium">
                              No NFTs found in this collection
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Try selecting a different collection or minting a
                              new NFT
                            </p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => setActiveSection("mint")}
                            >
                              Mint New NFT
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </Tabs>
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
      </Card>
    </div>
  );
}
