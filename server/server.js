const express = require("express");
const cors = require("cors");
const axios = require("axios");
const session = require('express-session');
const fs = require('fs');

require("dotenv").config();
require("./db/conn");
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const contactroute = require('./routes/contactRoutes');
const notificationRouter = require("./routes/notificationRouter");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Debug Middleware
app.use((req, res, next) => {
  console.log('Session ID:', req.sessionID);
  console.log('Session Data:', req.session);

  fs.appendFileSync('debug.log', `Session ID: ${req.sessionID}\nSession Data: ${JSON.stringify(req.session, null, 2)}\n\n`);

  next();
});

// Routes
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/contact", contactroute);

app.post('/api/chat/clear-context', (req, res) => {
  req.session.context = [];
  res.json({ message: 'Session context cleared' });
});

// Chat Route
app.post('/api/chat', async (req, res) => {
  const { prompt, clearContext } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Clear the session context if requested
  if (clearContext) {
    req.session.context = [];
    return res.json({ message: 'Session context cleared' });
  }

  // Initialize or retrieve the conversation context from the session
  const sessionContext = req.session.context || [];

  // Add the new user prompt to the context
  sessionContext.push({ role: 'user', content: prompt });

  // Keep only the last two user prompts in the context
  const recentUserPrompts = sessionContext
    .filter(ctx => ctx.role === 'user')
    .slice(-2); // Get last two user prompts

  // Prepare payload with the last two user prompts and the new prompt
  const payload = {
    contents: [
      ...recentUserPrompts.map(ctx => ({
        parts: [{ text: ctx.content }],
        role: ctx.role
      })),
      {
        parts: [{ text: prompt }],
        role: 'user'
      }
    ]
  };

  console.log('Sending payload to Gemini API:', JSON.stringify(payload, null, 2));

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Gemini API response:', JSON.stringify(response.data, null, 2));

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0] &&
      response.data.candidates[0].content.parts[0].text
    ) {
      const message = response.data.candidates[0].content.parts[0].text;

      // Add the bot's response to the conversation context
      sessionContext.push({ role: 'bot', content: message });
      req.session.context = sessionContext;

      res.json({ message });
    } else {
      res.status(500).json({ error: 'Unexpected API response structure', details: response.data });
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    if (error.response) {
      console.error('API Error Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('API Error Response Status:', error.response.status);
      console.error('API Error Response Headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.request) {
      console.error('API Error Request Data:', JSON.stringify(error.request, null, 2));
    } else {
      console.error('API Error Message:', error.message);
    }
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
