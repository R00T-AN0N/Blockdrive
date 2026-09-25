"use client";
import { API_BASE_URL } from "../../config/api";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faBars,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useSidebar } from "@/components/blocks/sidebar";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Toast from "@/components/Toast";
import { WalletConnect } from "../WalletConnect";

export function MobileHeader({ onLogout }) {
  const { openMobile, toggleSidebar, setOpenMobile, isMobile, setState } = useSidebar();
  const navigate = useNavigate();

  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState("logout"); // success, error, logout
  const [toastMessage, setToastMessage] = useState("");

  const handleLogout = async () => {
    try {
      // ✅ Step 1: Show initial toast (logging out)
      setToastType("logout");
      setToastMessage("Logging you out...");
      setShowToast(true);

      // ✅ Step 2: Wait before performing logout (smooth UX)
      setTimeout(async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/logout`, { method: "POST" });

          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }

          // ✅ Step 3: Successful logout
          localStorage.removeItem("user");
          if (setState) setState("collapsed");
          setOpenMobile(false);

          setToastType("success");
          setToastMessage("You have been logged out safely.");
          setShowToast(true);

          setTimeout(() => {
            setShowToast(false);
            if (onLogout) onLogout();
            navigate("/login");
          }, 500);
        } catch (err) {
          console.error("Logout failed:", err);
          setToastType("error");
          setToastMessage("Logout failed. Please try again later.");
          setShowToast(true);

          // Hide toast after 3 seconds
          setTimeout(() => setShowToast(false), 3000);
        }
      }, 900);
    } catch (err) {
      console.error("Unexpected logout error:", err);
      setToastType("error");
      setToastMessage("Unexpected error. Please try again.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      {/* ✅ Toast Component */}
      <Toast show={showToast} type={toastType} message={toastMessage} />

      <motion.header
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 w-full z-[10000] h-14 flex items-center justify-between 
        bg-white border-b border-gray-200 shadow-sm"
      >
        <div className="flex items-center justify-between w-full px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label={openMobile ? "Close menu" : "Open menu"}
              className="h-8 w-8 flex items-center justify-center rounded-md text-black 
                         hover:bg-gray-100 transition-colors md:hidden relative z-[11000]"
              onClick={(e) => {
                e.preventDefault();
                if (typeof isMobile === "boolean" ? isMobile : window.innerWidth < 768) {
                  setOpenMobile((v) => !v);
                } else {
                  toggleSidebar();
                }
              }}
            >
              {openMobile ? (
                <FontAwesomeIcon icon={faXmark} className="text-xl font-bold transition" />
              ) : (
                <FontAwesomeIcon icon={faBars} className="text-lg transition" />
              )}
            </button>

            <h1 className="text-lg font-semibold text-gray-900 select-none">
              Block<span className="text-blue-600">Drive</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <WalletConnect className="text-sm" />

            <button
              aria-label="Logout"
              onClick={handleLogout}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <FontAwesomeIcon
                icon={faArrowRightFromBracket}
                className="text-lg text-gray-700 hover:text-red-500 transition"
              />
            </button>
          </div>
        </div>
      </motion.header>
    </>
  );
}
