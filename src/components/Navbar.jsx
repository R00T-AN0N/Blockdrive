import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faInfoCircle,
  faEnvelope,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) section.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  // ✅ Track which section is visible
  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.6 } // 60% visible triggers active
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // ✅ Auto-close sidebar when screen becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navItems = [
    { id: "home", label: "Home", icon: faHome },
    { id: "about", label: "About Us", icon: faInfoCircle },
    { id: "contact", label: "Contact Us", icon: faEnvelope },
  ];

  return (
    <>
      {/* Navbar Top */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-transparent backdrop-blur-sm text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          {/* Logo */}
          <div
            className="text-2xl font-bold cursor-pointer select-none"
            onClick={() => scrollToSection("home")}
          >
            Block<span className="text-gray-800">Drive</span>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex space-x-10 font-semibold">
            {navItems.map((item) => (
              <li key={item.id} className="group relative">
                <button
                  onClick={() => scrollToSection(item.id)}
                  className={`flex p-2 items-center gap-2 transition-all duration-300 ${activeSection === item.id
                      ? "text-gray-900"
                      : "hover:text-gray-900 text-gray-300"
                    }`}
                >
                  {item.label}
                </button>
                {/* Animated underline */}
                <span
                  className={`absolute left-0 bottom-0 h-[2px] bg-gray-800 transition-all duration-300 ${activeSection === item.id ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                ></span>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-2xl focus:outline-none"
            onClick={() => setMenuOpen(true)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white shadow-2xl transform transition-transform duration-500 ease-in-out z-[9999] ${menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700">
          <span className="text-xl font-bold">
            Block<span className="text-blue-400">Drive</span>
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="text-2xl focus:outline-none hover:text-blue-400 transition"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* Menu Items */}
        <ul className="flex flex-col space-y-6 mt-8 px-6 text-lg font-semibold">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-300 ${activeSection === item.id
                    ? "bg-gray-700 text-blue-400"
                    : "hover:bg-gray-700"
                  }`}
              >
                <FontAwesomeIcon icon={item.icon} className="mr-3" />{" "}
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay when sidebar open */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/75 z-[9998]"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
