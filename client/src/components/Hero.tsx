import React from "react";
import image from "../images/aboutimg.jpg";
import "../styles/hero.css";

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Your Health, <br />
          Our Responsibility
        </h1>
        <p>
          Welcome to CuraLink, your trusted platform for seamless doctor appointments and healthcare management. We connect you with top healthcare professionals, making it easy to access routine check-ups, specialist consultations, or immediate care at your convenience.
        </p>
        <div className="heartbeat-container">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 400 60"
            className="heartbeat-svg"
          >
            <polyline
              fill="none"
              stroke="#0a74da"
              strokeWidth="2.5"
              points="0,30 20,30 40,5 60,55 80,30 100,30 120,55 140,5 160,30 180,30 200,5 220,55 240,30 260,30 280,5 300,55 320,30 400,30"  
              className="heartbeat-polyline"
            />
          </svg>
        </div>
      </div>
      <div className="hero-img">
        <img
          src={image}
          alt="Hero image showcasing healthcare service"
          className="animated-image"
        />
      </div>
    </section>
  );
};

export default Hero;
