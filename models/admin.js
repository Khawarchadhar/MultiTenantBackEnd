var mongoose = require("mongoose");
const joi = require("@hapi/joi");
var bcrypt = require("bcryptjs");
const { boolean } = require("@hapi/joi");
var adminSchema = mongoose.Schema({
  firstname: String,
  lastname: String,
  username: String,
  email: String,
  password: String,
  confirmpassword: String,
  address: String,
  contact: String,
  role: {
    type: String,
    default: "admin",
  },
  ActivationStatus: {
    type: Boolean,
    default: true,
  },
  resetLink: {
    data: String,
    default: "",
  },
});

adminSchema.methods.generateHashedPassword = async function () {
  let salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
};

function validateAdmin(data) {
  const schema = joi.object({
    firstname: joi.string().min(2).max(10).required(),
    lastname: joi.string().min(2).max(10).required(),
    username: joi.string().min(2).max(10).required(),
    email: joi.string().email().required(),
    password: joi.string().min(2).max(10).required(),
    confirmpassword: joi.string().min(2).max(10).required(),
    address: joi.string().min(2).max(10).required(),
    contact: joi
      .string()
      .pattern(
        new RegExp(
          "^((\\+92)|(0092))-{0,1}\\d{3}-{0,1}\\d{7}$|^\\d{11}$|^d{4}-d{7}$"
        )
      )
      .required(),
  });
  return schema.validate(data, { abortEarly: false });
}

const Admin = mongoose.model("Admin", adminSchema);
module.exports.admin = Admin;
module.exports.validate = validateAdmin;
