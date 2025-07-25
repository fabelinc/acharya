import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer
      style={{
        background: 'linear-gradient(to right, #3a1c71, #d76d77, #ffaf7b)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        color: 'white'
      }}
      className="pt-8 pb-6 px-4 sm:px-6"
    >
      <div className="max-w-6xl w-full mx-auto">
        {/* Top Section: 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start text-center md:text-left mt-6">
          {/* Left: Logo */}
          <div style={{ display: 'flex', gap: 16, padding: 20 }}>
            <img
              src="/favicon-32x32.png"
              alt="Your Logo"
              className="h-8 w-auto"
            />
          </div>

          {/* Center: Tagline */}
          <div>
            <p style={{ display: 'flex', gap: 16, padding: 16 }}>
              AI-powered solutions for modern coaching centers.
            </p>
          </div>
          {/* Right: Social Icons */}
          <div style={{ display: 'flex', gap: 16, padding: 16}}>
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
              href="https://www.linkedin.com/company/fabelinc/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-white hover:text-white"
              style={{ color: 'white' }}
            >
              <FaLinkedinIn size={24} />
            </a>
            <a
              href="https://wa.me/+919211068440"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-white hover:text-white"
              style={{ color: 'white' }}
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>

        {/* Bottom: Copyright */}
        <div className="mt-8 text-center">
          <p className="text-white text-opacity-70 text-xs">
            © {new Date().getFullYear()} Fabel, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
