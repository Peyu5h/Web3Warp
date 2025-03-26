"use client";

import { useState } from "react";
import axios from "axios";

// Pinata API endpoints
const PINATA_PIN_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_PIN_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

interface UsePinataOptions {
  JWT?: string;
}

interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  [key: string]: any;
}

/**
 * Hook for uploading files and JSON to IPFS via Pinata
 *
 * Usage:
 * ```
 * const { uploadImage, uploadMetadata, isUploading, error } = usePinata({
 *   JWT: process.env.NEXT_PUBLIC_PINATA_JWT
 * });
 *
 * // Upload an image to IPFS
 * const imageUrl = await uploadImage(imageFile);
 *
 * // Upload metadata to IPFS
 * const metadata = {
 *   name: "My NFT",
 *   description: "Description of my NFT",
 *   image: imageUrl,
 *   attributes: [{ trait_type: "Rarity", value: "Legendary" }]
 * };
 * const metadataUrl = await uploadMetadata(metadata);
 * ```
 */
export function usePinata(options: UsePinataOptions = {}) {
  const { JWT } = options;
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authorization headers for Pinata API requests
  const headers = {
    Authorization: JWT ? `Bearer ${JWT}` : "",
  };

  /**
   * Upload an image file to IPFS
   * @param file File to upload
   * @returns IPFS URL of the uploaded file
   */
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setIsUploading(true);
      setError(null);

      // Create form data for the file upload
      const formData = new FormData();
      formData.append("file", file);

      // Add metadata about the file
      const metadata = JSON.stringify({
        name: file.name,
        keyvalues: {
          createdAt: new Date().toISOString(),
          type: file.type,
        },
      });
      formData.append("pinataMetadata", metadata);

      // Set pin options
      const pinataOptions = JSON.stringify({
        cidVersion: 1,
      });
      formData.append("pinataOptions", pinataOptions);

      // Upload the file to Pinata
      const response = await axios.post(PINATA_PIN_FILE_URL, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      // Construct and return the IPFS URL
      return `ipfs://${response.data.IpfsHash}`;
    } catch (err) {
      console.error("Error uploading to IPFS:", err);
      setError("Failed to upload image to IPFS");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload metadata JSON to IPFS
   * @param metadata NFT metadata object
   * @returns IPFS URL of the uploaded metadata
   */
  const uploadMetadata = async (metadata: NFTMetadata): Promise<string> => {
    try {
      setIsUploading(true);
      setError(null);

      // Upload the metadata to Pinata
      const response = await axios.post(
        PINATA_PIN_JSON_URL,
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: `${metadata.name}-metadata.json`,
          },
          pinataOptions: {
            cidVersion: 1,
          },
        },
        {
          headers: {
            ...headers,
            "Content-Type": "application/json",
          },
        },
      );

      // Construct and return the IPFS URL
      return `ipfs://${response.data.IpfsHash}`;
    } catch (err) {
      console.error("Error uploading metadata to IPFS:", err);
      setError("Failed to upload metadata to IPFS");
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    uploadMetadata,
    isUploading,
    error,
  };
}
