const express = require('express');
const router = express.Router();
const Contact = require('../models/contact'); // Ensure this path is correct

// Route to get all contact messages
router.get('/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: `Failed to retrieve contact messages: ${error.message}` });
  }
});

module.exports = router;
