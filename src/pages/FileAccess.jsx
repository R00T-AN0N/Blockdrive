import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { FileText, Lock, Globe, Copy, Check, X, Loader2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const CONTRACT_ADDRESS = "0x01dE343f12A89898Cc97f4D9AEae1217907592De";

const CONTRACT_ABI = [
  "event FileRegistered(uint256 indexed fileId, string cid, address indexed uploader, bool isPublic, address[] allowedViewers)",
  "function getFileByCID(string cid) view returns (uint256, string, address, address[], bool, uint256)",
];

export default function AccessibleFilesPage() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [openFilter, setOpenFilter] = useState(false);
  const [openSort, setOpenSort] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [modalType, setModalType] = useState(null); // "cid" | "uploader"

  const [copied, setCopied] = useState({ cid: null, field: null });

  useEffect(() => {
    loadFiles();
  }, []);

  const shortCID = (cid) => `${cid.slice(0, 2)}...${cid.slice(-3)}`;
  const shortAddr = (addr) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const copyText = async (text, cid, field) => {
    await navigator.clipboard.writeText(text);
    setCopied({ cid, field });
    setTimeout(() => setCopied({ cid: null, field: null }), 1500);
  };

  async function loadFiles() {
    try {
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

      const accessible = [];

      for (const e of events) {
        const { cid, uploader, isPublic, allowedViewers } = e.args;

        const hasAccess =
          isPublic ||
          allowedViewers?.map((a) => a.toLowerCase()).includes(myAddress);

        if (!hasAccess || uploader.toLowerCase() === myAddress) continue;

        const file = await contract.getFileByCID(cid);

        accessible.push({
          cid: file[1],
          uploader: file[2],
          isPublic: file[4],
          timestamp: file[5],
        });
      }

      setFiles(accessible);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredFiles = files
    .filter((f) =>
      filter === "all" ? true : filter === "public" ? f.isPublic : !f.isPublic
    )
    .filter((f) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        f.cid.toLowerCase().includes(q) ||
        f.uploader.toLowerCase().includes(q)
      );
    })
    .sort((a, b) =>
      sortOrder === "newest"
        ? Number(b.timestamp) - Number(a.timestamp)
        : Number(a.timestamp) - Number(b.timestamp)
    );
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

        {/* HEADER */}
        <div className="flex flex-wrap gap-4 justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Accessible Files</h1>
            <p className="text-sm text-gray-500">{filteredFiles.length} results</p>
          </div>

          <div className="flex gap-3 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search CID or uploader…"
              className=" px-4 py-2.5 rounded bg-white shadow-sm text-sm outline-none"
            />

            {/* FILTER */}
            <div className="relative w-40">
              <button
                onClick={() => {
                  setOpenFilter(!openFilter);
                  setOpenSort(false);
                }}
                className="w-full px-4 py-2.5 bg-white shadow rounded text-sm flex justify-between"
              >
                <span className="capitalize">{filter}</span>
                <FontAwesomeIcon icon={faChevronDown} className="pt-1" />
              </button>

              {openFilter && (
                <div className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-lg">
                  {["all", "public", "private"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setFilter(opt);
                        setOpenFilter(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 capitalize"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SORT */}
            <div className="relative w-44">
              <button
                onClick={() => {
                  setOpenSort(!openSort);
                  setOpenFilter(false);
                }}
                className="w-full px-4 py-2.5 bg-white shadow-sm rounded flex justify-between items-center text-sm"
              >
                {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                <FontAwesomeIcon icon={faChevronDown} className="pt-1" />

              </button>

              {openSort && (
                <div className="absolute mt-2 bg-white shadow rounded w-full z-10">
                  {["newest", "oldest"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortOrder(opt);
                        setOpenSort(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100`}
                    >
                      {opt === "newest" ? "Newest first" : "Oldest first"}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filteredFiles.map((file, i) => (
            <div key={i} className="p-4 rounded-xl shadow-md flex justify-between">
              <div className="flex gap-4">
                <FileText className="w-6 h-6 text-gray-500" />
                <div>
                  <button
                    onClick={() => {
                      setSelectedFile(file);
                      setModalType("cid");
                    }}
                    className="font-mono p-2 text-xs rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                  >
                    CID: {shortCID(file.cid)}
                  </button>

                  <div className="text-xs p-2 text-gray-500 flex gap-2">
                    <span className="pr-2 pt-2 pb-2" >
                      {new Date(Number(file.timestamp) * 1000).toLocaleDateString()}
                    </span>

                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setModalType("uploader");
                      }}
                      className="bg-gray-100 p-1 rounded hover:bg-gray-200 hover:text-black transition-colors"
                    >
                      {shortAddr(file.uploader)}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-center">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs ${file.isPublic
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                    }`}
                >
                  {file.isPublic ? <Globe className="inline w-3 h-3 mr-1" /> : <Lock className="inline w-3 h-3 mr-1" />}
                  {file.isPublic ? "Public" : "Private"}
                </span>

                <a
                  href={`https://gateway.pinata.cloud/ipfs/${file.cid}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
                >
                  View
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {selectedFile && modalType && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center"
          onClick={() => {
            setSelectedFile(null);
            setModalType(null);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-semibold">
                {modalType === "cid" ? "File CID" : "Uploader Wallet"}
              </h2>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  setModalType(null);
                }}
              >
                <X />
              </button>
            </div>

            <p
              className="font-mono text-sm bg-gray-100 p-3 rounded mb-4
             whitespace-nowrap overflow-x-auto text-center"
            >
              {modalType === "cid"
                ? selectedFile.cid
                : selectedFile.uploader}
            </p>

            <button
              onClick={() =>
                copyText(
                  modalType === "cid"
                    ? selectedFile.cid
                    : selectedFile.uploader,
                  selectedFile.cid,
                  modalType
                )
              }
              className="w-full py-2 bg-gray-900 text-white rounded-lg flex justify-center gap-2"
            >
              {copied.cid === selectedFile.cid &&
                copied.field === modalType
                ? "Copied!"
                : modalType === "cid"
                  ? "Copy CID"
                  : "Copy Wallet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
