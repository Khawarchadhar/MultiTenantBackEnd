var express = require("express");
var router = express.Router();
//var validateExpense= require('../../middlewares/validateExpense');
var { expense } = require("../../models/expense");
var auth = require("../../middlewares/auth");
var owner = require("../../middlewares/owner");

/* Get All Expenses w.r.t tenant*/
router.get("/tenant/:id", async function (req, res) {
  let expenses = await expense.find({ tenant_id: req.params.id });

  return res.send(expenses);
});

/* Get Single Expense */
router.get("/:id", async function (req, res) {
  try {
    let Expense = await expense.findById(req.params.id);
    if (!Expense)
      return res.status(400).send("Expense with given Id does not exists");
    console.log(Expense);
    return res.send(Expense);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Update Expense */
router.put("/:id", async function (req, res) {
  try {
    let Expense = await expense.findById(req.params.id);
    if (!Expense)
      return res.status(400).send("Expense with given Id does not exists");
    Expense.product_name = req.body.product_name;
    Expense.product_id = req.body.product_id;
    Expense.travellingExpense = req.body.travellingExpense;
    Expense.description = req.body.description;
    Expense.labourExpense = req.body.labourExpense;
    Expense.date = req.body.date;
    Expense.time = req.body.time;
    await Expense.save();
    return res.send(Expense);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* insert Expense */
router.post("/:id", async function (req, res) {
  //  try{
  let Expense = new expense();
  Expense.product_name = req.body.product_name;
  Expense.id = req.body.id;
  Expense.tenant_id = req.params.id;
  Expense.travellingExpense = req.body.travellingExpense;
  Expense.labourExpense = req.body.labourExpense;
  Expense.description = req.body.description;
  Expense.date = req.body.date;
  Expense.time = req.body.time;
  await Expense.save();
  return res.send(Expense);
  /*  }
       catch{
        return res.status(400).send('unsuccessfull atempt')
       }*/
});

/* Delete Expense */
router.delete("/:id", async function (req, res) {
  try {
    let Expense = await expense.findByIdAndDelete(req.params.id);
    if (!Expense)
      return res.status(400).send("Expense with given Id does not exists");
    return res.send(Expense);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

module.exports = router;
