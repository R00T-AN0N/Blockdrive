import axios from "axios";
import { API_BASE_URL } from "../config/api";

/** Upload a file through the BlockDrive backend. The Pinata JWT stays server-side. */
export const uploadToPinata = async (file, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(`${API_BASE_URL}/api/ipfs/upload`, formData, {
    onUploadProgress: (event) => {
      if (!event.total) return;
      onProgress?.(Math.round((event.loaded * 100) / event.total));
    },
  });

  if (!response.data?.cid) {
    throw new Error("IPFS upload did not return a CID");
  }

  return response.data.cid;
};
