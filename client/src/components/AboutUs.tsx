import React from "react";
import image from "../images/image.png";

const AboutUs: React.FC = () => {
  return (
    <>
      <section className="container">
        <h2 className="page-heading about-heading">About Us</h2>
        <div className="about">
          <div className="hero-img">
            <img
              src={image}
              alt="hero"
            />
          </div>
          <div className="hero-content">
            <p>
              At CuraLink, we are dedicated to bridging the gap between patients and healthcare providers through a reliable, user-friendly digital platform. Our mission is to make healthcare accessible, efficient, and personalized for everyone. By partnering with leading doctors, clinics, and hospitals, we ensure that you receive high-quality care whenever you need it. With a focus on patient satisfaction and innovative technology, CuraLink empowers you to take control of your health with ease.

              Your health is our priority, and CuraLink is here to connect you with the care you deserve.
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
