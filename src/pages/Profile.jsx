import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { BrowserProvider } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faCalendarDays,
    faCloudArrowUp,
    faGem,
    faXmark,
    faHistory,
    faCheck,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

export default function ProfilePage() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [wallet, setWallet] = useState("");
    const [network, setNetwork] = useState("");
    const [balance, setBalance] = useState("");
    const [subscription, setSubscription] = useState(null);
    const [showOverlay, setShowOverlay] = useState(false);
    const [showPlansOverlay, setShowPlansOverlay] = useState(false);
    const [subscriptionHistory, setSubscriptionHistory] = useState([]);

    /* ---------- Load User ---------- */
    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        setUser(savedUser || {});
    }, []);

    /* ---------- Wallet ---------- */
    const fetchWalletData = async () => {
        if (!window.ethereum) return;
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const bal = await provider.getBalance(address);
        const net = await provider.getNetwork();

        setWallet(address);
        setBalance((Number(bal) / 1e18).toFixed(4));
        setNetwork(net.name || "Unknown");
    };

    /* ---------- Subscription ---------- */
    useEffect(() => {
        fetchWalletData();
        if (user?.U_id) {
            fetch(`${API_BASE_URL}/api/subscription/${user.U_id}`)
                .then((r) => r.json())
                .then(setSubscription)
                .catch(console.error);
        }
    }, [user]);

    /* ---------- Fetch History ---------- */
    const fetchHistory = () => {
        if (!user?.U_id) return;
        fetch(`${API_BASE_URL}/api/subscription/history/${user.U_id}`)
            .then(r => r.json())
            .then(data => {
                if (Array.isArray(data)) setSubscriptionHistory(data);
            })
            .catch(console.error);
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen text-gray-500">
                Loading profile…
            </div>
        );
    }

    const remainingUploads =
        subscription?.upload_limit - subscription?.uploads_used;

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ================= LEFT COLUMN ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow p-6 text-center">
                        <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-md">
                            {user.name?.charAt(0)?.toUpperCase()}
                        </div>

                        <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
                        <p className="text-gray-500 text-sm">User</p>

                        <div className="flex justify-around mt-6 text-sm">
                            <div>
                                <p className="font-semibold">Wallet</p>
                                <p className="text-gray-500">Connected</p>
                            </div>
                            <div>
                                <p className="font-semibold">Plan</p>
                                <p className="text-gray-500 uppercase">
                                    {subscription?.plan || "Free"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Verified Info */}
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Confirmed Information
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-700">
                            <li>✔ Identity verified</li>
                            <li>✔ Email address</li>
                            <li>✔ Wallet connected</li>
                        </ul>
                    </div>
                </motion.div>

                {/* ================= RIGHT COLUMN ================= */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="md:col-span-2 space-y-8"
                >
                    {/* About Section */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold">
                                About {user.name}
                            </h2>

                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            Email: <span className="font-medium">{user.email}</span>
                        </p>

                        <p className="text-gray-600 text-sm">
                            Wallet:{" "}
                            <span className="font-medium break-all">
                                {wallet
                                    ? `${wallet.slice(0, 10)}...${wallet.slice(-6)}`
                                    : "Not connected"}
                            </span>
                        </p>
                    </div>

                    {/* ================= SUBSCRIPTION CARD ================= */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <h3 className="text-xl font-semibold mb-6">
                            Subscription Plan
                        </h3>

                        {subscription ? (
                            <>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    <div
                                        onClick={() => setShowPlansOverlay(true)}
                                        className="cursor-pointer hover:opacity-80 transition"
                                    >
                                        <p className="text-gray-500 text-sm">Current Plan</p>
                                        <p className="text-2xl font-bold uppercase text-indigo-600">
                                            {subscription.plan} <span className="text-xs text-gray-400 font-normal align-middle ml-1">(Click to change)</span>
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">Uploads Usage</p>
                                        <p className="text-lg font-semibold">
                                            {subscription.uploads_used} /{" "}
                                            {subscription.upload_limit}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Remaining Uploads
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {remainingUploads}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-sm">
                                            Plan Valid Till
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {subscription.end_date
                                                ? new Date(
                                                    subscription.end_date
                                                ).toLocaleDateString()
                                                : "Unlimited"}
                                        </p>
                                    </div>
                                </div>

                                {/* -------- Upgrade Plan Row -------- */}
                                <div
                                    onClick={() => setShowPlansOverlay(true)}
                                    className="mt-6 p-3 bg-indigo-50 flex items-center justify-between cursor-pointer hover:bg-indigo-100 px-2 py-3 rounded-lg transition border border-indigo-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <FontAwesomeIcon icon={faGem} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Upgrade Plan
                                        </span>
                                    </div>
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="text-gray-400"
                                    />
                                </div>

                                {/* -------- Subscription History Row -------- */}
                                <div
                                    onClick={() => {
                                        setShowOverlay(true);
                                        fetchHistory();
                                    }}
                                    className="mt-6 p-3 bg-indigo-50 flex items-center justify-between cursor-pointer hover:bg-indigo-100 px-2 py-3 rounded-lg transition border border-indigo-100"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <FontAwesomeIcon icon={faHistory} />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700">
                                            Subscription History
                                        </span>
                                    </div>
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className="text-gray-400"
                                    />
                                </div>
                            </>
                        ) : (
                            <p className="text-gray-400">Loading subscription…</p>
                        )}
                    </div>

                    {/* Wallet Info */}
                    <div className="bg-white rounded-2xl shadow p-8">
                        <h3 className="text-xl font-semibold mb-4">
                            Wallet Information
                        </h3>
                        <p>
                            <b>Network:</b> {network}
                        </p>
                        <p>
                            <b>Balance:</b>{" "}
                            {balance ? `${balance} ETH` : "Fetching…"}
                        </p>

                        <button
                            onClick={fetchWalletData}
                            className="mt-6 px-6 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Refresh Wallet
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* ================= HISTORY OVERLAY ================= */}
            <AnimatePresence>
                {showOverlay && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-50 flex justify-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowOverlay(false)}
                    >
                        <motion.div
                            className="bg-white w-full max-w-md h-full p-6 overflow-y-auto"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold mb-6">
                                Subscription History
                            </h2>

                            {/* Current Plan */}
                            <div className="border rounded-xl p-4 mb-6">
                                <p className="text-sm text-gray-500 mb-1">
                                    Current Plan
                                </p>
                                <p className="text-lg font-semibold uppercase">
                                    {subscription.plan}
                                </p>

                                <p className="text-sm mt-2 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCloudArrowUp} />
                                    {subscription.uploads_used} /{" "}
                                    {subscription.upload_limit} uploads
                                </p>

                                <p className="text-sm mt-1 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarDays} />
                                    {new Date(
                                        subscription.start_date
                                    ).toLocaleDateString()}{" "}
                                    →{" "}
                                    {new Date(
                                        subscription.end_date
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Previous Plans */}
                            {subscriptionHistory.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-gray-700">History</h3>
                                    {subscriptionHistory.map((sub) => (
                                        <div key={sub.id} className="border-b pb-4 last:border-0">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-gray-800 uppercase">{sub.plan}</p>
                                                    <p className="text-xs text-gray-400">
                                                        {new Date(sub.start_date).toLocaleDateString()} - {new Date(sub.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {sub.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span className="flex items-center gap-1">
                                                    <FontAwesomeIcon icon={faCloudArrowUp} className="text-blue-400" />
                                                    {sub.uploads_used} / {sub.upload_limit}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">
                                    No previous subscription records found.
                                </p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ================= PLANS OVERLAY ================= */}
            <AnimatePresence>
                {showPlansOverlay && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowPlansOverlay(false)}
                    >
                        <motion.div
                            className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl p-8 relative"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowPlansOverlay(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
                            >
                                <FontAwesomeIcon icon={faXmark} size="lg" />
                            </button>

                            <h2 className="text-2xl font-bold mb-6 text-center">
                                Subscription Plans
                            </h2>

                            <div className="grid md:grid-cols-3 gap-6">
                                {/* FREE PLAN */}
                                <div className={`relative rounded-2xl p-6 transition-all duration-300 ${subscription?.plan === 'free'
                                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 shadow-xl scale-105'
                                    : 'bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1'
                                    }`}>
                                    {subscription?.plan === 'free' && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wide uppercase">
                                            Active Plan
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Free</h3>
                                    <p className="text-4xl font-extrabold text-center text-gray-900 mb-6">₹0</p>

                                    <ul className="space-y-3 text-sm text-gray-600 mb-8">
                                        <li className="flex items-center gap-2"><span className="text-green-500"><FontAwesomeIcon icon={faCheck} /></span> 5 uploads per month</li>
                                        <li className="flex items-center gap-2"><span className="text-green-500"><FontAwesomeIcon icon={faCheck} /></span> Public files only</li>
                                        <li className="flex items-center gap-2"><span className="text-green-500"><FontAwesomeIcon icon={faCheck} /></span> Basic access</li>
                                    </ul>

                                    <div className="mt-auto">
                                        {subscription?.plan === 'free' ? (
                                            <button disabled className="w-full py-2.5 rounded-xl bg-green-500 text-white font-semibold shadow-green-200 shadow-lg cursor-default">
                                                Current Plan
                                            </button>
                                        ) : (
                                            <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
                                                Joined
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* BASIC PLAN */}
                                <div className={`relative rounded-2xl p-6 transition-all duration-300 ${subscription?.plan === 'basic'
                                    ? 'bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-500 shadow-xl scale-105'
                                    : 'bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1'
                                    }`}>
                                    {subscription?.plan === 'basic' && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wide uppercase">
                                            Active Plan
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Basic</h3>
                                    <p className="text-4xl font-extrabold text-center text-gray-900 mb-1">₹199</p>
                                    <p className="text-center text-gray-400 text-sm mb-6">/ month</p>

                                    <ul className="space-y-3 text-sm text-gray-600 mb-8">
                                        <li className="flex items-center gap-2"><span className="text-indigo-500"><FontAwesomeIcon icon={faCheck} /></span> 50 uploads per month</li>
                                        <li className="flex items-center gap-2"><span className="text-indigo-500"><FontAwesomeIcon icon={faCheck} /></span> Public + Private files</li>
                                        <li className="flex items-center gap-2"><span className="text-indigo-500"><FontAwesomeIcon icon={faCheck} /></span> Standard support</li>
                                    </ul>

                                    <div className="mt-auto">
                                        {subscription?.plan === 'basic' ? (
                                            <button disabled className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-indigo-200 shadow-lg cursor-default">
                                                Current Plan
                                            </button>
                                        ) : subscription?.plan === 'premium' ? (
                                            <button disabled className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold cursor-not-allowed">
                                                Unavailable
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate("/dummy-payment/basic")}
                                                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all"
                                            >
                                                Upgrade Now
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* PREMIUM PLAN */}
                                <div className={`relative rounded-2xl p-6 transition-all duration-300 ${subscription?.plan === 'premium'
                                    ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-500 shadow-xl scale-105'
                                    : 'bg-white border border-gray-100 hover:shadow-xl hover:-translate-y-1'
                                    }`}>
                                    {subscription?.plan === 'premium' && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md tracking-wide uppercase">
                                            Active Plan
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Premium</h3>
                                    <p className="text-4xl font-extrabold text-center text-gray-900 mb-1">₹499</p>
                                    <p className="text-center text-gray-400 text-sm mb-6">/ month</p>

                                    <ul className="space-y-3 text-sm text-gray-600 mb-8">
                                        <li className="flex items-center gap-2"><span className="text-purple-500"><FontAwesomeIcon icon={faCheck} /></span> Unlimited uploads</li>
                                        <li className="flex items-center gap-2"><span className="text-purple-500"><FontAwesomeIcon icon={faCheck} /></span> Private files</li>
                                        <li className="flex items-center gap-2"><span className="text-purple-500"><FontAwesomeIcon icon={faCheck} /></span> Priority access</li>
                                    </ul>

                                    <div className="mt-auto">
                                        {subscription?.plan === 'premium' ? (
                                            <button disabled className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-semibold shadow-purple-200 shadow-lg cursor-default">
                                                Current Plan
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => navigate("/dummy-payment/premium")}
                                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:shadow-lg hover:scale-[1.02] transition-all"
                                            >
                                                Upgrade Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
