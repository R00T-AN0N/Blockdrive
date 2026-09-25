import React from "react";

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
      ease: [0.22, 1, 0.36, 1], // smooth easeOut
    },
  },
};

export function AboutUs() {
  return (
    <div className="min-h-[calc(100vh-60px)] bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-6 py-12">
      {/* Animated Card */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 hover:shadow-2xl transition-shadow duration-500"
      >
        {/* Website Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 text-center mb-4">
          BlockDrive
        </h1>

        {/* Tagline */}
        <p className="text-lg text-gray-600 text-center mb-8">
          Your Secure, Smart, and Seamless Cloud File Management Platform
        </p>

        {/* About Content */}
        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            <strong>BlockDrive</strong> is a next-generation file storage and
            sharing solution designed to make file management effortless.
            Whether you’re uploading, organizing, or accessing your data,
            BlockDrive ensures a smooth, fast, and secure experience.
          </p>

          <p>
            Our mission is to empower individuals and businesses to store their
            data safely in the cloud — with maximum privacy, transparency, and
            control. We combine cutting-edge technologies with a user-friendly
            interface to create a truly modern cloud experience.
          </p>

          <p>
            From multimedia files to important documents, you can upload and
            manage everything with ease. Your data is encrypted, backed up, and
            always accessible — anytime, anywhere.
          </p>

          <p className="text-gray-500 italic text-center">
            “Simple. Secure. Smart. — That’s BlockDrive.”
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default AboutUs;