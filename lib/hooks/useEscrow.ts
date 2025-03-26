import { useState, useEffect, useMemo } from "react";
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { formatEther, parseEther } from "viem";
import { sepolia } from "wagmi/chains";
import {
  escrowAbi,
  getEscrowAddress,
  EscrowStatus,
  EscrowAgreement,
} from "~/lib/abi/escrow";
import { useTransaction } from "~/lib/hooks/useTransaction";

export interface EscrowDetails extends Omit<EscrowAgreement, "amount"> {
  amount: string;
  remainingTime?: string | null;
  statusText: string;
}

type EscrowFunction =
  | "createEscrow"
  | "createUnfundedEscrow"
  | "depositToEscrow"
  | "getRequiredFunds"
  | "releaseEscrow"
  | "refundEscrow"
  | "refundExpiredEscrow"
  | "disputeEscrow"
  | "getEscrowsByUser"
  | "getEscrowsAsBuyer"
  | "getEscrowsAsSeller"
  | "getEscrowsAsArbiter"
  | "getEscrowDetails"
  | "getEscrowCount";

interface WriteContractConfig {
  address: `0x${string}`;
  abi: typeof escrowAbi;
  functionName: EscrowFunction;
  args: any[];
  value?: bigint;
}

export function useEscrow() {
  const [selectedEscrow, setSelectedEscrow] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<"buyer" | "seller" | "arbiter">(
    "buyer",
  );
  const { address, isConnected } = useAccount();
  const chainId = sepolia.id;
  const escrowAddress = getEscrowAddress(chainId);

  // Use transaction hook for contract writes
  const transaction = useTransaction({
    successMessage: "Transaction completed successfully",
    onSuccess: () => {
      refetchEscrows();
    },
  });

  // Read all user escrows
  const {
    data: allUserEscrows,
    isLoading: isLoadingAllEscrows,
    refetch: refetchAllEscrows,
  } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "getEscrowsByUser",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // Read role-specific escrows
  const {
    data: buyerEscrows,
    isLoading: isLoadingBuyerEscrows,
    refetch: refetchBuyerEscrows,
  } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "getEscrowsAsBuyer",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && activeRole === "buyer",
    },
  });

  const {
    data: sellerEscrows,
    isLoading: isLoadingSellerEscrows,
    refetch: refetchSellerEscrows,
  } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "getEscrowsAsSeller",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && activeRole === "seller",
    },
  });

  const {
    data: arbiterEscrows,
    isLoading: isLoadingArbiterEscrows,
    refetch: refetchArbiterEscrows,
  } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "getEscrowsAsArbiter",
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address && activeRole === "arbiter",
    },
  });

  // Determine which escrow IDs to use based on active role
  const escrowIds = (() => {
    if (activeRole === "buyer") {
      console.log("Using buyer escrows:", buyerEscrows);
      return buyerEscrows;
    }
    if (activeRole === "seller") {
      console.log("Using seller escrows:", sellerEscrows);
      return sellerEscrows;
    }
    if (activeRole === "arbiter") {
      console.log("Using arbiter escrows:", arbiterEscrows);
      return arbiterEscrows;
    }
    console.log("Using all user escrows:", allUserEscrows);
    return allUserEscrows;
  })();

  const {
    data: allEscrowsData,
    isLoading: isLoadingAllDetails,
    refetch: refetchAllEscrowDetails,
  } = useReadContracts({
    contracts:
      allUserEscrows?.map((id) => ({
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "getEscrowDetails",
        args: [id],
      })) || [],
    query: {
      enabled: !!allUserEscrows && allUserEscrows.length > 0,
    },
  });

  // Format all escrow details (regardless of role)
  const allEscrowDetails: EscrowDetails[] = allEscrowsData
    ?.map((result) => {
      if (!result.result) return null;
      // Need to cast result to unknown first since the types aren't matching perfectly
      const data = result.result as unknown as EscrowAgreement;

      // Calculate remaining time
      const now = Math.floor(Date.now() / 1000);
      const expiryTimestamp = Number(data.expiresAt);
      const remainingSeconds = expiryTimestamp - now;

      let remainingTime: string | null = null;
      if (remainingSeconds > 0) {
        const days = Math.floor(remainingSeconds / 86400);
        const hours = Math.floor((remainingSeconds % 86400) / 3600);
        remainingTime = `${days}d ${hours}h`;
      }

      // Get status text
      let statusText: string;
      switch (data.status) {
        case EscrowStatus.Pending:
          statusText = "Pending";
          break;
        case EscrowStatus.Completed:
          statusText = "Completed";
          break;
        case EscrowStatus.Refunded:
          statusText = "Refunded";
          break;
        case EscrowStatus.Disputed:
          statusText = "Disputed";
          break;
        default:
          statusText = "Unknown";
      }

      return {
        ...data,
        amount: formatEther(data.amount), // Convert wei to ETH
        remainingTime,
        statusText,
      };
    })
    .filter(Boolean) as EscrowDetails[];

  // Filter escrows by role for UI display
  const escrows = useMemo(() => {
    if (!allEscrowDetails?.length) return [];

    // Filter based on active role
    return allEscrowDetails.filter((escrow) => {
      if (!address) return false;

      if (activeRole === "buyer") {
        return escrow.buyer.toLowerCase() === address.toLowerCase();
      }

      if (activeRole === "seller") {
        return escrow.seller.toLowerCase() === address.toLowerCase();
      }

      if (activeRole === "arbiter") {
        return escrow.arbiter.toLowerCase() === address.toLowerCase();
      }

      return true;
    });
  }, [allEscrowDetails, activeRole, address]);

  // Log what escrows we're seeing after filtering
  useEffect(() => {
    console.log(
      `After filtering: ${escrows.length} escrows for role ${activeRole}`,
    );
    if (escrows.length > 0) {
      console.log("First escrow details:", {
        id: escrows[0].id.toString(),
        buyer: escrows[0].buyer,
        seller: escrows[0].seller,
        arbiter: escrows[0].arbiter,
        activeAddress: address,
      });
    }
  }, [escrows, activeRole, address]);

  // Get specific escrow details for deposit
  const {
    data: specificEscrowDetails,
    isLoading: isLoadingSpecificEscrow,
    refetch: refetchSpecificEscrow,
  } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "getEscrowDetails",
    args: [selectedEscrow ? BigInt(selectedEscrow) : BigInt(0)],
    query: {
      enabled: !!selectedEscrow,
    },
  });

  // Get required funds for specific escrow
  const {
    data: requiredFunds,
    isLoading: isLoadingRequiredFunds,
    refetch: refetchRequiredFunds,
  } = useReadContract({
    address: escrowAddress,
    abi: escrowAbi,
    functionName: "getRequiredFunds",
    args: [selectedEscrow ? BigInt(selectedEscrow) : BigInt(0)],
    query: {
      enabled: !!selectedEscrow,
    },
  });

  // Helper for creating a new escrow
  const createEscrow = async (
    seller: string,
    arbiter: string | null,
    amount: string,
    expiryDays: number,
  ) => {
    if (!address) throw new Error("Wallet not connected");
    if (!seller) throw new Error("Seller address is required");
    if (parseFloat(amount) <= 0)
      throw new Error("Amount must be greater than 0");
    if (expiryDays <= 0) throw new Error("Expiry days must be greater than 0");

    try {
      const etherValue = parseEther(amount);
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "createEscrow",
        args: [
          seller as `0x${string}`,
          (arbiter ||
            "0x0000000000000000000000000000000000000000") as `0x${string}`,
          BigInt(expiryDays),
        ],
        value: etherValue,
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Escrow created successfully!",
        },
      });
    } catch (err) {
      console.error("Error creating escrow:", err);
      throw err;
    }
  };

  // Helper for creating an unfunded escrow
  const createUnfundedEscrow = async (
    seller: string,
    arbiter: string | null,
    amount: string,
    expiryDays: number,
  ) => {
    if (!address) throw new Error("Wallet not connected");
    if (!seller) throw new Error("Seller address is required");
    if (parseFloat(amount) <= 0)
      throw new Error("Amount must be greater than 0");
    if (expiryDays <= 0) throw new Error("Expiry days must be greater than 0");

    try {
      const etherValue = parseEther(amount);
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "createUnfundedEscrow",
        args: [
          seller as `0x${string}`,
          (arbiter ||
            "0x0000000000000000000000000000000000000000") as `0x${string}`,
          etherValue,
          BigInt(expiryDays),
        ],
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Unfunded escrow created successfully!",
        },
      });
    } catch (err) {
      console.error("Error creating unfunded escrow:", err);
      throw err;
    }
  };

  // Helper for depositing to an existing escrow
  const depositToEscrow = async (escrowId: string, amount: string) => {
    if (!address) throw new Error("Wallet not connected");
    if (!escrowId) throw new Error("Escrow ID is required");

    try {
      const etherValue = parseEther(amount);
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "depositToEscrow",
        args: [BigInt(escrowId)],
        value: etherValue,
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Deposit successful!",
        },
      });
    } catch (err) {
      console.error("Error depositing to escrow:", err);
      throw err;
    }
  };

  // Helper for releasing funds to seller
  const releaseEscrow = async (escrowId: string) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "releaseEscrow",
        args: [BigInt(escrowId)],
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Escrow released successfully!",
        },
      });
    } catch (err) {
      console.error("Error releasing escrow:", err);
      throw err;
    }
  };

  // Helper for refunding to buyer
  const refundEscrow = async (escrowId: string) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "refundEscrow",
        args: [BigInt(escrowId)],
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Escrow refunded successfully!",
        },
      });
    } catch (err) {
      console.error("Error refunding escrow:", err);
      throw err;
    }
  };

  // Refund an expired escrow
  const refundExpiredEscrow = async (escrowId: string) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "refundExpiredEscrow",
        args: [BigInt(escrowId)],
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Expired escrow refunded successfully!",
        },
      });
    } catch (err) {
      console.error("Error refunding expired escrow:", err);
      throw err;
    }
  };

  // Dispute an escrow (arbiter only)
  const disputeEscrow = async (escrowId: string) => {
    if (!address) throw new Error("Wallet not connected");

    try {
      const config: WriteContractConfig = {
        address: escrowAddress,
        abi: escrowAbi,
        functionName: "disputeEscrow",
        args: [BigInt(escrowId)],
      };
      return await transaction.writeAsync({
        ...config,
        _meta: {
          successMessage: "Escrow marked as disputed!",
        },
      });
    } catch (err) {
      console.error("Error disputing escrow:", err);
      throw err;
    }
  };

  // Refresh all escrow data
  const refetchEscrows = () => {
    refetchAllEscrows();
    refetchBuyerEscrows();
    refetchSellerEscrows();
    refetchArbiterEscrows();
    refetchAllEscrowDetails();
    if (selectedEscrow) {
      refetchSpecificEscrow();
      refetchRequiredFunds();
    }
  };

  return {
    // Data
    escrows,
    escrowAddress,
    address,
    specificEscrowDetails: specificEscrowDetails as EscrowAgreement | undefined,
    requiredFunds,

    // Loading states
    isLoadingEscrows:
      isLoadingAllEscrows ||
      isLoadingBuyerEscrows ||
      isLoadingSellerEscrows ||
      isLoadingArbiterEscrows ||
      isLoadingAllDetails,
    isLoadingSpecificEscrow,
    isLoadingRequiredFunds,
    isPending: transaction.isPending,
    isConfirming: transaction.isConfirming,

    // Transaction state
    isSuccess: transaction.isSuccess,
    writeError: transaction.error,

    // Actions
    createEscrow,
    createUnfundedEscrow,
    depositToEscrow,
    releaseEscrow,
    refundEscrow,
    refundExpiredEscrow,
    disputeEscrow,
    refetchEscrows,

    // State modifiers
    setSelectedEscrow,
    setActiveRole,
  };
}
