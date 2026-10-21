const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check if the header even exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("No token provided or invalid format");
    }

    // 2. Safe extraction
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).send("Token missing");
    }

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!verifyToken) {
      return res.status(401).send("Token error");
    }

    req.user = verifyToken;
    next();
  } catch (error) {
    console.log("Auth Middleware Error:", error.message);
    return res.status(401).send("Authentication error");
  }
};

// NEW: Role-based check
const isAdmin = (req, res, next) => {
  if (req.user.role === "Admin") next();
  else res.status(403).send("Access denied. Admins only.");
};

const isTechnician = (req, res, next) => {
  if (req.user.role === "Technician" || req.user.role === "Admin") next();
  else res.status(403).send("Access denied. Laboratory staff only.");
};


const isDoctor = (req, res, next) => ["Doctor", "Admin"].includes(req.user.role) ? next() : res.status(403).send("Doctors only");
const ownRecord = (param) => (req, res, next) => req.user.role === "Admin" || req.user.role === "Doctor" || String(req.params[param]) === String(req.user.userId) ? next() : res.status(403).send("Access denied");
const appointmentAccess = async (req, res, next) => {
  try {
    const id = req.body.appointid || req.body.appointmentId;
    if (!require("mongoose").isValidObjectId(id)) return res.status(400).send("Valid appointment ID required");
    const appointment = await require("../models/appointmentModel").findById(id);
    if (!appointment) return res.status(404).send("Appointment not found");
    if (req.user.role !== "Admin" && ![appointment.userId, appointment.doctorId].some(value => String(value) === String(req.user.userId))) return res.status(403).send("Access denied");
    if (req.body.status && !["Pending", "Accepted", "Cancelled", "Completed"].includes(req.body.status)) return res.status(400).send("Invalid appointment status");
    next();
  } catch { res.status(500).send("Unable to check appointment"); }
};
module.exports = { auth, isAdmin, isTechnician, isDoctor, ownRecord, appointmentAccess };
