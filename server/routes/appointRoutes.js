const express = require("express");
const { auth, appointmentAccess } = require("../middleware/auth");
const appointmentController = require("../controllers/appointmentController");
const {
  countAllAppointments,
  countCompletedAppointments,
} = require('../controllers/appointmentController');

const appointRouter = express.Router();

// --- Existing routes ---
appointRouter.get(
  "/getallappointments",
  auth,
  appointmentController.getallappointments
);

appointRouter.post(
  "/bookappointment",
  auth,
  appointmentController.bookappointment
);

appointRouter.put("/completed", auth, appointmentAccess, appointmentController.completed);
appointRouter.get('/count/total', countAllAppointments);
appointRouter.get('/count/completed', countCompletedAppointments);

// --- NEW: OPD routes ---

// 1️⃣ Create OPD appointment
appointRouter.post("/opd/create", auth, appointmentController.createOPDAppointment);

// 2️⃣ Get OPD appointments (optional doctorId param)
appointRouter.get("/opd/:doctorId?", auth, appointmentController.getOPDAppointments);

// 3️⃣ Update OPD status
appointRouter.patch("/opd/status", auth, appointmentAccess, appointmentController.updateOPDStatus);


appointRouter.put("/status", auth, appointmentAccess, appointmentController.updateStatus);
appointRouter.delete("/discard", auth, appointmentAccess, appointmentController.deleteAppointment);

module.exports = appointRouter;
