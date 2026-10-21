const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { auth, isAdmin } = require("../middleware/auth"); // Assuming you have authentication middleware

router.post('/createContact', auth, contactController.createContact);
router.get('/contactMessages', auth, isAdmin, contactController.getContactMessages); // Add this line
router.delete('/delete/:id', auth, isAdmin, async (req, res) => {
  try { const result = await require('../models/contact').findByIdAndDelete(req.params.id); if (!result) return res.status(404).send('Message not found'); res.json({message: 'Message deleted'}); }
  catch { res.status(500).send('Unable to delete message'); }
});
module.exports = router;
