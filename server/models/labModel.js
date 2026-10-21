const mongoose = require("mongoose");

const labSchema = mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      default: () => `LAB-${Math.floor(1000 + Math.random() * 9000)}`,
    },
    patientId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
      required: true,
    },
    testName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Blood Work", "Imaging", "Scan", "Urine Test", "Other"],
      default: "Blood Work",
    },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Ready", "Collected"],
      default: "Pending",
    },
    testResult: {
      type: String,
    },
    resultFile: {
      type: String, // We will store the full Base64 string here (e.g., "data:application/pdf;base64,...")
    },
    // ADD THIS: Helps the browser know what to call the file when downloading
    resultFileName: {
      type: String,
    },
    technicianId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lab", labSchema);
