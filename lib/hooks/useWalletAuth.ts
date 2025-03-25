import { useEffect, useState } from "react";
import { useAccount, useChainId, useDisconnect } from "wagmi";
import { api } from "~/lib/api";
import { toast } from "sonner";
import { sepolia } from "viem/chains";
import { useQueryClient } from "@tanstack/react-query";

export type User = {
  id: string;
  name: string;
  walletAddress: string;
  role: "CUSTOMER" | "RETAILER" | "LOGISTIC";
};

export const useWalletAuth = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chainId = useChainId();
  const queryClient = useQueryClient();

  const fetchUser = async (walletAddress: string) => {
    try {
      const response = await api.get<User>(
        `/api/users/wallet/${walletAddress}`,
      );
      if (response.success) {
        setUser(response.data);
      }
    } catch (error) {
      if ((error as Error).message !== "User not found") {
        console.error("Error fetching user:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && chainId === sepolia.id) {
      fetchUser(address);
    }
  }, [address, chainId, isConnected]);

  const registerUser = async (input: { name: string; role: User["role"] }) => {
    try {
      if (!address) throw new Error("No wallet connected");

      const response = await api.post<User>("/api/users", {
        ...input,
        walletAddress: address,
      });

      if (response.success) {
        setUser(response.data);
        toast.success("Registration successful!");
        queryClient.invalidateQueries({ queryKey: ["user", address] });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      toast.error("Failed to register user");
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isConnected,
    currentWallet: address,
    registerUser,
  };
};
