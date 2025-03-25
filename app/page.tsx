"use client";

import { Button } from "~/components/ui/button";
import Link from "next/link";
import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useWalletAuth } from "~/lib/hooks/useWalletAuth";
import { RegisterModal } from "~/components/auth/RegisterModal";

export default function MainPage() {
  const { isConnected, address } = useAccount();
  const { user, isLoading, registerUser } = useWalletAuth();
  const [showRegister, setShowRegister] = useState(false);

  React.useEffect(() => {
    if (isConnected && !isLoading && !user) {
      setShowRegister(true);
    }
  }, [isConnected, isLoading, user]);
  console.log(user);
  return (
    <div className="container mx-auto">
      <div className="flex h-screen flex-col items-center justify-center">
        <w3m-button />

        {isConnected ? (
          <div className="w-full max-w-5xl space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Welcome {user?.name}</h2>
              <w3m-network-button />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Level 1: Basics */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Basic Projects</CardTitle>
                  <CardDescription>
                    Fundamental concepts and interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <Link href="/send" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Send Funds
                    </Button>
                  </Link>
                  <Link href="/counter" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Counter dApp
                    </Button>
                  </Link>
                  <Link href="/token" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      ERC20 Token
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Level 2: Intermediate */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Intermediate Projects</CardTitle>
                  <CardDescription>DeFi and NFT applications</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <Link href="/staking" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Token Staking
                    </Button>
                  </Link>
                  <Link href="/nft" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      NFT Collection
                    </Button>
                  </Link>
                  <Link href="/escrow" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Escrow Service
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Level 3: Advanced */}
              <Card className="flex flex-col">
                <CardHeader>
                  <CardTitle>Advanced Projects</CardTitle>
                  <CardDescription>DeFi protocols and DAOs</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <Link href="/swap" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      Token Swap
                    </Button>
                  </Link>
                  <Link href="/nft-marketplace" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      NFT Marketplace
                    </Button>
                  </Link>
                  <Link href="/dao" className="block w-full">
                    <Button variant="outline" className="w-full justify-start">
                      DAO Governance
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="mt-4 w-full max-w-md">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4 text-center">
                Connect your wallet to access
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSubmit={registerUser}
      />
    </div>
  );
}
