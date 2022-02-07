var express = require("express");
var router = express.Router();
var { manualOrder } = require("../../models/manualOrder");
const { user } = require("../../models/users");
const { cart } = require("../../models/cart");
const { tenant } = require("../../models/tenants");
const { product } = require("../../models/products");

/* Get All Manualorders */
router.get("/", async function (req, res) {
  let orders = await order.find().populate("user_id").populate("items.product");

  return res.send(orders);
});

/* Get Manual oders w.r.t tenant*/
router.get("/tenant/:id", async function (req, res) {
  let orders = await manualOrder
    .find({ tenant_id: req.params.id })
    .populate("items.product");

  return res.send(orders);
});

/* Get Sales of Manual Order w.r.t tenant */
router.get("/ManualOrderSales/:id", async function (req, res) {
  let sales = await manualOrder
    .find({ OrderStatus: "Completed", tenant_id: req.params.id })
    .populate("items.product");
  return res.send(sales);
});

/* Place Manual Order */
router.post("/ManualOrder/:id/", async function (req, res) {
  let User = await tenant.findOne({ tenant_id: req.params.id });
  if (!User)
    return res.status(400).send("Tenant with given Id does not exists");
  req.body.items.forEach(async (o) => {
    await FindProduct(o.product);
  });
  async function FindProduct(ID) {
    let Product = await product.findOne({ id: ID });
    if (!Product)
      return res.status(400).send("Product with given Id does not exists");
    console.log(Product);
  }
  let Order = await manualOrder.insertMany(req.body);

  return res.send({
    message: "Your order has been placed successfully",
    Order,
  });
});

/* Deliver Manual Order */
router.put("/:id", async function (req, res) {
  // try {
  manualOrder.findByIdAndUpdate(
    req.params.id,
    { $set: { OrderStatus: "Completed" } },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log("Something wrong when updating data!");
      }
    }
  );
  let Order = await manualOrder.findById(req.params.id);
  if (!Order) return res.status(400).send("user with given Id does not exists");
  Order.items.forEach(async (o) => {
    await updateStock(o.product, o.quantity);
  });
  async function updateStock(ID, quantity) {
    let Product = await product.findOne({ id: ID });
    Product.stock -= quantity;
    await Product.save({ validateBeforeSave: false });
    console.log(Product);
  }

  return res.send("Order Status has been updated successfully");
  /* } catch (err) {
    return res.status(400).send("Invalid ID");
  }*/
});

module.exports = router;
