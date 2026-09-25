import * as React from "react";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import { FileUploadCard } from "@/components/ui/file-upload-card";
import { SidebarProvider, SidebarInset } from "@/components/blocks/sidebar";
import { AppSidebar } from "@/components/blocks/whatsapp-sidebar";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contract";
import { AnimatePresence } from "framer-motion";
import {
  faAdd,
  faCaretDown,
  faGlobe,
  faLock,
  faUser,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { uploadToPinata } from "../utils/pinataUploads";

/* ================= BLOCKCHAIN ================= */

async function getContract() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

async function uploadFilesToChain(cids, isPublic, receivers) {
  const contract = await getContract();
  const cleanedReceivers = isPublic
    ? []
    : receivers.filter((a) => a.trim() !== "");

  // MULTIPLE FILES 
  if (Array.isArray(cids)) {
    const isPublicList = cids.map(() => isPublic);
    const allowedViewersList = cids.map(() => cleanedReceivers);

    const tx = await contract.registerFilesBatch(
      cids,
      isPublicList,
      allowedViewersList
    );
    await tx.wait();
  }
  // SINGLE FILE
  else {
    const tx = await contract.registerFile(
      cids,
      isPublic,
      cleanedReceivers
    );
    await tx.wait();
  }
}

/* ================= MYSQL ================= */

async function insertToMySQL(fileName, cid) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;
  const userEmail = user ? user.email : null;
  const userId = user ? user.U_id : null;

  return axios.post(`${API_BASE_URL}/api/files`, {
    name: fileName,
    cid,
    date: new Date().toISOString(),
    email: userEmail,
    U_id: userId,
  });
}

/* ================= PAGE ================= */

