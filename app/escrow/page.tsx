"use client";

import React, { useState, useEffect } from "react";
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
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Package,
  Wallet,
  Clock,
  Code,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useEscrow } from "~/lib/hooks/useEscrow";
import { toast } from "sonner";
import { isAddress, formatEther } from "viem";

export default function EscrowPage() {
  const { isConnected } = useAccount();
  const [activeSection, setActiveSection] = useState<
    "create" | "deposit" | "manage"
  >("create");

  const [seller, setSeller] = useState("");
  const [arbiter, setArbiter] = useState("");
  const [amount, setAmount] = useState("");
  const [escrowPeriod, setEscrowPeriod] = useState("");
  const [escrowId, setEscrowId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [activeRole, setActiveRole] = useState<"buyer" | "seller" | "arbiter">(
    "buyer",
  );

  const {
    createEscrow,
    createUnfundedEscrow,
    depositToEscrow,
    escrows,
    isLoadingEscrows,
    isPending,
    isConfirming,
    releaseEscrow,
    refundEscrow,
    refetchEscrows,
    address,
    setSelectedEscrow,
    specificEscrowDetails,
    requiredFunds,
    isLoadingSpecificEscrow,
    isLoadingRequiredFunds,
  } = useEscrow();

  // Refresh escrows when role changes
  useEffect(() => {
    if (isConnected) {
      refetchEscrows();
    }
  }, [isConnected, activeRole, refetchEscrows]);

  // Update selected escrow for deposit tab
  useEffect(() => {
    if (escrowId) {
      setSelectedEscrow(escrowId);
    }
  }, [escrowId, setSelectedEscrow]);

  // Update deposit amount when required funds change
  useEffect(() => {
    if (requiredFunds) {
      setDepositAmount(formatEther(requiredFunds));
    }
  }, [requiredFunds]);

  // Validate common form fields
  const validateCommonFields = () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return false;
    }

    if (!seller || !isAddress(seller)) {
      toast.error("Please enter a valid seller address");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return false;
    }

    if (!escrowPeriod || parseInt(escrowPeriod) <= 0) {
      toast.error("Please enter a valid escrow period");
      return false;
    }

    if (arbiter && !isAddress(arbiter)) {
      toast.error("Please enter a valid arbiter address");
      return false;
    }

    return true;
  };

  const resetFormAndSwitch = (section: "create" | "deposit" | "manage") => {
    setSeller("");
    setArbiter("");
    setAmount("");
    setEscrowPeriod("");
    setActiveSection(section);
  };

  const handleCreateEscrow = async () => {
    if (!validateCommonFields()) return;

    try {
      await createEscrow(
        seller,
        arbiter || null,
        amount,
        parseInt(escrowPeriod),
      );
      resetFormAndSwitch("manage");
    } catch (error) {
      console.error("Error creating escrow:", error);
    }
  };

  const handleCreateUnfundedEscrow = async () => {
    if (!validateCommonFields()) return;

    try {
      await createUnfundedEscrow(
        seller,
        arbiter || null,
        amount,
        parseInt(escrowPeriod),
      );
      resetFormAndSwitch("deposit");
    } catch (error) {
      console.error("Error creating unfunded escrow:", error);
    }
  };

  const handleDepositToEscrow = async () => {
    if (!isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!escrowId) {
      toast.error("Please enter a valid escrow ID");
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await depositToEscrow(escrowId, depositAmount);
      setEscrowId("");
      setDepositAmount("");
      setActiveSection("manage");
    } catch (error) {
      console.error("Error depositing to escrow:", error);
    }
  };

  const handleReleaseEscrow = async (escrowId: string) => {
    try {
      await releaseEscrow(escrowId);
    } catch (error) {
      console.error("Error releasing escrow:", error);
    }
  };

  const handleRefundEscrow = async (escrowId: string) => {
    try {
      await refundEscrow(escrowId);
    } catch (error) {
      console.error("Error refunding escrow:", error);
    }
  };

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
                setActiveSection(value as "create" | "deposit" | "manage")
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="create">Create Escrow</TabsTrigger>
                <TabsTrigger value="deposit">Deposit Funds</TabsTrigger>
                <TabsTrigger value="manage">Manage Escrows</TabsTrigger>
              </TabsList>

              <Card className="mt-4 w-full">
                <CardHeader className="mb-2">
                  <CardTitle className="text-md">
                    {activeSection === "create"
                      ? "Create Escrow Agreement"
                      : activeSection === "deposit"
                        ? "Deposit to Escrow"
                        : "Manage Escrow Agreements"}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {activeSection === "create"
                      ? "Set up a new escrow agreement between parties"
                      : activeSection === "deposit"
                        ? "Deposit funds into an existing escrow"
                        : "View and manage your escrow agreements"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TabsContent value="create">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="seller">Seller Address</Label>
                        <Input
                          id="seller"
                          placeholder="0x..."
                          value={seller}
                          onChange={(e) => setSeller(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="arbiter">
                          Arbiter Address (Optional)
                        </Label>
                        <Input
                          id="arbiter"
                          placeholder="0x..."
                          value={arbiter}
                          onChange={(e) => setArbiter(e.target.value)}
                        />
                      </div>
                      <div className="flex w-full items-center gap-2">
                        <div className="grid w-full gap-2">
                          <Label htmlFor="amount">Amount (ETH)</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                          />
                        </div>
                        <div className="grid w-full gap-2">
                          <Label htmlFor="escrowPeriod">
                            Escrow Period (days)
                          </Label>
                          <Input
                            id="escrowPeriod"
                            type="number"
                            placeholder="7"
                            value={escrowPeriod}
                            onChange={(e) => setEscrowPeriod(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          className="w-full"
                          onClick={handleCreateEscrow}
                          disabled={isPending || isConfirming}
                        >
                          {isPending || isConfirming
                            ? "Processing..."
                            : "Create & Fund Escrow"}
                        </Button>
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleCreateUnfundedEscrow}
                          disabled={isPending || isConfirming}
                        >
                          Create Unfunded Escrow
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="deposit">
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="escrowId">Escrow ID</Label>
                        <Input
                          id="escrowId"
                          placeholder="123"
                          value={escrowId}
                          onChange={(e) => setEscrowId(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="depositAmount">Amount (ETH)</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          placeholder="0.1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          disabled={isLoadingRequiredFunds}
                        />
                      </div>
                      <div className="mb-4 rounded border p-4">
                        <div className="mb-2 flex justify-between">
                          <span className="text-sm font-medium">
                            Required Amount
                          </span>
                          <span className="text-sm">
                            {isLoadingRequiredFunds
                              ? "Loading..."
                              : requiredFunds
                                ? `${formatEther(requiredFunds)} ETH`
                                : "0 ETH"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            Escrow Status
                          </span>
                          <span className="text-sm">
                            {isLoadingSpecificEscrow
                              ? "Loading..."
                              : specificEscrowDetails
                                ? specificEscrowDetails.isFunded
                                  ? "Already Funded"
                                  : "Not Funded"
                                : "Unknown"}
                          </span>
                        </div>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleDepositToEscrow}
                        disabled={
                          isPending ||
                          isConfirming ||
                          isLoadingSpecificEscrow ||
                          isLoadingRequiredFunds ||
                          (specificEscrowDetails?.isFunded ?? false)
                        }
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        {isPending || isConfirming
                          ? "Processing..."
                          : "Deposit to Escrow"}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="manage">
                    <div className="space-y-4">
                      <div className="mb-4 rounded border p-4">
                        <h3 className="mb-2 text-sm font-medium">Your Role</h3>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant={
                              activeRole === "buyer" ? "default" : "outline"
                            }
                            className="text-xs"
                            onClick={() => setActiveRole("buyer")}
                          >
                            <Wallet className="mr-1 h-3 w-3" />
                            As Buyer
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              activeRole === "seller" ? "default" : "outline"
                            }
                            className="text-xs"
                            onClick={() => setActiveRole("seller")}
                          >
                            <Package className="mr-1 h-3 w-3" />
                            As Seller
                          </Button>
                          <Button
                            size="sm"
                            variant={
                              activeRole === "arbiter" ? "default" : "outline"
                            }
                            className="text-xs"
                            onClick={() => setActiveRole("arbiter")}
                          >
                            <Code className="mr-1 h-3 w-3" />
                            As Arbiter
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="space-y-4">
                        {isLoadingEscrows ? (
                          <div className="flex justify-center py-8">
                            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                          </div>
                        ) : escrows && escrows.length > 0 ? (
                          escrows.map((escrow) => (
                            <Card key={escrow.id.toString()}>
                              <CardContent className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <h3 className="font-medium">
                                    Escrow #{escrow.id.toString()}
                                  </h3>
                                  <span
                                    className={`rounded px-2 py-1 text-xs ${
                                      escrow.status === 0
                                        ? "bg-yellow-100 text-yellow-800"
                                        : escrow.status === 1
                                          ? "bg-green-100 text-green-800"
                                          : escrow.status === 2
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {escrow.statusText}
                                  </span>
                                </div>
                                <div className="mb-3 space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Buyer:
                                    </span>
                                    <span className="max-w-[200px] truncate">
                                      {escrow.buyer}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Seller:
                                    </span>
                                    <span className="max-w-[200px] truncate">
                                      {escrow.seller}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Amount:
                                    </span>
                                    <span>{escrow.amount} ETH</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                      Funded:
                                    </span>
                                    <span>
                                      {escrow.isFunded ? "Yes" : "No"}
                                    </span>
                                  </div>

                                  {escrow.remainingTime && (
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground flex items-center">
                                        <Clock className="mr-1 h-3 w-3" />
                                        Expires in:
                                      </span>
                                      <span>{escrow.remainingTime}</span>
                                    </div>
                                  )}
                                </div>

                                {escrow.status === 0 && escrow.isFunded ? (
                                  <div className="grid w-full grid-cols-2 gap-2">
                                    {/* Only buyer and arbiter can release */}
                                    {(activeRole === "buyer" ||
                                      activeRole === "arbiter") && (
                                      <Button
                                        size="sm"
                                        className="w-full text-xs"
                                        onClick={() =>
                                          handleReleaseEscrow(
                                            escrow.id.toString(),
                                          )
                                        }
                                        disabled={isPending || isConfirming}
                                      >
                                        Release
                                      </Button>
                                    )}

                                    {/* Only seller and arbiter can refund */}
                                    {(activeRole === "seller" ||
                                      activeRole === "arbiter") && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full text-xs"
                                        onClick={() =>
                                          handleRefundEscrow(
                                            escrow.id.toString(),
                                          )
                                        }
                                        disabled={isPending || isConfirming}
                                      >
                                        Refund
                                      </Button>
                                    )}
                                  </div>
                                ) : escrow.status === 0 &&
                                  !escrow.isFunded &&
                                  activeRole === "buyer" ? (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setEscrowId(escrow.id.toString());
                                      setDepositAmount(escrow.amount);
                                      setActiveSection("deposit");
                                    }}
                                    className="w-full text-xs"
                                  >
                                    <CreditCard className="mr-1 h-3 w-3" />
                                    Fund Escrow
                                  </Button>
                                ) : null}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="text-muted-foreground mb-4 rounded-full bg-gray-100 p-4">
                              <Package className="h-8 w-8" />
                            </div>
                            <h3 className="mb-1 text-lg font-medium">
                              No Escrows Found
                            </h3>
                            <p className="text-muted-foreground mb-4 max-w-sm">
                              You don&apos;t have any escrows associated with
                              your account as {activeRole}.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => setActiveSection("create")}
                            >
                              Create Your First Escrow
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
          <div className="flex flex-col items-center justify-center py-8">
            <p className="mb-4 text-center">
              Connect your wallet to access escrow features
            </p>
            <w3m-button />
          </div>
        )}
      </Card>
    </div>
  );
}
