const Contact = require('../models/contact'); // Ensure this path is correct

const createContact = async (req, res) => {
  try {
    // Extract data from the request body
    const { name, email, message } = req.body;


    // Create a new contact document
    const newContact = new Contact({
      userId:  req.user.userId, // Make sure req.user.id is set by the auth middleware
      name,
      email,
      message
    });

    // Save the document to the database
    await newContact.save();

    // Respond with success message
    res.status(201).json({ message: 'Contact message sent successfully!' });
  } catch (error) {

    // Respond with error message
    res.status(500).json({ error: `Failed to send contact message: ${error.message}` });
  }
};

const getContactMessages = async (req, res) => {
  try {
    // Sort by the `date` field in descending order (most recent first)
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch contact messages: ${error.message}` });
  }
};


module.exports = {
  createContact,
  getContactMessages // Export the new function
};
