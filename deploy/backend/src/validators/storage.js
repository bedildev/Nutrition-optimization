const Joi = require('joi');
const { emailSchema } = require('./auth');

const savedMenuSchema = Joi.object({
  email: emailSchema.required(),
  menuId: Joi.alternatives().try(Joi.string().trim(), Joi.number()).required(),
});

const optimizerResultSchema = Joi.object({
  email: emailSchema.required(),
  result: Joi.object().required(),
});

module.exports = {
  savedMenuSchema,
  optimizerResultSchema,
};
