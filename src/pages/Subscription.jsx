import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Subscription() {
    const [currentPlan, setCurrentPlan] = useState("free");
    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    // 🔹 Fetch current subscription
    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const res = await axios.get(
                    `${API_BASE_URL}/api/subscription/${user.U_id}`
                );
                if (res.data && res.data.plan) {
                    setCurrentPlan(res.data.plan);
                } else {
                    setCurrentPlan("free");
                }
            } catch (err) {
                console.error("Subscription fetch failed:", err);
                setCurrentPlan("free");
            }
        };
        fetchSubscription();
    }, [user.U_id]);

    // 🔹 Free plan continue
    const completeSubscription = () => {
        localStorage.setItem("subscriptionCompleted", "true");
        window.dispatchEvent(new Event("subscriptionChanged"));
        navigate("/file_upload");
    };

    // 🔹 Paid plan → go to Dummy Payment page
    const goToDummyPayment = (plan) => {
        navigate(`/dummy-payment/${plan}`);
    };

    return (
        <div className="max-w-5xl mx-auto p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">
                Choose Your Subscription Plan
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
                {/* FREE PLAN */}
                <PlanCard
                    title="Free"
                    price="₹0"
                    features={[
                        "5 uploads per month",
                        "Public files only",
                        "Basic access",
                    ]}
                    active={currentPlan === "free"}
                    onContinue={completeSubscription}
                />

                {/* BASIC PLAN */}
                <PlanCard
                    title="Basic"
                    price="₹199 / month"
                    features={[
                        "50 uploads per month",
                        "Public + Private files",
                        "Standard support",
                    ]}
                    active={currentPlan === "basic"}
                    onUpgrade={() => goToDummyPayment("basic")}
                />

                {/* PREMIUM PLAN */}
                <PlanCard
                    title="Premium"
                    price="₹499 / month"
                    features={[
                        "Unlimited uploads",
                        "Private files",
                        "Priority access",
                    ]}
                    active={currentPlan === "premium"}
                    onUpgrade={() => goToDummyPayment("premium")}
                />
            </div>
        </div>
    );
}

/* ---------------- Plan Card ---------------- */
function PlanCard({ title, price, features, active, onUpgrade, onContinue }) {
    return (
        <div
            className={`border rounded-xl p-6 shadow ${active ? "border-green-500 bg-green-50" : "bg-white"
                }`}
        >
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-2xl font-bold my-3">{price}</p>

            <ul className="space-y-2 text-sm mb-4">
                {features.map((f, i) => (
                    <li key={i}>✔ {f}</li>
                ))}
            </ul>

            {active ? (
                title === "Free" ? (
                    <button
                        onClick={onContinue}
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Continue
                    </button>
                ) : (
                    <button className="w-full bg-gray-300 py-2 rounded cursor-not-allowed">
                        Current Plan
                    </button>
                )
            ) : (
                <button
                    onClick={onUpgrade}
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                    Upgrade
                </button>
            )}
        </div>
    );
}
