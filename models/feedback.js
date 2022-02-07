var mongoose = require("mongoose");
const joi = require("@hapi/joi");

var feedbackSchema = mongoose.Schema({
  id: String,
  email: {
    type: String,
    required: true,
  },
  feedback: String,
});

function validateFeedback(data) {
  const schema = joi.object({
    email: joi.string().required(),
    id: joi.string().required(),
    feedback: joi.string().min(10).required(),
  });
  return schema.validate(data, { abortEarly: false });
}

const Feedback = mongoose.model("Feedback", feedbackSchema);
module.exports.validate = validateFeedback;

module.exports.feedback = Feedback;
