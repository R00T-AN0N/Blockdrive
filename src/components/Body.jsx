import Navbar from "../components/Navbar";
import backgroundImage from "../assets/background.png";
import SignInModal from "../pages/SignInModal";
import { useState } from "react";

export default function Body({ onLoginSuccess }) {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <main className="relative min-h-screen text-white scroll-smooth">
      {/* Navbar */}
      <Navbar />

      {/* Home Section */}
      <section
        id="home"
        className="h-screen flex flex-col justify-center items-center bg-cover bg-center bg-no-repeat text-center relative"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>

        {/* Content */}
        <div className="relative z-10 px-6">
          <h1 className="text-6xl md:text-7xl font-bold mb-4">
            Welcome to <span className="text-gray-950">BlockDrive</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto mb-8">
            Secure, decentralized, and efficient blockchain-powered storage.
          </p>

          {/* ✅ Sign In Button */}
          <button
            onClick={() => setShowSignIn(true)}
            className="px-8 py-3 bg-gray-800 text-white font-semibold text-lg rounded-lg shadow-lg 
                       hover:bg-gray-900 hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Sign In
          </button>
        </div>

        {/* ✅ Sign In Modal */}
        {showSignIn && (
          <SignInModal
            open={showSignIn}
            onClose={() => setShowSignIn(false)}
            onSuccess={(userData) => {
              setShowSignIn(false);
              onLoginSuccess?.(userData);
            }}
          />
        )}
      </section>

      {/* About Us Section */}
      <section
        id="about"
        className="h-screen flex flex-col justify-center items-center bg-gray-600 text-center px-6"
      >
        <h2 className="text-5xl font-bold mb-6">About Us</h2>
        <p className="max-w-2xl text-gray-300 text-lg leading-relaxed">
          BlockDrive combines blockchain and IPFS to create a truly decentralized
          file storage system — secure, private, and transparent. Our mission is
          to make file storage simple, efficient, and tamper-proof.
        </p>
      </section>

      <section
        id="contact"
        className="h-screen flex flex-col justify-center items-center bg-gray-700 text-center px-6"
      >
        <h2 className="text-5xl font-bold mb-6">Contact Us</h2>
        <p className="text-lg text-gray-300 mb-4">
          Get in touch for collaborations or support.
        </p>

        <form className="w-full max-w-md space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
          <textarea
            rows="4"
            placeholder="Message"
            className="w-full p-3 rounded bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full px-8 py-3 bg-gray-800 text-white rounded text-lg
                       hover:bg-gray-900 hover:scale-105 shadow-md shadow-black transition-all duration-300"
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
