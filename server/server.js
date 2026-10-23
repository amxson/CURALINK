const express = require("express");
const cors = require("cors");
const session = require("express-session");
require("dotenv").config();
require("./db/conn");

// 1. Official SDK Import
const { GoogleGenAI } = require("@google/genai");

const Doctor = require("./models/doctorModel");
const matchSpecializations = require("./utils/matchSpecializations");
const userRouter = require("./routes/userRoutes");
const doctorRouter = require("./routes/doctorRoutes");
const appointRouter = require("./routes/appointRoutes");
const contactroute = require("./routes/contactRoutes");
const notificationRouter = require("./routes/notificationRouter");
const prescriptionRoutes = require("./routes/prescriptionRoutes");


const app = express();
app.set("trust proxy", 1);
const port = process.env.PORT || 5000;

// 2. Initialize AI with your API Key
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

const specializations = [
  "General Practitioner", "Neurologist", "Cardiologist", "ENT Specialist",
  "Dermatologist", "Pediatrician", "Orthopedic Surgeon", "Gynecologist",
  "Psychiatrist", "Ophthalmologist", "Urologist", "Oncologist",
  "Endocrinologist", "Gastroenterologist", "Pulmonologist", "Rheumatologist",
  "Nephrologist", "Hematologist", "Anesthesiologist", "Emergency Medicine",
  "Pathologist", "Radiologist", "Plastic Surgeon", "Infectious Disease Specialist",
  "Physiotherapist",
];

/* ===========================
    MIDDLEWARE
=========================== */
app.use(cors({
  origin: ["http://localhost:3000", "https://curalink.vercel.app", process.env.CLIENT_URL].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET_KEY || require("crypto").randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === "production", sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", httpOnly: true },
}));

/* ===========================
    ROUTES
=========================== */
app.use("/api", async (req, res, next) => {
  if (req.path.startsWith("/chat")) return next();
  try { await require("./db/conn")(); next(); }
  catch { res.status(503).json({ message: "CuraLink database is temporarily unavailable. Please try again shortly." }); }
});
app.use("/api/user", userRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/appointment", appointRouter);
app.use("/api/notification", notificationRouter);
app.use("/api/contact", contactroute);
app.use("/api/lab", require("./routes/labRoutes"));
app.use("/api/prescription", prescriptionRoutes);


const SYSTEM_PROMPT = `
You are the CuraLink Healthcare Assistant.
AVAILABLE DEPARTMENTS: ${specializations.join(", ")}

RULES:
1. If symptoms are vague, ask 2-3 clarifying questions to act as a symptom checker.
2. Once symptoms are identified, suggest exactly ONE or TWO departments from the list above.
3. You MUST use the exact words from the list so the system can match doctors.
4. Inform the user they can book an appointment using the doctor cards appearing below.
5. Be professional, empathetic, and never provide specific drug prescriptions.
`;

/* ===========================
    SDK-BASED CHAT ROUTE
=========================== */
/* ===========================
    FIXED SDK-BASED CHAT ROUTE
=========================== */
app.post("/api/chat", async (req, res) => {
  const { prompt } = req.body;
  if (typeof prompt !== "string" || !prompt.trim()) return res.status(400).json({ error: "Prompt is required" });

  // 1. Emergency Check
  const emergencyKeywords = ["chest pain", "shortness of breath", "heart attack", "heavy bleeding", "unconscious"];
  if (emergencyKeywords.some(k => prompt.toLowerCase().includes(k))) {
    return res.json({
      message: "🚨 **EMERGENCY**: Please go to the nearest Emergency Room immediately or call emergency services.",
      doctors: []
    });
  }

  if (!req.session.chat) req.session.chat = [];

  try {
    if (!ai) return res.status(503).json({ message: "The CuraLink assistant is not configured yet.", doctors: [] });
    // 2. Prepare History for SDK
    const history = req.session.chat.slice(-6).map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // 3. Generate Content using Gemini 3 Flash
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "model", parts: [{ text: "Understood. I will help users find the right medical department." }] },
        ...history,
        { role: "user", parts: [{ text: prompt }] }
      ],
    });

    const aiReply = result.text;

    // Save to session history
    req.session.chat.push({ role: "user", content: prompt });
    req.session.chat.push({ role: "model", content: aiReply });

    // 4. Regex Matching Engine
    const combinedText = (aiReply + " " + prompt).toLowerCase();
    const matchedSpecs = matchSpecializations(combinedText, specializations);

    // 5. FETCH DOCTORS - UPDATED FOR NOTIFICATIONS
    const allDoctors = await Doctor.find({
      isDoctor: true,
      specialization: { $in: matchedSpecs }
    }).populate("userId");

    const doctorCards = allDoctors.filter(doc => doc.userId).map(doc => {
      // We must ensure the userId object is fully intact
      // because your notification logic likely calls: doctor.userId.firstname
      return {
        _id: doc._id.toString(), // Ensure ID is a string
        specialization: doc.specialization,
        fees: doc.fees,
        status: doc.status || "Approved",
        // NESTED USERID OBJECT: This is the key to fixing 'undefined'
        userId: {
          _id: doc.userId._id.toString(),
          firstname: doc.userId.firstname,
          lastname: doc.userId.lastname,
          email: doc.userId.email,
          pic: doc.userId.pic,
          role: doc.userId.role
        },
        // Frontend display helper
        name: `Dr. ${doc.userId.firstname} ${doc.userId.lastname}`,
        availableDates: Array.from({ length: 7 }, (_, i) => { const day = new Date(); day.setDate(day.getDate() + i + 1); return day.toISOString().slice(0, 10); }),
        availableTimes: ["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM"]
      };
    });

    return res.json({
      message: aiReply,
      doctors: doctorCards.slice(0, 4)
    });

  } catch (err) {
    console.error("Gemini SDK Error:", err);
    return res.status(500).json({
      message: "⚠️ AI service is currently unavailable.",
      doctors: []
    });
  }
});

/* ===========================
    CONTEXT MANAGEMENT
=========================== */
app.post("/api/chat/clear-context", (req, res) => {
  req.session.chat = [];
  res.json({ message: "Chat history cleared" });
});

app.get("/api/health", (req, res) => res.json({ service: "CuraLink", database: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected" }));

if (require.main === module) {
  app.listen(port, () => console.log(`CuraLink server is running on port ${port}`));
}
module.exports = app;
