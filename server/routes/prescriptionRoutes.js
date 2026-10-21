const express = require("express");
const router = express.Router();
const { createPrescription, getPatientPrescriptions } = require("../controllers/prescriptionController");
const { auth, isDoctor, ownRecord } = require("../middleware/auth");

router.post("/create", auth, isDoctor, createPrescription);
router.get("/patient/:userId", auth, ownRecord("userId"), getPatientPrescriptions);

module.exports = router;
