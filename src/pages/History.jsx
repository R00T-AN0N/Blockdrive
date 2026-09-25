import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import { ethers } from "ethers";
import {
  FileText,
  Lock,
  Globe,
  ExternalLink,
  Copy,
  Check,
  X,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

/* ================= BLOCKCHAIN CONFIG ================= */

const CONTRACT_ADDRESS = "0x01dE343f12A89898Cc97f4D9AEae1217907592De";

const CONTRACT_ABI = [
  "event FileRegistered(uint256 indexed fileId, string cid, address indexed uploader, bool isPublic, address[] allowedViewers)",
  "function getFileByCID(string cid) view returns (uint256, string, address, address[], bool, uint256)",
];

/* ================= MAIN COMPONENT ================= */

export function History() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterLoading, setFilterLoading] = useState(false);

  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    loadFiles();
  }, []);

  const shortCID = (cid) => `${cid.slice(0, 8)}...${cid.slice(-6)}`;
  const shortAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  async function loadFiles() {
    try {
      setLoading(true);

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const email = storedUser?.email;
      if (!email) return;

      const apiRes = await axios.post(
        `${API_BASE_URL}/api/fetch`,
        { email }
      );

      const backendFiles = apiRes.data;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const myAddress = (await signer.getAddress()).toLowerCase();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const events = await contract.queryFilter(
        contract.filters.FileRegistered()
      );

      const merged = [];

      for (const file of backendFiles) {
        const event = events.find(
          (e) =>
            e.args.cid === file.cid &&
            e.args.uploader.toLowerCase() === myAddress
        );

        if (!event) continue;

        merged.push({
          id: file.id,
          fileName: file.file_name,
          uploadDate: new Date(file.upload_date).getTime(),
          cid: file.cid,
          allowedViewers: event.args.allowedViewers || [],
          isPublic: event.args.isPublic,
        });
      }

      setFiles(merged);
    } catch (err) {
      console.error("Load files error:", err);
    } finally {
      setLoading(false);
    }
  }

  /* ================= FILTERED DATA ================= */

  const filteredFiles = useMemo(() => {
    let result = [...files];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.cid.toLowerCase().includes(q) ||
          f.allowedViewers.some((w) => w.toLowerCase().includes(q))
      );
    }

    if (filter === "public") result = result.filter((f) => f.isPublic);
    if (filter === "private") result = result.filter((f) => !f.isPublic);

    result.sort((a, b) =>
      sortOrder === "newest"
        ? b.uploadDate - a.uploadDate
        : a.uploadDate - b.uploadDate
    );

    return result;
  }, [files, search, filter, sortOrder]);

  const applyFilter = (cb) => {
    setFilterLoading(true);
    setTimeout(() => {
      cb();
      setFilterLoading(false);
    }, 300);
  };

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(""), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-gray-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl shadow-sm">

        <h1 className="text-3xl font-semibold text-gray-900 mb-1">
          History
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Manage and view your uploaded files
        </p>

        {/* TOP BAR */}
        <div className="flex justify-end flex-col lg:flex-row gap-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search CID or uploader..."
            className=" px-4 py-2.5 rounded bg-white shadow-sm text-sm outline-none"
          />

          {/* FILTER */}
          <div className="relative w-40">
            <button
              onClick={() => setOpenFilter((v) => !v)}
              className="w-full px-4 py-2.5 bg-white shadow rounded text-sm flex justify-between"
            >
              {filter === "all"
                ? "All"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
              <FontAwesomeIcon icon={faChevronDown} className="pt-1" />
            </button>

            {openFilter && (
              <div className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-lg">
                {["all", "public", "private"].map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      applyFilter(() => {
                        setFilter(f);
                        setOpenFilter(false);
                      })
                    }
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {f === "all"
                      ? "All"
                      : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SORT */}
          <div className="relative w-44">
            <button
              onClick={() => setOpenSort((v) => !v)}
              className="w-full px-4 py-2.5 bg-white shadow-sm rounded flex justify-between items-center text-sm"
            >
              {sortOrder === "newest" ? "Newest first" : "Oldest first"}
              <FontAwesomeIcon icon={faChevronDown} className="pt-1" />
            </button>

            {openSort && (
              <div className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-lg">
                {["newest", "oldest"].map((s) => (
                  <button
                    key={s}
                    onClick={() =>
                      applyFilter(() => {
                        setSortOrder(s);
                        setOpenSort(false);
                      })
                    }
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    {s === "newest" ? "Newest first" : "Oldest first"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* FILE LIST */}
        {filterLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="p-5 rounded-xl shadow-sm">
                <div className="flex justify-between gap-6">
                  {/* LEFT */}
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {file.fileName}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </p>

                      <div className="flex gap-4 text-xs text-gray-600">
                        {/* CID BUTTON */}
                        <button
                          onClick={() => {
                            setSelectedFile(file);
                            setModalType("cid");
                          }}
                          className="bg-gray-100 p-2 rounded hover:bg-gray-200 hover:text-black transition-colors"
                        >
                          {shortCID(file.cid)}
                        </button>

                        {/* WALLET / EVERYONE */}
                        {file.isPublic ? (
                          <span className="text-xs text-gray-500 select-none p-2">
                            Everyone
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setModalType("wallets");
                            }}
                            className="bg-gray-100 p-2 rounded hover:bg-gray-200 hover:text-black transition-colors"
                          >
                            {file.allowedViewers.length}{" "}
                            {file.allowedViewers.length === 1 ? "wallet" : "wallets"}
                          </button>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${file.isPublic
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                        }`}
                    >
                      {file.isPublic ? "Public" : "Private"}
                    </span>

                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${file.cid}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm"
                    >
                      View
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalType && selectedFile && (
        <div
          onClick={() => setModalType(null)}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">
                {modalType === "cid" ? "File CID" : "Accessible Wallets"}
              </h2>
              <button onClick={() => setModalType(null)}>
                <X />
              </button>
            </div>

            {/* BODY */}
            {modalType === "cid" ? (
              <>
                {/* ✅ CID — ONE LINE ONLY */}
                <div className="bg-gray-50 rounded mb-4 px-3 py-3 overflow-x-auto">
                  <span className="font-mono text-center text-sm whitespace-nowrap inline-block min-w-full">
                    {selectedFile.cid}
                  </span>
                </div>

                {/* COPY BUTTON */}
                <button
                  onClick={() => copyText(selectedFile.cid)}
                  className="w-full py-2 bg-gray-900 text-white rounded-lg flex justify-center gap-2 text-center"
                >
                  {copied === selectedFile.cid ? <Check /> : <Copy />}
                  {copied === selectedFile.cid ? "Copied" : "Copy CID"}
                </button>
              </>
            ) : (
              /* WALLET LIST — PRIVATE FILES ONLY */
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedFile.allowedViewers.map((w) => (
                  <div
                    key={w}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded"
                  >
                    <span className="font-mono text-sm">
                      {shortAddr(w)}
                    </span>
                    <button
                      onClick={() => copyText(w)}
                      className="flex items-center gap-1 text-sm"
                    >
                      {copied === w ? <Check /> : <Copy />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default History;
