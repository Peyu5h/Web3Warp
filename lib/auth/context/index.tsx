"use client";

import { wagmiAdapter, projectId, config } from "@/lib/auth/config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";

import { arbitrum, mainnet, sepolia } from "@reown/appkit/networks";
import React, { useState, useEffect, type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";

function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const [queryClient] = useState(() => new QueryClient());

  const initialState = cookies
    ? cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)
    : undefined;

  // Set up metadata
  const metadata = {
    name: "Reown-test",
    description: "AppKit Example",
    url: "https://reown.com/appkit",
    icons: ["https://assets.reown.com/reown-profile-pic.png"],
  };

  const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [sepolia],
    metadata: metadata,
    features: {
      analytics: true, // Optional - defaults to your Cloud configuration
    },
    themeMode: "dark",
  });

  // Create modal on client-side only to avoid hydration mismatch
  //   useEffect(() => {
  //     if (typeof window !== "undefined") {
  //       const modal = createAppKit({
  //         adapters: [wagmiAdapter],
  //         projectId,
  //         networks: [mainnet, vTestnet, polygon, sepolia],
  //         defaultNetwork: vTestnet,
  //         metadata: metadata,
  //         features: {
  //           analytics: true,
  //           //   email: true,
  //           //   socials: ["google"],
  //           //   emailShowWallets: true,
  //         },
  //         themeMode: "dark",
  //       });
  //     }
  //   }, []);

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
