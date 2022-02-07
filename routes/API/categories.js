var express = require("express");
var router = express.Router();
var { category } = require("../../models/categories");

/* Get All categories w.r.t tenant*/
router.get("/:id", async function (req, res) {
  let Catogories = await category.find({ tenant_id: req.params.id });

  return res.send(Catogories);
});

/* Get Single Category */
router.get("/tenant/:id", async function (req, res) {
  try {
    let Category = await category.findById(req.params.id);
    if (!Category)
      return res.status(400).send("Category with given Id does not exists");
    console.log(Category);
    return res.send(Category);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Update Category */
router.put("/:id", async function (req, res) {
  try {
    let Category = await category.findById(req.params.id);
    if (!Category)
      return res.status(400).send("Category with given Id does not exists");
    Category.id = req.body.id;
    Category.name = req.body.name;

    await Category.save();
    return res.send(Category);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* insert Category */
router.post("/:id", async function (req, res) {
  let Categories = await category.findOne({ name: req.body.name });
  if (Categories)
    return res.status(400).send("category with this name already exist");
  let Category = new category();
  Category.id = req.body.id;
  Category.name = req.body.name;
  Category.tenant_id = req.params.id;
  await Category.save();
  return res.send(Category);
});

/* Delete Category */
router.delete("/:id", async function (req, res) {
  try {
    let Category = await category.findByIdAndDelete(req.params.id);
    if (!Category)
      return res.status(400).send("Category with given Id does not exists");
    return res.send(Category);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

module.exports = router;
