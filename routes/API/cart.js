var express = require("express");
var router = express.Router();

let { cart } = require("../../models/cart");
var auth = require("../../middlewares/auth");
var owner = require("../../middlewares/owner");
const { response } = require("express");

/* Get All cart */
router.get("/", async function (req, res) {
  let Cart = await cart.find().populate("cartItems.product");
  return res.send(Cart);
});

/* Add to cart*/
router.post("/addtocart/:id/:t_id", async function (req, res) {
  var tenant = await cart.findOne ({tenant_id: req.params.t_id });
//console.log(tenant)
  if(tenant)
  {
  var User = await cart.findOne({ user: req.params.id ,tenant_id:req.params.t_id});
  console.log({tenant:User})
  if (User) {
    const Product = req.body.cartItems.product;
    const item = User.cartItems.find((c) => c.product == Product);
    console.log({items:item})
    if (item) {
      cart.findOneAndUpdate(
        { user: req.params.id, "cartItems.product": Product,tenant_id:req.params.t_id },
        {
          $set: {
            "cartItems.$": {
              ...req.body.cartItems,
              quantity: item.quantity + req.body.cartItems.quantity,
            },
          },
        },
        { new: true },
        (err, doc) => {
          if (err) {
            return res.status(500).send("Something wrong when updating data!");
          }
          return res.send("quantity updated successfully");
        }
      );
    } else {
      cart.findOneAndUpdate(
        { user: req.params.id },
        { $push: { cartItems: req.body.cartItems } },
        { new: true },
        (err, doc) => {
          if (err) {
            console.log("Something wrong when updating data!");
          }
        }
      );
      return res.send("cart updated successfully");
    }
  } else {
    let Cart = new cart();
    (Cart.user = req.params.id),
    (Cart.tenant_id = req.params.t_id), (Cart.cartItems = [req.body.cartItems]);

    await Cart.save();
    return res.json(Cart);
  }
}
else{

  let Carts = new cart();
    (Carts.user = req.params.id),
    (Carts.tenant_id = req.params.t_id), (Carts.cartItems = [req.body.cartItems]);
    await Carts.save();
    return res.json(Carts);
}
});

/* Get Single cart */
router.get("/:id", async function (req, res) {
  try {
    let Cart = await cart
      .findOne({ user: req.params.id })
      .populate("cartItems.product");
    if (!Cart)
      return res.status(400).send("Cart with given Id does not exist");
    console.log(Cart);
    return res.send(Cart);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Delete single item in cart */
router.delete("/:id/:ID", async function (req, res) {
  try {
    var User = await cart.findOne({ user: req.params.id });
    if (!User) return res.status(400).send("somethin went wrong");

    cart.findOneAndUpdate(
      { user: req.params.id },
      {
        $pull: {
          cartItems: { ...req.body.cartItems, product: req.params.ID },
        },
      },
      { new: true },
      (err, doc) => {
        if (err) {
          return res.status(500).send("Something wrong when updating data!");
        }
        return res.send("quantity updated successfully");
      }
    );
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Delete cart*/
router.delete("/:id", async function (req, res) {
  try {
    let Product = await product.findByIdAndDelete(req.params.id);
    if (!Product)
      return res.status(400).send("Product with given Id does not exists");
    return res.send(Product);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});
module.exports = router;
