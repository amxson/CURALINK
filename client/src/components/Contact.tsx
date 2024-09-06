import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast"; 
import "../styles/contact.css";

interface FormDetails {
  name: string;
  email: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formDetails, setFormDetails] = useState<FormDetails>({
    name: "",
    email: "",
    message: "",
  });

  const inputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDetails({
      ...formDetails,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      await toast.promise(
        axios.post(
          "/api/contact/createContact",
          formDetails,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        ),
        {
          success: "Message sent successfully!",
          error: "Failed to send message",
          loading: "Sending message...",
        }
      );

      setFormDetails({
        name: "",
        email: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error:", error.response ? error.response.data : error.message);
    }
  };

  return (
    <section className="register-section flex-center" id="contact">
      <div className="contact-container flex-center contact">
        <h2 className="form-heading">Contact Us</h2>
        <form onSubmit={handleSubmit} className="register-form">
          <input
            type="text"
            name="name"
            className="form-input"
            placeholder="Enter your name"
            value={formDetails.name}
            onChange={inputChange}
          />
          <input
            type="email"
            name="email"
            className="form-input"
            placeholder="Enter your email"
            value={formDetails.email}
            onChange={inputChange}
          />
          <textarea
            name="message"
            className="form-input"
            placeholder="Enter your message"
            value={formDetails.message}
            onChange={inputChange}
            rows={8}
            cols={12}
          ></textarea>
          <button type="submit" className="btn form-btn">Send</button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
