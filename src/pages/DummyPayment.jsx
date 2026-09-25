import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
export default function DummyPayment() {
    const { plan } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const [loading, setLoading] = useState(false);

    /* ---------------- Validate Plan ---------------- */
    const allowedPlans = ["basic", "premium"];
    if (!plan || !allowedPlans.includes(plan)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-600 text-lg font-semibold">
                    Invalid or unsupported subscription plan.
                </p>
            </div>
        );
    }

    /* ---------------- Plan Details ---------------- */
    const planDetails = {
        basic: {
            name: "Basic Plan",
            price: 199,
            description:
                "Best for individual users who need private file sharing with higher upload limits.",
            features: [
                "50 uploads per month",
                "Public & private files",
                "CID history access",
                "Standard support",
            ],
        },
        premium: {
            name: "Premium Plan",
            price: 499,
            description:
                "Ideal for power users and organizations requiring unlimited access.",
            features: [
                "Unlimited uploads",
                "Advanced private access",
                "Full CID visibility",
                "Priority support",
                "Advanced history analytics",
            ],
        },
    };

    const selectedPlan = planDetails[plan];

    /* ---------------- Dummy Payment Handler ---------------- */
    const payNow = async () => {
        if (!user?.U_id) {
            alert("Session expired. Please login again.");
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/dummy-payment/pay`,
                {
                    U_id: user.U_id,
                    plan,
                }
            );
            if (res.data?.success) {
                // Cache last known plan for instant UX
                localStorage.setItem("lastKnownPlan", plan);

                // Notify App.jsx (NO reload)
                window.dispatchEvent(new Event("subscriptionChanged"));

                // Smooth redirect to dashboard
                navigate("/file_upload");
            } else {
                alert(res.data?.message || "Payment failed");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Something went wrong during payment");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- UI ---------------- */
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-center mb-2">
                    Dummy Payment Gateway
                </h2>
                <p className="text-center text-gray-500 mb-6">
                    Subscription upgrade (Demo Mode)
                </p>

                {/* Plan Info */}
                <div className="border rounded-xl p-4 mb-5 bg-gray-50">
                    <h3 className="text-xl font-semibold mb-1">
                        {selectedPlan.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-3">
                        {selectedPlan.description}
                    </p>

                    <ul className="space-y-2 text-sm mb-4">
                        {selectedPlan.features.map((feature, index) => (
                            <li key={index} className="flex gap-2">
                                <span className="text-green-600 font-bold">✔</span>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="text-center text-xl font-bold">
                        ₹{selectedPlan.price}
                    </div>
                </div>

                {/* Pay Button with Spinner */}
                <button
                    onClick={payNow}
                    disabled={loading}
                    className={`w-full py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition
            ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }
          `}
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                        </>
                    ) : (
                        "Pay Now"
                    )}
                </button>

                {/* Cancel */}
                <button
                    onClick={() => navigate(-1)}
                    className="w-full mt-3 py-2 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100"
                >
                    Cancel & Go Back
                </button>
            </div>
        </div>
    );
}
