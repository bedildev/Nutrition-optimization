const Joi = require("joi");

const optimizeSchema = Joi.object({
  budget_maksimal: Joi.number().integer().min(0).required(),
  target_kalori: Joi.number().integer().min(0).required()
});

module.exports = { optimizeSchema };
