"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { useAccount } from "wagmi";

export default function MainPage() {
  const { isConnected } = useAccount();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <w3m-button />

      <div className="mt-8">
        {isConnected ? (
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <w3m-network-button />
            <Link href="/send">
              <Button variant="secondary">Send Funds</Button>
            </Link>
            <Link href="/counter">
              <Button variant="default">Counter dApp</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-muted rounded-lg p-4 text-center">
            Connect your wallet to access features
          </div>
        )}
      </div>
    </div>
  );
}
