import React, { useEffect, useState } from "react";
import axios from "axios";
import '../styles/contactMessages.css';

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token"); // Get the token from local storage
        const response = await axios.get("/api/contact/contactMessages", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMessages(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load messages.");
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  if (loading) return <p className="loading">Loading...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="contact-messages-section">
      <h2>Contact Messages</h2>
      <ul>
        {messages.map((message) => (
          <li key={message._id} className="contact-message-item">
            <p><strong>Name:</strong> {message.name}</p>
            <p><strong>Email:</strong> {message.email}</p>
            <p><strong>Message:</strong> {message.message}</p>
            <p><strong>Date:</strong> {new Date(message.date).toLocaleDateString()}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ContactMessages;
