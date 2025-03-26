import { useState, useEffect, useRef } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { showTransactionToast } from "~/components/ui/transaction-toaster";
import { toast } from "sonner";

interface UseTransactionOptions {
  /** Success message when transaction completes */
  successMessage?: string;
  /** Optional callback to run after successful transaction */
  onSuccess?: (data: any) => void;
  /** Display regular toast errors instead of transaction toasts for validation errors */
  useRegularToastForErrors?: boolean;
}

/**
 * Hook to manage blockchain transactions with integrated toast notifications
 *
 * Usage:
 * ```
 * const { writeAsync, isLoading, isSuccess } = useTransaction({
 *   successMessage: "Token transfer complete",
 *   onSuccess: () => refetchBalance()
 * });
 *
 * // Then in your handler:
 * const handleTransfer = async () => {
 *   if (!isValidInput()) {
 *     toast.error("Invalid input");
 *     return;
 *   }
 *
 *   try {
 *     await writeAsync({
 *       address: tokenAddress,
 *       abi: erc20Abi,
 *       functionName: 'transfer',
 *       args: [recipient, amount]
 *     });
 *   } catch (error) {
 *     // Error handling is done by the hook
 *   }
 * };
 * ```
 */
export function useTransaction(options: UseTransactionOptions = {}) {
  const {
    successMessage = "Transaction completed successfully",
    onSuccess,
    useRegularToastForErrors = true,
  } = options;

  const [toastShown, setToastShown] = useState(false);
  // Track the current transaction hash to prevent duplicate toasts
  const currentTransactionRef = useRef<`0x${string}` | undefined>(undefined);
  // Track if success callback has been called for this transaction
  const successHandledRef = useRef(false);

  // Write contract hook with error handling
  const {
    writeContractAsync,
    data: hash,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
    writeContract,
  } = useWriteContract();

  // Transaction receipt hook to track confirmation
  const {
    isLoading: isConfirming,
    isSuccess,
    isError: isTransactionError,
    error: transactionError,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset references when hash changes
  useEffect(() => {
    if (hash && hash !== currentTransactionRef.current) {
      currentTransactionRef.current = hash;
      successHandledRef.current = false;
    }
  }, [hash]);

  // Track when the loading toast should be shown
  useEffect(() => {
    if (isPending && !toastShown) {
      showTransactionToast.loading(
        "Processing transaction",
        "Please confirm in your wallet",
      );
      setToastShown(true);
    }
  }, [isPending, toastShown]);

  // Handle all transaction states in one effect
  useEffect(() => {
    // Handle write contract errors
    if (isWriteError && writeError) {
      console.log("Transaction write error:", writeError);

      showTransactionToast.error(
        "Transaction failed",
        writeError?.message || "Failed to submit transaction",
      );
      setToastShown(false);
      currentTransactionRef.current = undefined;
      successHandledRef.current = false;
      resetWrite();
    }

    // Handle transaction errors
    if (isTransactionError && transactionError) {
      console.log("Transaction error:", transactionError);
      showTransactionToast.error(
        "Transaction failed",
        transactionError?.message || "Transaction failed on blockchain",
      );
      setToastShown(false);
      currentTransactionRef.current = undefined;
      successHandledRef.current = false;
    }

    // Handle successful transactions
    if (isSuccess && hash && !successHandledRef.current) {
      console.log("Transaction success, hash:", hash);
      successHandledRef.current = true;

      // Show success toast with slight delay to ensure loading toast is dismissed
      setTimeout(() => {
        showTransactionToast.success("Transaction successful", successMessage);
      }, 300);

      // Reset toast state
      setToastShown(false);

      // Call success callback if provided
      if (onSuccess && receipt) {
        onSuccess(receipt);
      }
    }
  }, [
    isWriteError,
    writeError,
    isTransactionError,
    transactionError,
    isSuccess,
    hash,
    receipt,
    successMessage,
    onSuccess,
    useRegularToastForErrors,
    resetWrite,
  ]);

  // Create an async write function that returns a promise
  const writeAsync = async (config: any) => {
    try {
      // Reset references for new transaction
      successHandledRef.current = false;
      return await writeContractAsync(config);
    } catch (error) {
      // Error is already handled in the effect
      throw error;
    }
  };

  // Shorthand function to write and show loading toast
  const write = (config: any) => {
    // Reset references for new transaction
    successHandledRef.current = false;

    showTransactionToast.loading(
      "Processing transaction",
      "Please confirm in your wallet",
    );
    setToastShown(true);
    writeContract(config);
  };

  return {
    // Async write contract function (returns promise)
    writeAsync,
    // Regular write function
    write,
    // Current state
    isLoading: isPending || isConfirming,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isTransactionError,
    // Data
    hash,
    receipt,
    // Error info
    error: writeError || transactionError,
    // Reset
    reset: () => {
      resetWrite();
      currentTransactionRef.current = undefined;
      successHandledRef.current = false;
      setToastShown(false);
    },
  };
}
