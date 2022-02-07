var mongoose = require("mongoose");
const joi = require("@hapi/joi");

var productSchema = mongoose.Schema({
  Tenant_id: {
    type: String,
    required: true,
  },
  name: String,
  price: Number,
  color: String,
  stock: Number,
  description: String,
  date: String,
  time: String,
  id: String,

  category: {
    type: String,

    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
});
function validateProduct(data) {
  const schema = joi.object({
    Tenant_id: joi.required(),
    category: joi.required(),
    id: joi.required(),
    name: joi.string().min(2).max(20).required(),
    color: joi.string().min(2).max(20).required(),
    description: joi.string().min(2).max(400).required(),
    stock: joi.number().min(2).max(10).required(),
    price: joi.number().min(2).max(10).required(),
    date: joi.string().required(),
    time: joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
}
const Product = mongoose.model("Product", productSchema);

module.exports.product = Product;
module.exports.validate = validateProduct;
