const Doctor = require("../models/doctorModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");
const Appointment = require("../models/appointmentModel");

// GET all doctors with pagination + search + auto filter broken chains
const getalldoctors = async (req, res) => {
  try {
    let { page = 1, limit = 50, specialization } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    // Filter: only doctors, must have userId
    const filter = { isDoctor: true, userId: { $ne: null } };

    // Exclude current user
    if (req.user?.userId) {
      filter._id = { $ne: req.user.userId };
    }

    // Optional search by specialization
    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    // Total docs for pagination
    const total = await Doctor.countDocuments(filter);

    // Fetch doctors with populate
    const doctors = await Doctor.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "firstname lastname pic") // fetch pic too
      .select("specialization experience fees");

    // Filter out any broken populate chains
    const validDoctors = doctors.filter(doc => doc.userId);

    // Map and sanitize
    const sanitizedDoctors = validDoctors.map(doc => ({
      _id: doc._id,
      specialization: doc.specialization,
      experience: doc.experience,
      fees: doc.fees,
      userId: {
        _id: doc.userId?._id || null,
        firstname: doc.userId?.firstname || "Anonymous",
        lastname: doc.userId?.lastname || "",
        pic:
          doc.userId?.pic ||
          "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
      },
    }));

    return res.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      doctors: sanitizedDoctors,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return res.status(500).send("Unable to get doctors");
  }
};

// Other controllers remain the same (getnotdoctors, applyfordoctor, etc.)
const getnotdoctors = async (req, res) => {
  try {
    const filter = { isDoctor: false, _id: { $ne: req.user?.userId } };
    const users = await User.find(filter).select("firstname lastname pic");
    return res.send(users);
  } catch (error) {
    console.error("Error fetching non-doctors:", error);
    res.status(500).send("Unable to get non-doctors");
  }
};

const applyfordoctor = async (req, res) => {
  try {
    const alreadyFound = await Doctor.findOne({ userId: req.user.userId });
    if (alreadyFound) return res.status(400).send("Application already exists");

    const { specialization, experience, fees } = req.body;
    if (!specialization || !experience || !fees)
      return res.status(400).send("All fields are required");

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

const deletedoctor = async (req, res) => {
  try {
    const { userId } = req.body;
    await User.findByIdAndUpdate(userId, { isDoctor: false });
    await Doctor.findOneAndDelete({ userId });
    await Appointment.deleteMany({ userId });
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
