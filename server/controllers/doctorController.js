const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Appointment = require("../models/appointmentModel");

// Get all doctors or exclude the current user if authenticated
const getalldoctors = async (req, res) => {
  try {
    const filter = req.user ? { _id: { $ne: req.user.userId }, isDoctor: true } : { isDoctor: true };
    const docs = await Doctor.find(filter).populate("userId");
    return res.send(docs);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).send("Unable to get doctors");
  }
};

// Get all non-doctor users, excluding the current user if authenticated
const getnotdoctors = async (req, res) => {
  try {
    const filter = { isDoctor: false, _id: { $ne: req.user.userId } };
    const docs = await Doctor.find(filter).populate("userId");
    return res.send(docs);
  } catch (error) {
    console.error("Error fetching non-doctors:", error);
    res.status(500).send("Unable to get non-doctors");
  }
};

const applyfordoctor = async (req, res) => {
  try {
    // Check if the application already exists
    const alreadyFound = await Doctor.findOne({ userId: req.user.userId });
    if (alreadyFound) {
      return res.status(400).send("Application already exists");
    }

    // Destructure the fields from req.body
    const { specialization, experience, fees } = req.body;

    // Validate the required fields
    if (!specialization || !experience || !fees) {
      return res.status(400).send("All fields are required");
    }

    // Create a new Doctor instance and save it
    const doctor = new Doctor({
      specialization,
      experience,
      fees,
      userId: req.user.userId,
    });
    await doctor.save();

    return res.status(201).send("Application submitted successfully");
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).send("Unable to submit application");
  }
};


// Accept doctor application
const acceptdoctor = async (req, res) => {
  try {
    const { id } = req.body;

    await User.findByIdAndUpdate(id, { isDoctor: true, status: "accepted" });
    await Doctor.findOneAndUpdate({ userId: id }, { isDoctor: true });

    const notification = new Notification({
      userId: id,
      content: "Congratulations, Your application has been accepted.",
    });
    await notification.save();

    return res.status(201).send("Application accepted notification sent");
  } catch (error) {
    console.error("Error accepting doctor application:", error);
    res.status(500).send("Error while sending notification");
  }
};

// Reject doctor application
const rejectdoctor = async (req, res) => {
  try {
    const { id } = req.body;

    await User.findByIdAndUpdate(id, { isDoctor: false, status: "rejected" });
    await Doctor.findOneAndDelete({ userId: id });

    const notification = new Notification({
      userId: id,
      content: "Sorry, Your application has been rejected.",
    });
    await notification.save();

    return res.status(201).send("Application rejection notification sent");
  } catch (error) {
    console.error("Error rejecting doctor application:", error);
    res.status(500).send("Error while rejecting application");
  }
};

// Delete doctor and associated data
const deletedoctor = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, { isDoctor: false });
    await Doctor.findOneAndDelete({ userId });
    await Appointment.findOneAndDelete({ userId });

    return res.send("Doctor deleted successfully");
  } catch (error) {
    console.error("Error deleting doctor:", error);
    res.status(500).send("Unable to delete doctor");
  }
};

module.exports = {
  getalldoctors,
  getnotdoctors,
  applyfordoctor,
  acceptdoctor,
  rejectdoctor,
  deletedoctor,
};
