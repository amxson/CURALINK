const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require("../middleware/auth"); // Assuming you have authentication middleware

router.post('/createContact', auth, contactController.createContact);
router.get('/contactMessages', auth, contactController.getContactMessages); // Add this line
module.exports = router;
