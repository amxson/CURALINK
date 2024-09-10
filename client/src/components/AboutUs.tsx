import React from "react";
import image from "../images/image.png";
import "../styles/about.css";  // Import the new CSS file

const AboutUs: React.FC = () => {
  return (
    <>
      <section className="about-container">
        <h2 className="about-heading">About Us</h2>
        <div className="about-content">
          <div className="about-image-container">
            <img
              src={image}
              alt="Image of a healthcare professional providing service or consultation"
              className="about-shaking-image"
            />
          </div>
          <div className="about-text">
            <p>
              At CuraLink, we are dedicated to bridging the gap between patients and healthcare providers through a reliable, user-friendly digital platform. Our mission is to make healthcare accessible, efficient, and personalized for everyone. By partnering with leading doctors, clinics, and hospitals, we ensure that you receive high-quality care whenever you need it. With a focus on patient satisfaction and innovative technology, CuraLink empowers you to take control of your health with ease.
            </p>
            <p>
              Your health is our priority, and CuraLink is here to connect you with the care you deserve.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
