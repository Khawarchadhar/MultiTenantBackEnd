var mongoose = require("mongoose");

var categorySchema = mongoose.Schema({
  id: String,
  name: String,
  tenant_id:String
});

const Category = mongoose.model("Category", categorySchema);

module.exports.category = Category;
