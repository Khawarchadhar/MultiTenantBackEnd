const express = require("express");
let router = express.Router();
var bcrypt = require("bcryptjs");
const _ = require("lodash");
const config = require("config");
let { user } = require("../../models/users");
var jwt = require("jsonwebtoken");
var auth = require("../../middlewares/auth");
const validateusers = require("../../middlewares/validateUser");
const mailgun = require("mailgun-js");
const CodeGenerator = require("node-code-generator");
const mg = mailgun({
  apiKey: config.get("MAILGUN_APIKEY"),
  domain: config.get("Domain"),
});

/* Get All Users */
router.get("/", async function (req, res) {
  let User = await user.find();

  return res.send(User);
});

//login//

router.post("/login", async (req, res) => {
  try {
    let users = await user.findOne({ email: req.body.email });
    if (!users)
      return res
        .status(400)
        .send({ message: "User with given Email does not exist" });
    let status = await user.findOne({
      email: req.body.email,
      ActivationStatus: true,
    });
    if (!status)
      return res.status(400).send({ message: "your account is deactivated " });
    let valid = await bcrypt.compare(req.body.password, users.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid User or Password" });
    let token = jwt.sign(
      { _id: users._id, email: users.email, role: users.role },
      config.get("jwtPrivateKey")
    );

    return res.json({ message: "Login Successfull", token, users });
  } catch (err) {
    return res.status(400).json({ message: "Login Successfull" });
  }
});

//register//

router.post("/register", validateusers, async (req, res) => {
  try {
    var Users = await user.findOne({ email: req.body.email });
    if (Users)
      return res.status(400).send("User with given Email already exist");
    let users = new user();
    (users.firstname = req.body.firstname),
      (users.lastname = req.body.lastname),
      (users.id = req.body.id);
    users.email = req.body.email;
    users.password = req.body.password;
    await users.generateHashedPassword();
    if (req.body.confirmpassword == "")
      return res.status(400).send("please confirm password");
    if (req.body.password != req.body.confirmpassword)
      return res.status(400).send("password does not match");
    users.address = req.body.address;
    users.contact = req.body.contact;
    users.country = req.body.country;
    users.province = req.body.province;
    users.city = req.body.city;
    users.zipcode = req.body.zipcode;

    let token = jwt.sign(
      {
        firstname: users.firstname,
        lastname: users.lastname,
        id: users.id,
        email: users.email,
        password: users.password,
        address: users.address,
        role: users.role,
        contact: users.contact,
        country: users.country,
        province: users.province,
        city: users.city,
        zipcode: users.zipcode,
      },
      config.get("jwtPrivateKey"),
      { expiresIn: "20m" }
    );

    const url = `http://localhost:3000/store/${token}`;
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
          id,
          email,
          password,
          address,
          role,
          contact,
          country,
          city,
          province,
          zipcode,
        } = decodedToken;
        console.log(decodedToken);
        user.findOne({ email }).exec((err, User) => {
          if (User) {
            return res.status(400).send("User with given Email already exist");
          }
          let newUser = new user({
            firstname,
            lastname,
            id,
            email,
            password,
            address,
            role,
            contact,
            country,
            city,
            province,
            zipcode,
          });
          newUser.save();
          return res.send("Your account is acctivated");
        });
      }
    );
  } catch (err) {
    return res.status(400).send({ message: "Unsuccessfull activation" });
  }
});

/*
router.put('/updateAddress/:id', async function(req, res) {
  var User = await user.findById(req.params.id);
 if(!User) return res.status(400).send('somethin went wrong');
 
user.updateOne({_id:User}, {$push:{address: req.body.address}}, {new: true}, (err, doc) => {
  if (err) {
   return res.send(err) 
  }
   return res.send('Address updated successfully');   
 });     
});


/* Delete Single Address */
/*
router.delete("/:id/:ID",async function(req, res){
  try
  {   
  var User = await user.findById(req.params.id);
  if(!User) return res.status(400).send('somethin went wrong');
  
 user.updateOne({_id:User}, {$pull:{address: {_id:req.params.ID}}}, {new: true}, (err, doc) => {
   if (err) {
    return res.send(err) 
   }
    return res.send('Address deleted successfully');   
  });     
}
  catch (err){
      return res.status(400).send('Invalid ID')
}
})*/

/* Forget Password */

router.put("/forgetPassword", async (req, res) => {
  // try{
  const { email } = req.body;
  var Users = await user.findOne({ email: email });
  if (!Users)
    return res
      .status(400)
      .json({ message: "User with Given Id does not exists" });
  var generator = new CodeGenerator();
  var pattern = "######";
  var howMany = 1;
  // Generate an array of random unique codes according to the provided pattern:
  var codes = generator.generateCodes(pattern, howMany, { expiresIn: "50m" });
  const data = {
    from: "noreply@hello.com",
    to: email,
    subject: "Password reset",
    html: `
          <h2>Your code for password reset is</h2>    
          <p>${codes}</p>
   `,
  };

  return Users.updateOne({ resetLink: codes }, function (err, success) {
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

  /*
}
catch(err){
return res.status(400).json({ message:"Unsuccessfull attempt"});
  }*/
});
//reset password
router.put("/resetPassword", async (req, res) => {
  // try{
  const { resetLink, newPass } = req.body;

  var Users = await user.findOne({ resetLink });
  if (!Users)
    return res.status(400).json({ message: "incorrect or expired code" });
  const obj = {
    password: newPass,
  };
  console.log(obj);
  Users = _.extend(Users, obj);
  await Users.generateHashedPassword();
  await Users.save((err, result) => {
    if (err) {
      return res.status(400).json({ message: "password reset error" });
    } else {
      return res
        .status(200)
        .json({ message: "Password has been changed successfully" });
    }
  });
  /* }
    catch{
      return res.json({message:'Something Went Wrong Please Try Again'})
    }*/
});

router.put("/deactivate/:id", async function (req, res) {
  var User = await user.findById(req.params.id);
  if (!User) return res.status(400).send("somethin went wrong");

  user.updateOne(
    { _id: User },
    { $set: { ActivationStatus: false } },
    { new: true },
    (err, doc) => {
      if (err) {
        return res.send(err);
      }
      return res.send("User deactivated successfully");
    }
  );
});

router.put("/Reactivate", async function (req, res) {
  var User = await user.findOne({ email: req.body.email });
  if (!User) return res.status(400).send("user do not exist");
  var User = await user.findOne({
    email: req.body.email,
    ActivationStatus: false,
  });
  if (!User) return res.status(400).send("user is already activated");

  user.updateOne(
    { email: req.body.email },
    { $set: { ActivationStatus: true } },
    { new: true },
    (err, doc) => {
      if (err) {
        return res.send(err);
      }
      return res.send("User Reactivated successfully");
    }
  );
});
module.exports = router;
