const Joi = require('joi');

const allowedDomains = new Set([
  'gmail.com',
  'outlook.com',
  'outlook.co.id',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
]);

const allowedTestEmails = new Set(['demo@nutriai.local']);

const baseEmailSchema = Joi.string()
  .trim()
  .email({ tlds: { allow: true } })
  .custom((value, helpers) => {
    const normalized = value.toLowerCase();
    const domain = normalized.split('@')[1];
    if (!domain || !allowedDomains.has(domain)) {
      return helpers.error('any.invalid');
    }

    return value;
  }, 'domain allowlist');

const emailSchema = Joi.alternatives().try(
  Joi.string().trim().valid('demo@nutriai.local').insensitive(),
  baseEmailSchema
);

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).required(),
  email: emailSchema.required(),
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: emailSchema.required(),
  password: Joi.string().min(8).required(),
});

const profileUpdateSchema = Joi.object({
  email: emailSchema.required(),
  name: Joi.string().trim().min(2).required(),
  bio: Joi.string().trim().allow('', null),
  goal: Joi.string().trim().allow('', null),
  budget: Joi.number().integer().min(0).required(),
  age: Joi.number().integer().min(0).required(),
  weight: Joi.number().integer().min(0).required(),
  height: Joi.number().integer().min(0).required(),
  activity: Joi.string().trim().required(),
});

module.exports = {
  emailSchema,
  registerSchema,
  loginSchema,
  profileUpdateSchema,
};
