"use client";
import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { API_BASE_URL } from "./config/api";

import Loader from "./components/Loader.jsx";
import { SidebarProvider, useSidebar } from "./components/blocks/sidebar.jsx";
import { AppSidebar } from "./components/blocks/whatsapp-sidebar.jsx";
import DummyPayment from "./pages/DummyPayment.jsx";
import FileUploadPage from "./pages/FileUploadPage.jsx";
import { AboutUs } from "./pages/AboutUs.jsx";
import Subscription from "./pages/Subscription.jsx";
import { ContactUs } from "./pages/ContactUs.jsx";
import { MobileHeader } from "./components/blocks/MobileHeader.jsx";
import { Header } from "./components/DesktopHeader.jsx";
import Body from "./components/Body.jsx";
import Profile from "./pages/Profile.jsx";
import FileAccessPage from "./pages/FileAccess.jsx";
import { History } from "./pages/History.jsx";


/* ---------------- MAIN CONTENT LAYOUT ---------------- */
function MainLayout({ onLogout, children }) {
  const { state, isMobile } = useSidebar();

  // "expanded" -> w-64 (16rem/256px), "collapsed" -> w-12 (3rem/48px)
  // Mobile -> no margin (sidebar is overlay)
  // We use margin-left to push content past the fixed sidebar
  const marginClass = isMobile
    ? "ml-0"
    : (state === "expanded" ? "" : "");

  return (
    <div className={`flex-1 bg-white min-h-screen pt-14 transition-all duration-300 ease-in-out ${marginClass}`}>
      <MobileHeader onLogout={onLogout} />
      <Header onLogout={onLogout} />

      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

/* ---------------- DASHBOARD LAYOUT ---------------- */
function DashboardLayout({ onLogout }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <MainLayout onLogout={onLogout}>
          <Routes>
            <Route path="/file_upload" element={<FileUploadPage />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/file-access" element={<FileAccessPage />} />
            <Route path="*" element={<Navigate to="/file_upload" />} />
          </Routes>
        </MainLayout>
      </div>
    </SidebarProvider>
  );
}

/* ---------------- APP ---------------- */
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subscriptionDone, setSubscriptionDone] = useState(null); // null = checking

  /* Initial loader */
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  /* Load user from localStorage */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /* 🔑 BACKEND SUBSCRIPTION CHECK (ON LOAD & REFRESH) */
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;

      try {
        const res = await fetch(
          `${API_BASE_URL}/api/subscription/${user.U_id}`
        );
        const data = await res.json();

        setSubscriptionDone(
          Boolean(data?.plan && data.plan !== "free")
        );
      } catch (err) {
        console.error("Subscription check failed:", err);
        setSubscriptionDone(false);
      }
    };

    checkSubscription();
  }, [user]);

  /* 🔔 LISTEN FOR PAYMENT SUCCESS (NO RELOAD) */
  useEffect(() => {
    const handleSubscriptionChange = () => {
      setSubscriptionDone(true);
    };

    window.addEventListener("subscriptionChanged", handleSubscriptionChange);
    return () =>
      window.removeEventListener(
        "subscriptionChanged",
        handleSubscriptionChange
      );
  }, []);

  /* Login success */
  const handleLoginSuccess = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setSubscriptionDone(null); // trigger backend re-check
  };

  /* Logout */
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSubscriptionDone(null);
  };

  /* 🔒 Block UI while loading or checking subscription */
  if (isLoading || (user && subscriptionDone === null)) {
    return <Loader isLoading={true} />;
  }

  return (
    <AnimatePresence mode="wait">
      {/* ❌ NOT LOGGED IN */}
      {!user ? (
        <motion.div
          key="login"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
        >
          <Routes>
            <Route
              path="*"
              element={<Body onLoginSuccess={handleLoginSuccess} />}
            />
          </Routes>
        </motion.div>
      ) : (
        <>
          {/* 🔐 SUBSCRIPTION FLOW (No Plan Selected) */}
          {!subscriptionDone ? (
            <motion.div
              key="subscription"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Routes>
                {/* Note: DummyPayment is also needed here if they upgrade directly from Subscription page */}
                <Route
                  path="/dummy-payment/:plan"
                  element={<DummyPayment />}
                />
                <Route path="*" element={<Subscription />} />
              </Routes>
            </motion.div>
          ) : (
            /* ✅ DASHBOARD & PAYMENT */
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Routes>
                {/* Standalone Payment Page (No Sidebar) */}
                <Route
                  path="/dummy-payment/:plan"
                  element={<DummyPayment />}
                />
                {/* Dashboard (Catch-all) */}
                <Route path="*" element={<DashboardLayout onLogout={handleLogout} />} />
              </Routes>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
