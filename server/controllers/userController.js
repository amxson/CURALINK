const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Fetch a single user by ID
const getuser = async (req, res) => {
  try {
    console.log("Fetching user with ID:", req.params.id); // Debugging line
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      console.error("User not found"); // Debugging line
      return res.status(404).send("User not found");
    }
    return res.send(user);
  } catch (error) {
    console.error("Error fetching user:", error); // Debugging line
    res.status(500).send("Unable to get user");
  }
};

// Fetch all users except the currently logged-in user
const getallusers = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      console.error("User not authenticated"); // Debugging line
      return res.status(401).send("User not authenticated");
    }

    const users = await User.find({ _id: { $ne: req.user.userId } }).select("-password");
    return res.send(users);
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).send("Unable to get all users");
  }
};


// User login
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("Attempting login with email:", email); // Debugging line

    const user = await User.findOne({ email });
    if (!user) {
      console.error("Email does not exist"); // Debugging line
      return res.status(400).send("Email does not exist");
    }

    // Check if the role matches
    if (user.role !== role) {
      console.error("Role mismatch"); // Debugging line
      return res.status(400).send("Role mismatch");
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error("Incorrect password"); // Debugging line
      return res.status(400).send("Incorrect password");
    }

    // Generate JWT token after successful login
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "2d" } // Changed to 2 days
    );

    return res.status(200).send({ msg: "User logged in successfully", token });
  } catch (error) {
    console.error("Error logging in user:", error); // Debugging line
    res.status(500).send("Unable to login user");
  }
};


const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname, role, pic } = req.body;
    console.log("Attempting registration with email:", email); // Debugging line

    // Validate input fields
    if (!email || !password || !firstname || !lastname || !role) {
      console.error("Registration error: Missing fields"); // Debugging line
      return res.status(400).send("All fields are required");
    }

    // Check for existing email
    const emailPresent = await User.findOne({ email });
    if (emailPresent) {
      console.error("Email already exists"); // Debugging line
      return res.status(409).send("Email already exists"); // Use 409 Conflict
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      password: hashedPass,
      role,
      pic
    });

    // Save user to database
    const result = await newUser.save();
    if (!result) {
      console.error("Unable to register user"); // Debugging line
      return res.status(500).send("Unable to register user");
    }

    return res.status(201).send("User registered successfully");
  } catch (error) {
    console.error("Error registering user:", error); // Debugging line
    res.status(500).send("Unable to register user");
  }
};

// Update user profile
const updateprofile = async (req, res) => {
  try {
    const { password, ...updateFields } = req.body;
    let updateData = { ...updateFields };


    if (password) {
      const hashedPass = await bcrypt.hash(password, 10);
      updateData.password = hashedPass;
    }

    if (!req.user || !req.user.userId) {
      console.error("User not authenticated"); // Debugging line
      return res.status(401).send("User not authenticated");
    }

    console.log("Updating user profile with ID:", req.user.userId); // Debugging line
    const result = await User.findByIdAndUpdate(req.user.userId, updateData, { new: true });
    if (!result) {
      console.error("Unable to update user"); // Debugging line
      return res.status(500).send("Unable to update user");
    }
    return res.status(200).send("User updated successfully");
  } catch (error) {
    console.error("Error updating user profile:", error); // Debugging line
    res.status(500).send("Unable to update user");
  }
};

// Change user password
const changepassword = async (req, res) => {
  try {
    const { userId, currentPassword, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      console.error("Passwords do not match"); // Debugging line
      return res.status(400).send("Passwords do not match");
    }

    console.log("Changing password for user ID:", userId); // Debugging line
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found"); // Debugging line
      return res.status(404).send("User not found");
    }

    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      console.error("Incorrect current password"); // Debugging line
      return res.status(400).send("Incorrect current password");
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).send("Password changed successfully");
  } catch (error) {
    console.error("Error changing password:", error); // Debugging line
    return res.status(500).send("Internal Server Error");
  }
};

// Delete user and associated data
const deleteuser = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log("Deleting user with ID:", userId); // Debugging line

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      console.error("User not found"); // Debugging line
      return res.status(404).send("User not found");
    }

    await Doctor.findOneAndDelete({ userId });
    await Appointment.findOneAndDelete({ userId });

    return res.send("User deleted successfully");
  } catch (error) {
    console.error("Error deleting user:", error); // Debugging line
    res.status(500).send("Unable to delete user");
  }
};

// Handle forgot password request
const forgotpassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("Processing password reset for email:", email); // Debugging line
    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found"); // Debugging line
      return res.status(404).send("User not found");
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" }); // Changed to 1 hour

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Reset Password Link",
      text: `${process.env.CLIENT_URL}/resetpassword/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error); // Debugging line
        return res.status(500).send("Error sending email");
      } else {
        return res.status(200).send("Email sent successfully");
      }
    });
  } catch (error) {
    console.error("Error processing password reset:", error); // Debugging line
    return res.status(500).send("Internal Server Error");
  }
};


// Handle password reset
const resetpassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    console.log("Resetting password for user ID:", id); // Debugging line
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.error("Invalid or expired token:", err); // Debugging line
        return res.status(400).send("Invalid or expired token");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.findByIdAndUpdate(id, { password: hashedPassword });

      return res.status(200).send("Password reset successfully");
    });
  } catch (error) {
    console.error("Error resetting password:", error); // Debugging line
    return res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  getuser,
  getallusers,
  login,
  register,
  updateprofile,
  deleteuser,
  changepassword,
  forgotpassword,
  resetpassword,
};
