var mongoose = require("mongoose");
const joi = require("@hapi/joi");

var expenseSchema = mongoose.Schema({
  product_name: String,
  id: String,
  tenant_id: String,
  travellingExpense: Number,
  labourExpense: Number,
  date: String,
  time: String,
  description: String,
});
function validateExpense(data) {
  const schema = joi.object({
    product_name: joi.string().min(2).max(10).required(),
    id: joi.string().required(),
    travellingExpense: joi.required(),
    description: joi.required(),
    labourExpense: joi.required(),
    date: joi.string().required(),
    time: joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
}
const Expense = mongoose.model("Expense", expenseSchema);

module.exports.expense = Expense;
module.exports.validate = validateExpense;
