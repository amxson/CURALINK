import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import "../styles/chatbot.css";

interface DoctorSuggestion {
  _id: string;
  name: string;
  specialization: string;
  userId: { _id: string; pic?: string };
  availableDates: string[];
  availableTimes: string[];
}
interface Message { text: string; user: boolean; doctors?: DoctorSuggestion[]; }

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<DoctorSuggestion | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();

  // Effects must never return the browser's scrolling result as React cleanup.
  // Scroll this panel only, so opening the assistant cannot move the whole page.
  useEffect(() => {
    const panel = messagesRef.current;
    if (panel) panel.scrollTop = panel.scrollHeight;
  }, [messages, isLoading, isOpen]);

  useEffect(() => { setIsOpen(false); setBooking(null); }, [location.pathname]);
  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus({ preventScroll: true });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setBooking(null); setIsOpen(false); toggleRef.current?.focus({ preventScroll: true }); }
    };
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("keydown", escape); };
  }, [isOpen]);

  const toggle = () => {
    if (!isOpen && messages.length === 0) setMessages([{ text: "Hello! I can help you find a department and book a visit. How can I help?", user: false }]);
    setBooking(null);
    setIsOpen(!isOpen);
  };
  const close = () => { setIsOpen(false); setBooking(null); toggleRef.current?.focus({ preventScroll: true }); };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isLoading) return;
    const prompt = input.trim(); setInput(""); setMessages(prev => [...prev, { text: prompt, user: true }]); setIsLoading(true);
    try {
      const { data } = await axios.post("/api/chat", { prompt }, { withCredentials: true, timeout: 45000 });
      const doctors = Array.isArray(data?.doctors) ? data.doctors.filter((doc: any) => doc && typeof doc._id === "string" && typeof doc.name === "string" && doc.userId?._id).map((doc: any) => ({ ...doc, availableDates: Array.isArray(doc.availableDates) ? doc.availableDates.filter((d: unknown) => typeof d === "string") : [], availableTimes: Array.isArray(doc.availableTimes) ? doc.availableTimes.filter((t: unknown) => typeof t === "string") : [] })) : [];
      setMessages(prev => [...prev, { text: typeof data?.message === "string" ? data.message : "I couldn't read that response. Please try again.", user: false, doctors }]);
    } catch {
      setMessages(prev => [...prev, { text: "The assistant couldn't connect. Please try again, or browse the doctor directory.", user: false }]);
    } finally { setIsLoading(false); }
  };
  const confirmBooking = async () => {
    if (!booking || !bookingDate || !bookingTime || isBooking) return;
    const token = localStorage.getItem("token");
    if (!token) { toast.error("Please sign in before booking an appointment."); return; }
    setIsBooking(true);
    try {
      await axios.post("/api/appointment/opd/create", { doctorId: booking.userId._id, doctorname: booking.name, date: bookingDate, time: bookingTime, opdType: booking.specialization }, { headers: { Authorization: `Bearer ${token}` }, timeout: 30000 });
      setMessages(prev => [...prev, { text: `Appointment booked with ${booking.name} for ${bookingDate} at ${bookingTime}.`, user: false }]); setBooking(null);
    } catch { toast.error("Unable to book this appointment. Please try again."); }
    finally { setIsBooking(false); }
  };
  return <>
    <button ref={toggleRef} type="button" className="chatbot-toggle" aria-label={isOpen ? "Close assistant" : "Open assistant"} aria-expanded={isOpen} aria-controls="curalink-assistant" onClick={toggle}>{isOpen ? "×" : "💬"}</button>
    {isOpen && <section id="curalink-assistant" className="chatbot-container" role="dialog" aria-label="CuraLink Assistant">
      <div className="chatbot-header"><h2>CuraLink Assistant</h2><button type="button" aria-label="Close chat" onClick={close}>×</button></div>
      <div ref={messagesRef} className="chatbot-messages" role="log" aria-live="polite" aria-relevant="additions">
        {messages.map((message, i) => <div key={i} className={`chatbot-message ${message.user ? "from-user" : "from-assistant"}`}>
          <div className="chatbot-bubble"><ReactMarkdown>{message.text}</ReactMarkdown></div>
          {!!message.doctors?.length && <div className="chatbot-doctors">{message.doctors.map(doc => <article key={doc._id} className="chatbot-doctor">
            {doc.userId.pic && <img src={doc.userId.pic} alt="" />}<h3>{doc.name}</h3><p>{doc.specialization}</p>
            <button type="button" onClick={() => { setBooking(doc); setBookingDate(""); setBookingTime(""); }}>Book a visit</button>
          </article>)}</div>}
        </div>)}
        {isLoading && <p className="chatbot-status" role="status">Preparing a response…</p>}
      </div>
      <form className="chatbot-input" onSubmit={handleSubmit}>
        <input ref={inputRef} aria-label="Message the assistant" value={input} onChange={e => setInput(e.target.value)} maxLength={2000} placeholder="How can I help?" />
        <button type="submit" disabled={isLoading || !input.trim()}>Send</button>
      </form>
      {booking && <div className="chatbot-booking" role="group" aria-label="Book an appointment">
        <div className="chatbot-booking-content"><h3>Book {booking.name}</h3>
          {booking.availableDates.length && booking.availableTimes.length ? <>
            <label htmlFor="chatbot-date">Date</label><select id="chatbot-date" value={bookingDate} onChange={e => setBookingDate(e.target.value)}><option value="">Choose a date</option>{booking.availableDates.map(d => <option key={d}>{d}</option>)}</select>
            <label htmlFor="chatbot-time">Time</label><select id="chatbot-time" value={bookingTime} onChange={e => setBookingTime(e.target.value)}><option value="">Choose a time</option>{booking.availableTimes.map(t => <option key={t}>{t}</option>)}</select>
            <button type="button" disabled={!bookingDate || !bookingTime || isBooking} onClick={confirmBooking}>{isBooking ? "Booking…" : "Confirm appointment"}</button>
          </> : <p>No appointment times were provided. Please book through the doctor directory.</p>}
          <button type="button" onClick={() => setBooking(null)}>Back to chat</button>
        </div>
      </div>}
    </section>}
  </>;
};
class AssistantBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <button type="button" className="chatbot-toggle" aria-label="Retry assistant" title="The assistant had a problem. Click to retry." onClick={() => this.setState({ failed: false })}>↻</button>;
    return this.props.children;
  }
}
const Assistant: React.FC = () => <AssistantBoundary><Chatbot /></AssistantBoundary>;
export default Assistant;
