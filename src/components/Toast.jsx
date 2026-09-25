import React, { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTriangleExclamation,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Toast({ show, type = "success", message = "" }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => setVisible(show), [show]);

  const toastStyles = {
    success: {
      icon: faCheckCircle,
      color: "text-green-400",
      title: "Success",
    },
    logout: {
      icon: faRightFromBracket,
      color: "text-blue-400",
      title: "Logged Out",
    },
    error: {
      icon: faTriangleExclamation,
      color: "text-red-400",
      title: "Error",
    },
  };

  const { icon, color, title } = toastStyles[type] || toastStyles.success;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 50, x: 50 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 50, x: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3 bg-neutral-900 text-white border border-gray-700 rounded-lg px-5 py-3 shadow-xl"
          >
            <FontAwesomeIcon icon={icon} className={`${color} text-lg`} />
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-gray-300 text-sm">{message}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
