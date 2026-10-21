const express = require("express");
const router = express.Router();
const { auth, isTechnician, isDoctor, ownRecord } = require("../middleware/auth");
const labController = require("../controllers/labController");

// --- DOCTOR ROUTES ---
// This was missing! It fixes the 404 on RequestLab.tsx
router.post("/request", auth, isDoctor, labController.requestLabTest);
router.get("/doctor-ordered/:doctorId", auth, isDoctor, ownRecord("doctorId"), labController.getDoctorOrderedLabs);

// --- PATIENT ROUTES ---
// This was missing! It fixes the 404 on Notifications.tsx
router.get("/patient/:patientId", auth, ownRecord("patientId"), labController.getPatientLabs);

router.get("/download/:id", auth, labController.downloadLabReport);


// --- TECHNICIAN ROUTES ---
router.get("/all-requests", auth, isTechnician, async (req, res) => {
  try {
    const Lab = require("../models/labModel");
    const requests = await Lab.find({ status: "Pending" })
      .populate("patientId", "firstname lastname")
      .populate("doctorId", "firstname lastname")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).send("Error fetching lab requests");
  }
});

router.put("/upload-result", auth, isTechnician, labController.uploadLabResult);

module.exports = router;
