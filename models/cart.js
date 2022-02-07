var mongoose = require("mongoose");

var cartSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  tenant_id: String,
  cartItems: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        default: "1",
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
});
const Cart = mongoose.model("Cart", cartSchema);
module.exports.cart = Cart;
