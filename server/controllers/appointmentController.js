const Appointment = require("../models/appointmentModel");
const Notification = require("../models/notificationModel");
const User = require("../models/userModel");

// Get all appointments with optional search
const getallappointments = async (req, res) => {
  try {
    const keyword = req.user.role !== "Admin"
      ? { $or: [{ userId: req.user.userId }, { doctorId: req.user.userId }] }
      : req.query.search
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

// --- OPD APPOINTMENTS ---

// 1️⃣ Create OPD appointment
const createOPDAppointment = async (req, res) => {
  try {
    const { date, time, doctorId, doctorname, opdType, roomNumber } = req.body;
    const userId = req.user.userId;

    const appointment = new Appointment({
      date,
      time,
      doctorId,
      userId,
      opdType,
      roomNumber,
    });

    // Notify user
    const usernotification = new Notification({
      userId,
      content: `You booked an OPD appointment with Dr. ${doctorname} for ${date} ${time}`,
    });
    await usernotification.save();

    // Notify doctor
    const user = await User.findById(userId);
    const doctornotification = new Notification({
      userId: doctorId,
      content: `You have an OPD appointment with ${user.firstname} ${user.lastname} on ${date} at ${time}`,
    });
    await doctornotification.save();

    const result = await appointment.save();
    return res.status(201).send(result);
  } catch (error) {
    console.error("Error booking OPD appointment:", error);
    res.status(500).send("Unable to book OPD appointment");
  }
};

// 2️⃣ Get OPD appointments
const getOPDAppointments = async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    let filter = { opdType: { $exists: true } }; // only OPD appointments

    if (doctorId && req.user.role !== "Admin" && String(doctorId) !== String(req.user.userId)) return res.status(403).send("Access denied");
    if (doctorId) filter.doctorId = doctorId;
    else filter.userId = req.user.userId;

    const appointments = await Appointment.find(filter)
      .populate("doctorId")
      .populate("userId");

    return res.send(appointments);
  } catch (error) {
    console.error("Error fetching OPD appointments:", error);
    res.status(500).send("Unable to get OPD appointments");
  }
};

// 3️⃣ Update OPD status
const updateOPDStatus = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    ).populate("doctorId userId");

    if (!appointment) return res.status(404).send("Appointment not found");

    // Notify user and doctor
    const usernotification = new Notification({
      userId: appointment.userId,
      content: `Your OPD appointment with Dr. ${appointment.doctorId.firstname} ${appointment.doctorId.lastname} is now ${status}`,
    });
    await usernotification.save();

    const doctornotification = new Notification({
      userId: appointment.doctorId,
      content: `OPD appointment with ${appointment.userId.firstname} ${appointment.userId.lastname} is now ${status}`,
    });
    await doctornotification.save();

    return res.send(appointment);
  } catch (error) {
    console.error("Error updating OPD status:", error);
    res.status(500).send("Unable to update OPD appointment status");
  }
};

// Add these to your appointmentController.js

// Update Appointment Status (Accept, Cancel, etc.)
const updateStatus = async (req, res) => {
  try {
    const { appointid, status } = req.body; // status: "Accepted" | "Cancelled" | "Completed"
    const userId = req.user.userId;

    const appointment = await Appointment.findByIdAndUpdate(
      appointid,
      { status },
      { new: true }
    ).populate("userId doctorId");

    if (!appointment) return res.status(404).send("Appointment not found");


    const content = `Your appointment with Dr. ${appointment.doctorId.firstname} is now ${status}`;
    const usernotification = new Notification({
      userId: appointment.userId._id,
      content: content,
    });
    await usernotification.save();

    return res.status(200).send(`Appointment ${status}`);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).send("Unable to update appointment");
  }
};


const deleteAppointment = async (req, res) => {
  try {
    const { appointid } = req.body;
    await Appointment.findByIdAndDelete(appointid);
    return res.status(200).send("Appointment discarded successfully");
  } catch (error) {
    res.status(500).send("Unable to discard appointment");
  }
};




module.exports = {
  getallappointments,
  bookappointment,
  countAllAppointments,
  countCompletedAppointments,
  completed,

  // OPD functions

  createOPDAppointment,
  getOPDAppointments,
  updateOPDStatus,

  updateStatus,
  deleteAppointment,
};
