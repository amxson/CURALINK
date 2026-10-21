import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import "../styles/chatbot.css";

interface Message {
  text: string;
  user: boolean;
  doctors?: any[];
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Booking state
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(scrollToBottom, [messages, isLoading]);

  useEffect(() => {
    if (isModalOpen && messages.length === 0) {
      setMessages([{ text: "Hello! Describe your symptoms, and I'll help you find the right doctor.", user: false }]);
    }
  }, [isModalOpen, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { text: userMsg, user: true }]);
    setIsLoading(true);

    try {
      const { data } = await axios.post("/api/chat", { prompt: userMsg }, { withCredentials: true });
      setMessages(prev => [...prev, { text: data.message, user: false, doctors: data.doctors }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "⚠️ Error connecting to server.", user: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmBooking = async () => {
    if (!bookingDate || !bookingTime) return alert("Please select date and time");
    const token = localStorage.getItem("token");

    try {
      await axios.post("/api/appointment/opd/create", {
        doctorId: selectedDoctor.userId._id,
        doctorname: selectedDoctor.name,
        date: bookingDate,
        time: bookingTime,
        opdType: selectedDoctor.specialization
      }, { headers: { Authorization: `Bearer ${token}` } });

      setMessages(prev => [...prev, { text: `✅ Appointment booked with **${selectedDoctor.name}** for ${bookingDate} at ${bookingTime}.`, user: false }]);
      setSelectedDoctor(null);
    } catch (err) {
      alert("Booking failed. Please try again.");
    }
  };

  return (
    <>
      <button className="chatbot-toggle" onClick={() => setIsModalOpen(!isModalOpen)}>💬</button>

      <div className={`chatbot-container ${isModalOpen ? "active" : ""}`}>
        <div className="chatbot-header">
          <h3 className="chatbot-title">CuraLink Assistant</h3>
          <button className="close_btn" onClick={() => setIsModalOpen(false)}>&times;</button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className="msg-box">
              <div className={`msg-bubble ${msg.user ? "user" : "bot"}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
              {!msg.user && msg.doctors && msg.doctors.length > 0 && (
                <div className="doctor-list-horizontal">
                  {msg.doctors.map(doc => (
                    <div className="doc-mini-card" key={doc._id}>
                      <img src={doc.pic} alt="doc" />
                      <h5>{doc.name}</h5>
                      <button onClick={() => {setSelectedDoctor(doc); setBookingDate(""); setBookingTime("");}}>Book</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isLoading && <div className="typing">AI is thinking...</div>}
          <div ref={messagesEndRef} />
        </div>

        {selectedDoctor && (
          <div className="booking-overlay">
            <div className="overlay-content">
              <h4>Book {selectedDoctor.name}</h4>
              <p>Select Date:</p>
              <div className="chip-grid">
                {selectedDoctor.availableDates.map((d:any) => (
                  <button key={d} className={bookingDate === d ? "active":""} onClick={()=>setBookingDate(d)}>{d}</button>
                ))}
              </div>
              <p>Select Time:</p>
              <div className="chip-grid">
                {selectedDoctor.availableTimes.map((t:any) => (
                  <button key={t} className={bookingTime === t ? "active":""} onClick={()=>setBookingTime(t)}>{t}</button>
                ))}
              </div>
              <div className="overlay-btns">
                <button className="confirm-btn" onClick={confirmBooking}>Confirm</button>
                <button className="cancel-btn" onClick={() => setSelectedDoctor(null)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <form className="chatbot-input" onSubmit={handleSubmit}>
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="How are you feeling?" />
          <button type="submit">Send</button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
