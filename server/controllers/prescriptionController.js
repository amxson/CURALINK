const Prescription = require("../models/prescriptionModel");

const createPrescription = async (req, res) => {
  try {
    const { userId, appointmentId, medicines } = req.body;

    // Check all possible places the ID might be stored in the token payload
    const doctorId = req.user?._id || req.user?.id || req.user?.userId;

    if (!doctorId) {
      // This log will show you exactly what is inside req.user in your terminal
      console.log("Current req.user content:", req.user);
      return res.status(401).json({ message: "Doctor ID not found in token payload" });
    }

    const newPrescription = new Prescription({
      userId,
      doctorId,
      appointmentId,
      medicines,
    });

    await newPrescription.save();
    res.status(201).json({ message: "Prescription sent to patient successfully" });
  } catch (error) {
    console.error("Prescription Save Error:", error);
    res.status(500).json({ message: "Error saving prescription", error: error.message });
  }
};

const getPatientPrescriptions = async (req, res) => {
  try {
    const { userId } = req.params;
    const prescriptions = await Prescription.find({ userId })
      .populate("doctorId", "firstname lastname")
      .sort({ createdAt: -1 });
    res.status(200).json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching prescriptions" });
  }
};

module.exports = { createPrescription, getPatientPrescriptions };
