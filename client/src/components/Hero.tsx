import React from "react";
import image from "../images/aboutimg.jpg";
import "../styles/hero.css";

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1>
          Your Health, <br />
          Our Responsibility
        </h1>
        <p>
        Welcome to CuraLink, your trusted online platform for seamless doctor appointments and healthcare management. At CuraLink, we understand the importance of easy access to healthcare, so we’ve created a system that connects you to the best healthcare professionals at your convenience. Whether you need a routine check-up, specialist consultation, or immediate care, CuraLink is here to simplify your healthcare journey.
        </p>
      </div>
      <div className="hero-img">
          <img
            src={image}
            alt="Hero image showcasing a key aspect of the website or service"
          />
        </div>

    </section>
  );
};

export default Hero;
