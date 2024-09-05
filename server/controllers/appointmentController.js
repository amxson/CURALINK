const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

// Get all appointments with optional search
const getallappointments = async (req, res) => {
  try {
    const keyword = req.query.search
      ? { $or: [{ userId: req.query.search }, { doctorId: req.query.search }] }
      : {};

    const appointments = await Appointment.find(keyword)
      .populate("doctorId")
      .populate("userId");
    return res.send(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).send("Unable to get appointments");
  }
};

// Book a new appointment
const bookappointment = async (req, res) => {
  try {
    const { date, time, doctorId, doctorname } = req.body;
    const userId = req.user.userId;

    const appointment = new Appointment({
      date,
      time,
      doctorId,
      userId,
    });

    const usernotification = new Notification({
      userId,
      content: `You booked an appointment with Dr. ${doctorname} for ${date} ${time}`,
    });
    await usernotification.save();

    const user = await User.findById(userId);
    const doctornotification = new Notification({
      userId: doctorId,
      content: `You have an appointment with ${user.firstname} ${user.lastname} on ${date} at ${time}`,
    });
    await doctornotification.save();

    const result = await appointment.save();
    return res.status(201).send(result);
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).send("Unable to book appointment");
  }
};

// Mark appointment as completed
const completed = async (req, res) => {
  try {
    const { appointid, doctorname, doctorId } = req.body;
    const userId = req.user.userId;

    await Appointment.findByIdAndUpdate(appointid, { status: "Completed" });

    const usernotification = new Notification({
      userId,
      content: `Your appointment with ${doctorname} has been completed`,
    });
    await usernotification.save();

    const user = await User.findById(userId);
    const doctornotification = new Notification({
      userId: doctorId,
      content: `Your appointment with ${user.firstname} ${user.lastname} has been completed`,
    });
    await doctornotification.save();

    return res.status(201).send("Appointment completed");
  } catch (error) {
    console.error("Error completing appointment:", error);
    res.status(500).send("Unable to complete appointment");
  }
};

// Count all appointments
const countAllAppointments = async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    return res.json({ totalAppointments });
  } catch (error) {
    console.error("Error counting appointments:", error);
    res.status(500).send("Unable to count appointments");
  }
};

// Count completed appointments
const countCompletedAppointments = async (req, res) => {
  try {
    const completedAppointments = await Appointment.countDocuments({ status: "Completed" });
    return res.json({ completedAppointments });
  } catch (error) {
    console.error("Error counting completed appointments:", error);
    res.status(500).send("Unable to count completed appointments");
  }
};


module.exports = {
  getallappointments,
  bookappointment,
  countAllAppointments,
  countCompletedAppointments,
  completed,
};
