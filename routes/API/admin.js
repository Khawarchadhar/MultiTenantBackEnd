const express = require("express");
let router = express.Router();
var bcrypt = require("bcryptjs");
const _ = require("lodash");
const config = require("config");
let { admin } = require("../../models/admin");
var jwt = require("jsonwebtoken");
var auth = require("../../middlewares/auth");
const validateadmin = require("../../middlewares/validateAdmin");
const mailgun = require("mailgun-js");
const mg = mailgun({
  apiKey: config.get("MAILGUN_APIKEY"),
  domain: config.get("Domain"),
});
const CodeGenerator = require("node-code-generator");
//login//

router.post("/login", async (req, res) => {
  try {
    let admins = await admin.findOne({ email: req.body.email });
    if (!admins)
      return res
        .status(400)
        .send({ message: "Admin with given Email does not exist" });
    let valid = await bcrypt.compare(req.body.password, admins.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid Admin or Password" });
    let token = jwt.sign(
      { _id: admins._id, email: admins.email, role: admins.role },
      config.get("jwtPrivateKey")
    );

    return res.json({ message: "Login Successfull", token, admins });
  } catch (err) {
    return res.status(400).json({ message: "Login Successfull" });
  }
});

//register//

router.post("/register", validateadmin, async (req, res) => {
  try {
    var Admin = await admin.findOne({ email: req.body.email });
    if (Admin)
      return res.status(400).send("Admin with given Email already exist");
    let admins = new admin();
    (admins.firstname = req.body.firstname),
      (admins.lastname = req.body.lastname),
      (admins.username = req.body.username);
    admins.email = req.body.email;
    admins.password = req.body.password;
    await admins.generateHashedPassword();
    if (req.body.confirmpassword == "")
      return res.status(400).send("please confirm password");
    if (req.body.password != req.body.confirmpassword)
      return res.status(400).send("password does not match");
    admins.address = req.body.address;
    admins.contact = req.body.contact;

    let token = jwt.sign(
      {
        firstname: admins.firstname,
        lastname: admins.lastname,
        username: admins.username,
        email: admins.email,
        password: admins.password,
        address: admins.address,
        contact: admins.contact,
        role: admins.role,
      },
      config.get("jwtPrivateKey"),
      { expiresIn: "20m" }
    );

    const url = `http://localhost:3000/tenantlogin/${token}`;
    const data = {
      from: "noreply@stockmanager.com",
      to: req.body.email,
      subject: "Account activation",
      html: `
            <h2>Click on the link to activate your account</h2>    
            <a href="${url}">${url}</a>
     `,
    };

    mg.messages().send(data, function (error, body) {
      if (error) {
        return res.json({
          error: error.message,
        });
      }
      return res.json({
        message:
          "Email activation code is sent to your email. Kindly check your email",
        token,
      });
    });
  } catch {
    return res.json({ message: "Something Went Wrong Please Try Again" });
  }
});

router.post("/ActivateAccount", async (req, res) => {
  try {
    const { token } = req.body;
    jwt.verify(
      token,
      config.get("jwtPrivateKey"),
      function (err, decodedToken) {
        if (err) {
          return res.status(400).send("Incorrect or Expired Link");
        }
        const {
          firstname,
          lastname,
          username,
          email,
          password,
          address,
          contact,
          role,
        } = decodedToken;
        console.log(decodedToken);
        admin.findOne({ email }).exec((err, Admin) => {
          if (Admin) {
            return res.status(400).send("Admin with given Email already exist");
          }
          let newAdmin = new admin({
            firstname,
            lastname,
            username,
            email,
            password,
            address,
            contact,
            role,
          });
          newAdmin.save();
          return res.send("Your account is acctivated");
        });
      }
    );
  } catch (err) {
    return res.status(400).send({ message: "Unsuccessfull activation" });
  }
});
router.put("/forgetPassword", async (req, res) => {
  try {
    const { email } = req.body;
    var Admins = await admin.findOne({ email: email });
    if (!Admins)
      return res
        .status(400)
        .json({ message: "Admin with Given email does not exists" });
    var generator = new CodeGenerator();
    var pattern = "######";
    var howMany = 1;
    // Generate an array of random unique codes according to the provided pattern:
    var codes = generator.generateCodes(pattern, howMany, { expiresIn: "50m" });
    const data = {
      from: "noreply@stockmanager.com",
      to: email,
      subject: "Password reset",
      html: `
          <h2>Your code for password reset is</h2>    
          <p>${codes}</p>
   `,
    };

    return Admins.updateOne({ resetLink: codes }, function (err, success) {
      if (err) {
        return res.status(400).json({ message: "incorrect or expired link" });
      } else {
        mg.messages().send(data, function (error, body) {
          if (error) {
            return res.json({
              error: error.message,
            });
          }
          return res.json({
            message:
              "A password reset code has been sent. Kindly check your email",
            codes,
          });
        });
      }
    });
  } catch (err) {
    return res
      .status(400)
      .json({ message: "Something went wrong please try again " });
  }
});
//reset password
router.put("/resetPassword", async (req, res) => {
  try {
    const { resetLink, newPass } = req.body;

    var Admins = await admin.findOne({ resetLink });
    if (!Admins)
      return res.status(400).json({ message: "incorrect or expired code" });
    const obj = {
      password: newPass,
    };
    console.log(obj);
    Admins = _.extend(Admins, obj);
    await Admins.generateHashedPassword();
    await Admins.save((err, result) => {
      if (err) {
        return res.status(400).json({ message: "password reset error" });
      } else {
        return res
          .status(200)
          .json({ message: "Password has been changed successfully" });
      }
    });
  } catch (err) {
    return res.status(400).send("Somethin Went Wrong please try again later");
  }
});

module.exports = router;
