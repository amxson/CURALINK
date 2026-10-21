const express = require("express");
const doctorController = require("../controllers/doctorController");
const { auth, isAdmin } = require("../middleware/auth");

const doctorRouter = express.Router();

doctorRouter.get("/getalldoctors", doctorController.getalldoctors);

doctorRouter.get("/getnotdoctors", auth, isAdmin, doctorController.getnotdoctors);

doctorRouter.post("/applyfordoctor", auth, doctorController.applyfordoctor);

doctorRouter.put("/deletedoctor", auth, isAdmin, doctorController.deletedoctor);

doctorRouter.put("/acceptdoctor", auth, isAdmin, doctorController.acceptdoctor);

doctorRouter.put("/rejectdoctor", auth, isAdmin, doctorController.rejectdoctor);

module.exports = doctorRouter;
