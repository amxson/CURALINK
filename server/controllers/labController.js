const Lab = require("../models/labModel");
const Notification = require("../models/notificationModel");

// 1. Doctor requests a lab test
const requestLabTest = async (req, res) => {
  try {
    const { patientId, testName, category, description } = req.body;
    const doctorId = req.user.userId;

    const newTest = new Lab({
      patientId,
      doctorId,
      testName,
      category,
      description,
    });

    await newTest.save();

    // Notify Patient
    await new Notification({
      userId: patientId,
      content: `A new lab test (${testName}) has been requested for you.`,
    }).save();

    res.status(201).json({ message: "Lab test requested", newTest });
  } catch (error) {
    res.status(500).send("Error requesting lab test");
  }
};

const uploadLabResult = async (req, res) => {
  try {
    // We add resultFileName to the destructuring
    const { labId, testResult, resultFile, resultFileName } = req.body;
    const technicianId = req.user.userId;

    const updatedLab = await Lab.findByIdAndUpdate(
      labId,
      {
        testResult,
        resultFile,      // The Base64 String
        resultFileName,  // The original filename (e.g., "report.pdf")
        technicianId,
        status: "Ready"
      },
      { new: true }
    ).populate("doctorId patientId");

    if (!updatedLab) return res.status(404).send("Lab record not found");

    // Notifications
    await new Notification({
      userId: updatedLab.doctorId._id,
      content: `Lab results for ${updatedLab.patientId.firstname} (${updatedLab.testName}) are available.`,
    }).save();

    await new Notification({
      userId: updatedLab.patientId._id,
      content: `Your lab results for ${updatedLab.testName} are ready for download.`,
    }).save();

    res.status(200).json(updatedLab);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error uploading result");
  }
};

// --- NEW: Download Lab Report ---
const downloadLabReport = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab || !lab.resultFile) {
      return res.status(404).json({ message: "No file found for this report" });
    }

    if (req.user.role !== "Admin" && ![lab.patientId, lab.doctorId, lab.technicianId].some(id => String(id) === String(req.user.userId))) return res.status(403).send("Access denied");

    // Since it's a small chunk in MongoDB, we just send the Base64 and Name
    res.status(200).json({
      fileData: lab.resultFile,      // The actual string "data:image/png;base64..."
      fileName: lab.resultFileName || "report.pdf"
    });
  } catch (error) {
    res.status(500).send("Error retrieving file from database");
  }
};

// 3. Get Patient's Lab History
const getPatientLabs = async (req, res) => {
  try {
    const labs = await Lab.find({ patientId: req.params.patientId })
      .populate("doctorId", "firstname lastname")
      .sort({ createdAt: -1 });
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).send("Error fetching labs");
  }
};

const getDoctorOrderedLabs = async (req, res) => {
  try {
    const labs = await Lab.find({ doctorId: req.params.doctorId })
      .populate("patientId", "firstname lastname")
      .sort({ createdAt: -1 });
    res.status(200).json(labs);
  } catch (error) {
    res.status(500).send("Error fetching doctor's lab orders");
  }
};

module.exports = { requestLabTest, downloadLabReport, uploadLabResult, getPatientLabs, getDoctorOrderedLabs};
