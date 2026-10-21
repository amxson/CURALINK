import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEnvelope, FaCalendarAlt, FaTrashAlt, FaReply, FaCommentAlt, FaUserCircle } from "react-icons/fa";
import Loading from "./Loading";
import Empty from "./Empty";
import "../styles/Patients.css"; // Global dashboard styles
import "../styles/AdminContact.css"; // The inbox styles I gave you earlier

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ EXTRACTION LOGIC: Safe extraction from API response
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get("/api/contact/contactMessages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      /** * DATA EXTRACTION CHECK:
       * Some APIs return { data: [...] } while others return [...]
       * This logic handles both to prevent .map() errors.
       */
      const extractedData = Array.isArray(response.data)
        ? response.data
        : (response.data.messages || []);

      setMessages(extractedData);
    } catch (err) {
      console.error("Extraction Error:", err);
      toast.error("Failed to sync inbox");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const deleteMsg = async (id: string) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      const token = localStorage.getItem("token");
      // Adjust this URL if your delete endpoint is different
      await axios.delete(`/api/contact/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Message deleted");
      setMessages(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      toast.error("Could not delete");
    }
  };

  if (loading) return <Loading />;

  return (
    <section className="patients-page">
      <div className="patients-header">
        <div className="header-left">
          <h1>Communications</h1>
          <p>Direct inquiries from your website contact form</p>
        </div>
        <div className="header-actions">
           <div className="stats-mini-badge">
             Inquiries: <strong>{messages.length}</strong>
           </div>
        </div>
      </div>

      {messages.length > 0 ? (
        <div className="message-grid">
          {messages.map((msg) => (
            <div key={msg._id} className="message-card shadow-card">
              <div className="message-card-header">
                <div className="sender-info">
                  <div className="sender-avatar">
                    {msg.name ? msg.name.charAt(0).toUpperCase() : <FaUserCircle />}
                  </div>
                  <div>
                    <h3>{msg.name}</h3>
                    <p><FaEnvelope /> {msg.email}</p>
                  </div>
                </div>
                <div className="message-date">
                  <FaCalendarAlt /> {new Date(msg.date).toLocaleDateString()}
                </div>
              </div>

              <div className="message-body">
                <div className="quote-icon"><FaCommentAlt /></div>
                <p>{msg.message}</p>
              </div>

              <div className="message-actions">
                <a href={`mailto:${msg.email}`} className="action-btn reply">
                  <FaReply /> Quick Reply
                </a>
                <button className="action-btn delete-text" onClick={() => deleteMsg(msg._id)}>
                  <FaTrashAlt /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty message="No new messages in your inbox." />
      )}
    </section>
  );
};

export default ContactMessages;
