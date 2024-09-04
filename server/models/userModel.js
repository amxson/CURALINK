const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      minLength: 3,
    },
    lastname: {
      type: String,
      required: true,
      minLength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // Ensure email is stored in lowercase
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 5,
    },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "Doctor", "Patient"],
    },
    age: {
      type: Number,
      default: null, // Use null for default if the value is optional
    },
    gender: {
      type: String,
      default: "",
    },
    mobile: {
      type: String, // Change to String to handle international formats
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      default: "",
    },
    pic: {
      type: String,
      default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
