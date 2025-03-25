import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

const JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiMTc3ZTRmNy05MmYxLTQ5MWEtYTBkNi1jMWJkNmIwZjJhZTgiLCJlbWFpbCI6InBpeXVzaHZiYWd1bDkxNkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTBhYzg2OTUxZGU3ZGQ2ODdkNmMiLCJzY29wZWRLZXlTZWNyZXQiOiI5OWJiZjU1MjEyNzYxZDQ4NDBhY2Q3N2Y1ZGVhMDRhY2M0NDdhMjVhZmNiNTdmZDk0Zjk0YmQ5Zjc3MjEzYmVkIiwiZXhwIjoxNzc0MjY5OTI3fQ.QP-CBFJ37FLLvF2YMKsLvKOlUALKcFZPnxgbY98fmoI";

const getIPFSGatewayURL = (hash: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

const pinataApi = axios.create({
  headers: {
    Authorization: `Bearer ${JWT}`,
  },
});

export function usePinata() {
  const [isUploading, setIsUploading] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);

  const upload = async (file: File) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      formData.append(
        "pinataMetadata",
        JSON.stringify({
          name: file.name,
        }),
      );

      formData.append(
        "pinataOptions",
        JSON.stringify({
          cidVersion: 1,
        }),
      );

      const response = await pinataApi.post(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
      );

      const { IpfsHash } = response.data;
      const gatewayUrl = getIPFSGatewayURL(IpfsHash);

      setIpfsUrl(gatewayUrl);
      toast.success(`Successfully uploaded to IPFS`);

      return gatewayUrl;
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      toast.error("Failed to upload to IPFS");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    upload,
    isUploading,
    ipfsUrl,
  };
}
