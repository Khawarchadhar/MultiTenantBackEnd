var express = require("express");
var router = express.Router();
var { feedback } = require("../../models/feedback");
const { user } = require("../../models/users");
var validateFeedback = require("../../middlewares/validateFeedback");

/* Get All feedback */
router.get("/", async function (req, res) {
  let Feedback = await feedback.find();

  return res.send(Feedback);
});

/* Get Single Feedback */
router.get("/:id", async function (req, res) {
  try {
    let Feedback = await feedback.findById(req.params.id);
    if (!Feedback)
      return res.status(400).send("Feedback with given Id does not exists");
    console.log(Feedback);
    return res.send(Feedback);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Update Feedback */
router.put("/:id", async function (req, res) {
  try {
    let Feedback = await feedback.findById(req.params.id);
    if (!Feedback)
      return res.status(400).send("Feedback with given Id does not exists");
    Feedback.name = req.body.name;
    await Feedback.save();
    return res.send(Feedback);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* insert Feedback */
router.post("/:id", validateFeedback, async function (req, res) {
  try {
    var id = await user.findOne({ _id: req.params.id });
    if (!id) return res.status(400).send("user not found");
    console.log(id.email);
    var Email = await user.findOne({ email: req.body.email });
    if (!Email) return res.status(400).send("Email not found");
    console.log(Email.email);
    if (id.email == Email.email) {
      let Feedback = new feedback();
      Feedback.email = req.body.email;
      Feedback.id = req.body.id;
      Feedback.feedback = req.body.feedback;
      await Feedback.save();
      return res.send(Feedback);
    } else {
      return res.status(400).send("use your own email");
    }
  } catch {
    return res.send("something went wrong please try again");
  }
});

/* Delete Feedback */
router.delete("/:id", async function (req, res) {
  try {
    let Feedback = await feedback.findByIdAndDelete(req.params.id);
    if (!Feedback)
      return res.status(400).send("Feedback with given Id does not exists");
    return res.send(Feedback);
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});

/* Delete All Feedback */
router.delete("/", async function (req, res) {
  try {
    let Feedback = await feedback.remove({});
    return res.send("All records are deleted successfully");
  } catch (err) {
    return res.status(400).send("Invalid ID");
  }
});
module.exports = router;
