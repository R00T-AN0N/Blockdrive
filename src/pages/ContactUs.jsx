import React, { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Toast from "../components/Toast";

/* ---------- Animation (Same as AboutUs) ---------- */
const containerVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1], // smooth premium easing
    },
  },
};

export function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/contact`, form);
      if (res.data.success) {
        setToast({
          show: true,
          type: "success",
          message: "Message sent successfully!",
        });
        setForm({ name: "", email: "", message: "" });
      } else {
        setToast({
          show: true,
          type: "error",
          message: "Failed to send message.",
        });
      }
    } catch (error) {
      console.error("Email send error:", error);
      setToast({
        show: true,
        type: "error",
        message: "Server error — please try again later.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => setToast((t) => ({ ...t, show: false })), 4000);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-6 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl px-8 py-6 md:px-10 md:py-8 hover:shadow-2xl transition-shadow duration-500"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2">
            Contact Us
          </h1>
          <p className="text-md text-gray-600">
            Have questions or feedback? We’d love to hear from you!
          </p>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
          <div className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-gray-800 text-2xl mb-2"
            />
            <h3 className="font-semibold text-gray-800">Email</h3>
            <p className="text-gray-600 text-sm">
              blockdrive7@gmail.com
            </p>
          </div>

          <div className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={faPhone}
              className="text-gray-800 text-2xl mb-2"
            />
            <h3 className="font-semibold text-gray-800">Phone</h3>
            <p className="text-gray-600 text-sm">
              +91 88665 86408
            </p>
          </div>

          <div className="flex flex-col items-center">
            <FontAwesomeIcon
              icon={faMapMarkerAlt}
              className="text-gray-800 text-2xl mb-2"
            />
            <h3 className="font-semibold text-gray-800">Location</h3>
            <p className="text-gray-600 text-sm">
              Ghandhinagar, India
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Your Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-200 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Your Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-200 focus:outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">
              Message
            </label>
            <textarea
              name="message"
              rows="3"
              value={form.message}
              onChange={handleChange}
              placeholder="Write your message here..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-200 focus:outline-none transition resize-none"
              required
            />
          </div>

          <div className="text-center pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              className={`${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gray-800 hover:bg-gray-900"
                } text-white px-8 py-2.5 rounded-lg font-semibold transition`}
            >
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </div>
        </form>
      </motion.div>

      <Toast show={toast.show} type={toast.type} message={toast.message} />
    </div>
  );
}

export default ContactUs;
