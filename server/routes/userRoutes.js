const express = require("express");
const { auth, isAdmin } = require("../middleware/auth");
const userController = require("../controllers/userController");
const userRouter = express.Router();

console.log("Checking getuser function:", typeof userController.getuser);

userRouter.get("/getuser/:id", auth, (req, res) => userController.getuser(req, res));
userRouter.get("/getallusers", auth, (req, res) => userController.getallusers(req, res));
userRouter.post("/login", (req, res) => userController.login(req, res));
userRouter.post("/register", (req, res) => userController.register(req, res));
userRouter.post("/forgotpassword", (req, res) => userController.forgotpassword(req, res));
userRouter.post("/resetpassword/:id/:token", (req, res) => userController.resetpassword(req, res));
userRouter.put("/updateprofile", auth, (req, res) => userController.updateprofile(req, res));
userRouter.put("/changepassword", auth, (req, res) => userController.changepassword(req, res));
userRouter.post("/add-staff", auth, isAdmin, (req, res) => userController.addStaff(req, res));
userRouter.delete("/deleteuser", auth, isAdmin, (req, res) => userController.deleteuser(req, res));

module.exports = userRouter;
