const Notification = require("../models/notificationModel");

// Get all notifications for a user
const getallnotifs = async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.user.userId });
    return res.send(notifs);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).send("Unable to get all notifications");
  }
};

module.exports = {
  getallnotifs,
};
