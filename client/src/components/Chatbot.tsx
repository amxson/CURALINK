import React, { useState, useEffect, useRef } from "react";
import "../styles/chatbot.css"; // Import the CSS for styling
import axios from "axios";

interface BasicResponses {
  [key: string]: string;
}

const basicResponses: BasicResponses = {
  "what are your hours?": "Our office hours are Monday to Friday, 9 AM to 5 PM.",
  "what is your address?": "We are located at 123 Health Street, Wellness City.",
  "how can I contact support?": "You can contact support via email at support@health.com or call us at (123) 456-7890.",
  // Add more predefined questions and answers here
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; user: boolean }[]>([]);
  const [input, setInput] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (isModalOpen) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Hello! How can I assist you today?", user: false },
      ]);
    }
  }, [isModalOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (input.trim() === "") return;

    const userMessage = input;
    setMessages(prevMessages => [...prevMessages, { text: userMessage, user: true }]);
    setInput("");
    setIsLoading(true); // Start loading animation

    try {
      // Step 1: Retrieve the initial bot response
      const initialResponse = await axios.post("/api/chat", { prompt: userMessage, clearContext: false });
      const botResponse = initialResponse.data.message;

      // Step 2: Format the bot response in HTML
      const formatPrompt = `
      Convert the following text into HTML. For each sentence, generate a corresponding HTML snippet using inline CSS for styling. Ensure that:
      - The HTML is wrapped in a "<div>" tag.
      - Do not include any "DOCTYPE", "html", "head", or "body" tags.
      - Do not use <p> tags.
      - Avoid including any disclaimers or statements about limitations in providing medical advice.
      - Apply inline CSS styling directly in the HTML tags.
      - Provide the HTML code directly without any disclaimers or additional text.
      - Style it based on what the content should look like based on the content generated.
      - If the response mentions symptoms, recommend a list of specialists based on those symptoms. Use "<ul>" and "<li>" tags for the list, and make the specialist names bold.
      - Ensure the response is precise and short. 
    
      If a list of symptoms or a symptom is mentioned, the output should include a recommendation list with specialists formatted as follows:
      - Specialists should be listed in "<ul>" with "<li>" tags.
      - Specialist names should be bolded using the "<strong>" tag.
    
      Bot Response:
      ${botResponse}
    `;
    
      const htmlResponse = await axios.post("/api/chat", { prompt: formatPrompt, clearContext: false });
      const formattedHtml = htmlResponse.data.message;

      setMessages(prevMessages => [...prevMessages, { text: formattedHtml, user: false }]);
    } catch (error) {
      console.error("Error processing chatbot response:", error);
      setMessages(prevMessages => [...prevMessages, { text: "<div style='font-size: 16px; font-family: sans-serif;'>There was an error processing your request. Please try again later.</div>", user: false }]);
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  const handleClearContext = async () => {
    try {
      await axios.post("/api/chat/clear-context");
      setMessages([])
      setMessages((prevMessages) => [
        { text: "Hello! How can I assist you today?", user: false },
      ]);
    } catch (error) {
      console.error("Error clearing chatbot context:", error);
    }
  };

  return (
    <>
      <button className="chatbot-button" onClick={() => setIsModalOpen(true)}>
        💬
      </button>

      <div className={`chatbot ${isModalOpen ? "open" : ""}`}>
        <div className="chatbot-header">
          <button
            className="close-button"
            onClick={() => setIsModalOpen(false)}
          >
            &times;
          </button>
          <h2 style={{ color: "#fff", margin: 0 }}>Medical-chatbot</h2>
          <button className="clear-context-button" onClick={handleClearContext}>
            Clear Context
          </button>
        </div>

        <div className="messages">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.user ? "user" : "bot"}`}>
              <div dangerouslySetInnerHTML={{ __html: msg.text }} />
            </div>
          ))}
          {isLoading && (
            <div className="loading-animation bot">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading} // Disable input while loading
          />
          <button type="submit" disabled={isLoading}>Send</button>
        </form>
      </div>
    </>
  );
};

export default Chatbot;
