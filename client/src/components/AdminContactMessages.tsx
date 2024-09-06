// src/components/AdminContactMessages.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

const AdminContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/api/contacts");
        setMessages(response.data);
      } catch (error) {
        console.error("Failed to fetch contact messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="admin-contact-messages">
      <h2>Contact Messages</h2>
      <ul>
        {messages.map((message) => (
          <li key={message._id}>
            <p><strong>Name:</strong> {message.name}</p>
            <p><strong>Email:</strong> {message.email}</p>
            <p><strong>Message:</strong> {message.message}</p>
            <p><strong>Date:</strong> {new Date(message.date).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminContactMessages;
