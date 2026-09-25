import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faUser,
  faEnvelope,
  faLock,
  faUnlock,
  faTimes,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { BrowserProvider } from "ethers";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignInModal({ open, onClose, onSuccess }) {
  const [status, setStatus] = useState(false); // false = Sign In, true = Sign Up
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log("Connected wallet:", address);
      setWalletAddress(address);

      // ✅ Also store in localStorage for persistence
      localStorage.setItem("walletAddress", address);
      window.dispatchEvent(new Event("walletChanged"));

      setToast({
        show: true,
        type: "success",
        message: `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error("MetaMask connection error:", error);
      setToast({
        show: true,
        type: "error",
        message: "MetaMask connection failed. Try again.",
      });
    }
  };





  // ✅ Handle SignIn/SignUp
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!walletAddress) {
      setError("Please connect your MetaMask wallet first.");
      setLoading(false);
      return;
    }

    if (status && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const endpoint = status
        ? `${API_BASE_URL}/register`
        : `${API_BASE_URL}/login`;

      const payload = status
        ? {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          wallet: walletAddress,
        }
        : {
          email: formData.email,
          password: formData.password,
          wallet: walletAddress,
        };

      const response = await axios.post(endpoint, payload);
      console.log("Login response:", response.data);

      if (response.data.success || response.data.status === "success") {
        setToast({
          show: true,
          type: "success",
          message: status
            ? "Account created successfully! Please sign in."
            : "Signed in successfully! Redirecting...",
        });

        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);

        if (status) {
          // Reset form after successful signup
          setTimeout(() => {
            setStatus(false);
            setFormData({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
            });
          }, 2500);
        } else {
          // ✅ Clear any old user first
          localStorage.removeItem("user");

          // ✅ Save new user data
          const userData = response.data.user || {};
          localStorage.setItem("user", JSON.stringify(userData));

          // ✅ Notify all pages that user changed
          window.dispatchEvent(new Event("userChanged"));

          // ✅ Proceed to file upload page
          setTimeout(() => {
            if (onSuccess) onSuccess(userData);
            onClose();
            navigate("/subscription");
          }, 2500);
        }
      } else {
        setToast({
          show: true,
          type: "error",
          message: response.data.message || "Login failed. Try again.",
        });
        setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
      }
    } catch (error) {
      console.error("Login error:", error);
      setToast({
        show: true,
        type: "error",
        message:
          error.response?.data?.message ||
          "An error occurred. Please try again later.",
      });
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
    } finally {
      setLoading(false);
    }
  };

  /* ✅ Google Login Handler (Custom Hook) */
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Send ACCESS TOKEN to backend
        const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
          googleAccessToken: tokenResponse.access_token,
        });

        if (res.data.success) {
          setToast({
            show: true,
            type: "success",
            message: "Google Login Successful!",
          });

          localStorage.removeItem("user");
          const userData = res.data.user;
          localStorage.setItem("user", JSON.stringify(userData));

          window.dispatchEvent(new Event("userChanged"));

          setTimeout(() => {
            if (onSuccess) onSuccess(userData);
            onClose();
            if (userData.subscription_plan === 'free') {
              navigate("/subscription");
            } else {
              navigate("/file_upload");
            }
          }, 1500);

        } else {
          setToast({ show: true, type: "error", message: "Google Login Failed" });
        }
      } catch (err) {
        console.error("Google Auth Error", err);
        setToast({ show: true, type: "error", message: "Google Login Error" });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      console.log('Login Failed');
      setToast({ show: true, type: "error", message: "Google Login Failed" });
    }
  });



  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("overlay")) onClose();
  };

  return (
    <>
      {/*  Toast */}
      <AnimatePresence>
        {toast.show && (
          <Toast show={toast.show} type={toast.type} message={toast.message} />
        )}
      </AnimatePresence>

      {/*  Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={handleOutsideClick}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, y: -60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{
                duration: 0.5,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
              className="relative w-[90%] max-w-sm bg-gray-100 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>

              {/* Title */}
              <div className="text-center mb-6 mt-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {status ? "Create Account" : "Welcome Back"}
                </h3>
                <p className="text-gray-500 text-sm">
                  {status ? "Sign up to get started" : "Sign in to continue"}
                </p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex justify-center border border-gray-300 rounded-full overflow-hidden mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setStatus(false);
                    setError("");
                  }}
                  className={`w-1/2 py-2 text-sm font-semibold transition-all duration-300 ${!status
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatus(true);
                    setError("");
                  }}
                  className={`w-1/2 py-2 text-sm font-semibold transition-all duration-300 ${status
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:text-gray-700"
                    }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-3 rounded-md bg-red-100 p-2 text-sm text-red-600 text-center"
                >
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {status && (
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                    />
                  </div>
                )}

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  />
                </div>

                <div className="relative">
                  <FontAwesomeIcon
                    icon={faLock}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-9 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon
                      icon={passwordVisible ? faUnlock : faLock}
                      size="sm"
                    />
                  </button>
                </div>

                {status && (
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type={confirmVisible ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-9 py-2 text-sm text-gray-900 focus:border-gray-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setConfirmVisible(!confirmVisible)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      <FontAwesomeIcon
                        icon={confirmVisible ? faUnlock : faLock}
                        size="sm"
                      />
                    </button>
                  </div>
                )}

                {/* Submit */}
                <div className="mt-5 flex justify-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md transition-all duration-300 ${loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gray-900 hover:bg-gray-800 cursor-pointer"
                      }`}
                  >
                    {loading ? "Loading..." : status ? "Sign Up" : "Sign In"}
                  </button>
                </div>
              </form>

              {/*  MetaMask Connect */}
              <div className="mt-5 flex justify-center">
                <button
                  onClick={connectMetaMask}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-sm shadow-md transition-all duration-300"
                >
                  <FontAwesomeIcon icon={faWallet} />
                  Connect with MetaMask
                </button>

              </div>

              {/*  Custom Google Login Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => login()}
                  type="button"
                  className="flex items-center gap-2 px-8.5 py-2 rounded-full bg-white hover:bg-gray-100 text-black font-semibold text-sm shadow-md transition-all duration-300"

                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