export default function FileUploadPage() {
  const navigate = useNavigate();
  const [files, setFiles] = React.useState([]);
  const [isPublic, setIsPublic] = React.useState(true);
  const [receivers, setReceivers] = React.useState([""]);
  const [openDropdown, setOpenDropdown] = React.useState(false);

  const [toast, setToast] = React.useState({
    show: false,
    type: "success",
    message: "",
  });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type, message: "" }), 3000);
  };

  /* ================= SUBSCRIPTION CHECK ================= */
  const [subscription, setSubscription] = React.useState(null);
  const [uploadLimitRef, setUploadLimitRef] = React.useState({ limit: 5, used: 0 });

  React.useEffect(() => {
    const fetchSubscription = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) return;
      const user = JSON.parse(userData);

      try {
        const res = await axios.get(`${API_BASE_URL}/api/subscription/${user.U_id}`);
        setSubscription(res.data);
        setUploadLimitRef({
          limit: res.data.upload_limit,
          used: res.data.uploads_used
        });
      } catch (err) {
        console.error("Failed to fetch subscription:", err);
      }
    };

    fetchSubscription();
  }, []);

  const isLimitReached = uploadLimitRef.used >= uploadLimitRef.limit;
  const isFreePlan = subscription?.plan === "free" || !subscription?.plan;

  /* ================= FILE SELECTION ================= */

  const handleFilesChange = (newFiles) => {
    const availableSlots = Math.max(0, uploadLimitRef.limit - uploadLimitRef.used);

    if (availableSlots === 0) {
      showToast("error", "Upload limit reached. Please upgrade your plan.");
      return;
    }

    if (newFiles.length > availableSlots) {
      showToast(
        "error",
        `Your plan has ${availableSlots} upload slot${availableSlots === 1 ? "" : "s"} remaining.`
      );
      newFiles = newFiles.slice(0, availableSlots);
    }

    const mapped = newFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "pending",
      cid: "",
    }));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async (filesToUpload) => {
    try {
      const uploaded = [];

      for (const f of filesToUpload) {
        setFiles((prev) =>
          prev.map((x) =>
            x.id === f.id ? { ...x, status: "uploading" } : x
          )
        );

        const cid = await uploadToPinata(f.file, (p) => {
          setFiles((prev) =>
            prev.map((x) =>
              x.id === f.id ? { ...x, progress: p } : x
            )
          );
        });

        uploaded.push({ ...f, cid });

        setFiles((prev) =>
          prev.map((x) =>
            x.id === f.id
              ? { ...x, cid, progress: 100, status: "uploaded" }
              : x
          )
        );
      }

      // Blockchain: single OR batch
      const cids =
        uploaded.length === 1
          ? uploaded[0].cid
          : uploaded.map((f) => f.cid);

      await uploadFilesToChain(cids, isPublic, receivers);

      // MySQL
      for (const f of uploaded) {
        await insertToMySQL(f.file.name, f.cid);
      }

      showToast("success", "Files uploaded successfully");

      // Optimistic update
      setUploadLimitRef(prev => ({ ...prev, used: prev.used + uploaded.length }));

      setTimeout(() => {
        navigate("/history");
      }, 1500);

    } catch (err) {
      console.error("Upload error object:", err);

      const isAlreadyRegistered =
        err.message?.includes("already registered") ||
        err.reason?.includes("already registered") ||
        err.info?.error?.message?.includes("already registered");

      const errorMessage =
        err.response?.data?.error || // Backend error
        (isAlreadyRegistered ? "File Already Stored" : null) || // Contract error
        "Upload failed";

      showToast("error", errorMessage);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-screen flex justify-center items-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-center">
              Upload File
            </h2>

            {/* ================= LIMIT WARNING ================= */}
            {isLimitReached && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
                <FontAwesomeIcon icon={faLock} />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Upload Limit Hit</p>
                  <p className="text-xs">
                    You have used {uploadLimitRef.used}/{uploadLimitRef.limit} uploads.
                    Upgrade your plan to upload more.
                  </p>
                </div>
              </div>
            )}

            {/* ================= VISIBILITY ================= */}
            <div className="space-y-2 relative">
              <label className="text-sm font-semibold text-gray-700">
                File Visibility
              </label>
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 border border-gray-300 rounded-xl px-4 py-3 shadow-sm font-medium"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={isPublic ? faGlobe : faLock} />
                  {isPublic
                    ? "Public — Anyone can view"
                    : "Private — Only allowed wallets"}
                </span>
                <FontAwesomeIcon icon={faCaretDown} />
              </button>

              {/* Status Indicator */}
              <div
                className={`flex items-center gap-2 text-sm font-medium mt-2 px-3 py-2 rounded-lg transition-all ${isPublic
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
                  }`}
              >
                {isPublic
                  ? "Public access enabled"
                  : "Private file — add receiver below"}
              </div>


              <AnimatePresence>
                {openDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute z-20 w-full bg-white shadow-xl rounded-xl mt-1 p-1"
                  >
                    <button
                      onClick={() => {
                        setIsPublic(true);
                        setOpenDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg"
                    >
                      <FontAwesomeIcon icon={faGlobe} /> Public
                    </button>

                    <div className="relative">
                      <button
                        disabled={isFreePlan}
                        onClick={() => {
                          if (!isFreePlan) {
                            setIsPublic(false);
                            setOpenDropdown(false);
                          }
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg ${isFreePlan
                          ? "opacity-50 cursor-not-allowed bg-gray-50 text-gray-400"
                          : "hover:bg-gray-100"
                          }`}
                      >
                        <FontAwesomeIcon icon={faLock} /> Private
                        {isFreePlan && (
                          <span className="ml-auto text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">
                            Pro
                          </span>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ================= RECEIVERS ================= */}
            {!isPublic && (
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Allowed Wallets
                </label>

                {receivers.map((r, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="relative w-full">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="absolute left-3 top-4 text-gray-400"
                      />
                      <input
                        value={r}
                        onChange={(e) =>
                          setReceivers(
                            receivers.map((addr, idx) =>
                              idx === i ? e.target.value : addr
                            )
                          )
                        }
                        placeholder="0xWalletAddress"
                        className="w-full border rounded-xl px-4 py-3 pl-10"
                      />
                    </div>

                    {i > 0 && (
                      <button
                        onClick={() =>
                          setReceivers(receivers.filter((_, idx) => idx !== i))
                        }
                        className="text-red-500"
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={() => setReceivers([...receivers, ""])}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-white bg-gray-900"
                >
                  <FontAwesomeIcon icon={faAdd} /> Add another
                </button>
              </div>
            )}

            {/* ================= FILE CARD ================= */}
            <div className={isLimitReached ? "opacity-50 pointer-events-none grayscale" : ""}>
              <FileUploadCard
                files={files}
                onFilesChange={handleFilesChange}
                onFileRemove={removeFile}
                onSubmit={handleSubmit}
              />
            </div>
          </div>

          <Toast show={toast.show} type={toast.type} message={toast.message} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
