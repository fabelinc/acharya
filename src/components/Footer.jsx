import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        color: 'white'
      }}
      className="py-6 px-4 sm:px-6"
    >
      <div className="max-w-4xl w-full mx-auto text-center">
        <div className="flex justify-center items-center mb-3">
          <img
            src="/favicon-32x32.png"
            alt="Your Logo"
            className="h-8 w-auto mr-2"
          />
          <span className="text-xl font-semibold text-white">Aacharya</span>
        </div>
        <p className="text-white justify-center text-opacity-80 text-xl mb-3">
          AI-powered solutions for modern coaching centers.
        </p>
        <div className="flex justify-center gap-x-20 mb-8">
          <a
            href="https://www.facebook.com/profile.php?id=61578306972577"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-white hover:text-white"
            style={{ color: 'white' }}
          >
            <FaFacebookF size={24} />
          </a>
          <a
            href="https://www.linkedin.com/company/fabelinc/ "
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-white hover:text-white"
            style={{ color: 'white' }}
          >
            <FaLinkedinIn size={24} />
          </a>
          <a
            href="https://wa.me/+919211068440"  // Use your WhatsApp link here
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="text-white hover:text-white"
            style={{ color: 'white' }}
          >
            <FaWhatsapp size={24} />
          </a>
          
        </div>
        <p className="text-white text-opacity-70 text-xs">
          © {new Date().getFullYear()} Fabel, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
