import React from "react";
import "../styles/footer.css";
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-info">
          <p>&copy; {new Date().getFullYear()} CURALINK. All rights reserved.</p>
        </div>
        <div className="social">
          <ul>
            <li className="facebook">
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaFacebookF />
              </a>
            </li>
            <li className="youtube">
              <a
                href="https://www.youtube.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaYoutube />
              </a>
            </li>
            <li className="instagram">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
              >
                <FaInstagram />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
