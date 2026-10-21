import React from "react";
import "../styles/footer.css";
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-info">
          <p>
            &copy; {new Date().getFullYear()} <span>CuraLink</span>.
            Reliable Healthcare Management.
          </p>
        </div>

        <nav className="social">
          <ul>
            <li className="facebook">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
            </li>
            <li className="youtube">
              <a href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </li>
            <li className="instagram">
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
