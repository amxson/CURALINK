const express = require("express");
const auth = require("../middleware/auth");
const appointmentController = require("../controllers/appointmentController");
const {
  countAllAppointments,
  countCompletedAppointments,
} = require('../controllers/appointmentController');

const appointRouter = express.Router();

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

appointRouter.put("/completed", auth, appointmentController.completed);
appointRouter.get('/count/total', countAllAppointments);
appointRouter.get('/count/completed', countCompletedAppointments);

module.exports = appointRouter;
