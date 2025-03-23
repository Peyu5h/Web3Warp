"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useWalletAuth } from "~/lib/hooks/useWalletAuth";
import { RegisterModal } from "~/components/auth/RegisterModal";
import { Button } from "~/components/ui/button";
import { Calculator } from "lucide-react";

export default function MainPage() {
  const { isConnected, address } = useAccount();
  const { user, isLoading, registerUser } = useWalletAuth();
  const [showRegister, setShowRegister] = useState(false);

  // Show registration modal if connected but no user found
  React.useEffect(() => {
    if (isConnected && !isLoading && !user) {
      setShowRegister(true);
    }
  }, [isConnected, isLoading, user]);

  return (
    <div className="container mx-auto py-8">
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
        </div>
      ) : (
        <>
          {!isConnected ? (
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <h1 className="text-4xl font-bold">Web3Wrap</h1>
              <p className="text-muted-foreground text-lg">
                Connect your wallet to get started
              </p>
              <w3m-button />
            </div>
          ) : user ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl">
                    Welcome{" "}
                    <span className="font-bold">
                      {user.name ||
                        `${address?.slice(0, 6)}...${address?.slice(-4)}`}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {user.role.charAt(0).toUpperCase() +
                      user.role.slice(1).toLowerCase()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Network Button */}
                  <w3m-network-button />

                  {/* Wallet Button */}
                  <w3m-button />

                  {/* Counter Link */}
                  <Link href="/counter">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Calculator className="h-5 w-5" />
                      Counter
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          <RegisterModal
            isOpen={showRegister}
            onClose={() => setShowRegister(false)}
            onSubmit={registerUser}
          />
        </>
      )}
    </div>
  );
}
