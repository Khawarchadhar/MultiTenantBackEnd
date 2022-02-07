var express = require("express");
var router = express.Router();
var validateProduct = require("../../middlewares/validateProduct");
var { product } = require("../../models/products");
var { category } = require("../../models/categories");
var auth = require("../../middlewares/auth");
var owner = require("../../middlewares/owner");
var multer = require("multer");

const shortid = require("shortid");
const { tenant } = require("../../models/tenants");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, shortid.generate() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

/* Get All Products */
router.get("/", async function (req, res) {
  let products = await product.find().populate("category");

  return res.send(products);
});

/* Get Single Product */
router.get("/:id", async function (req, res) {
  try {
    let Product = await product.findById(req.params.id);
    if (!Product)
      return res.status(400).send("Product with given Id does not exists");
    console.log(Product);
    return res.send(Product);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

router.get("/tenant/:id", async function (req, res) {
  try {
    let Product = await product.find({ Tenant_id: req.params.id });
    if (!Product)
      return res.status(400).send("Product with given Id does not exists");
    console.log(Product);
    return res.send(Product);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Update product*/
router.put(
  "/:id",
  upload.single("image"),
  validateProduct,
  async function (req, res) {
    try {
      let Product = await product.findById(req.params.id);
      if (!Product)
        return res.status(400).send("Product with given Id does not exists");
      Product.Tenant_id = req.body.Tenant_id;
      Product.name = req.body.name;
      Product.price = req.body.price;
      Product.category = req.body.category;
      Product.color = req.body.color;
      Product.picture = req.file?.filename;
      Product.stock = req.body.stock;
      Product.id = req.body.id;
      Product.description = req.body.description;
      Product.date = req.body.date;
      Product.time = req.body.time;

      await Product.save();
      return res.send(Product);
    } catch (err) {
      return res.status(400).send("Invalid ID");
    }
  }
);

/* Add Product */
router.post("/", upload.single("image"), async function (req, res) {
  // try {
  let Category = await category.findOne({ name: req.body.category });
  if (!Category)
    return res.status(400).send("category with this name does not exist");
  console.log(req.file);
  console.log(req.body);
  let Tenant = await tenant.find({ "Tenant.Tenant_id": "req.body.Tenant_id" });
  if (!Tenant) return res.status(400).send("Tenant not found");
  let Product = new product();
  Product.Tenant_id = req.body.Tenant_id;
  Product.name = req.body.name;
  Product.price = req.body.price;
  Product.category = req.body.category;
  Product.color = req.body.color;
  Product.picture = req.file?.filename;
  Product.stock = req.body.stock;
  Product.id = req.body.id;
  Product.description = req.body.description;
  Product.date = req.body.date;
  Product.time = req.body.time;
  await Product.save();

  return res.send(Product);
  /* } catch {
    return res.status(400).send("unsuccessfull atempt");
  }*/
});

/* Delete Product */
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
