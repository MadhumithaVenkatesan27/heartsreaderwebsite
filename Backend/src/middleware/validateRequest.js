const mongoose = require("mongoose");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENCY_REGEX = /^[A-Z]{3}$/;

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const asString = (value) => (typeof value === "string" ? value.trim() : "");

const addError = (errors, location, field, message) => {
  errors.push({ location, field, message });
};

const rules = {
  required:
    (message = "This field is required.") =>
    (value) =>
      value === undefined || value === null || value === "" ? message : null,

  string:
    ({ min = 0, max = 1000, required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      if (typeof value !== "string") return "Must be a string.";
      const clean = value.trim();
      if (clean.length < min) return `Must be at least ${min} characters.`;
      if (clean.length > max) return `Must be ${max} characters or fewer.`;
      return null;
    },

  email:
    ({ required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      const email = asString(value).toLowerCase();
      if (!email) return "Email is required.";
      if (email.length > 254 || !EMAIL_REGEX.test(email)) return "Enter a valid email address.";
      return null;
    },

  objectId:
    ({ required = true } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      return mongoose.isValidObjectId(String(value)) ? null : "Invalid identifier.";
    },

  slugOrObjectId:
    ({ required = true } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      const raw = asString(value);
      if (mongoose.isValidObjectId(raw)) return null;
      return /^[a-z0-9][a-z0-9-]{1,120}$/i.test(raw) ? null : "Invalid slug or identifier.";
    },

  chapterId:
    ({ required = true } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      const raw = asString(value);
      if (mongoose.isValidObjectId(raw)) return null;
      if (/^(?:ch|chapter|ep|episode)-?\d+$/i.test(raw)) return null;
      return raw.length >= 1 && raw.length <= 160 ? null : "Invalid chapter identifier.";
    },

  currency:
    ({ required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      const currency = asString(value).toUpperCase();
      return CURRENCY_REGEX.test(currency) ? null : "Currency must be a 3-letter code.";
    },

  number:
    ({ min = Number.NEGATIVE_INFINITY, max = Number.POSITIVE_INFINITY, required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      const num = Number(value);
      if (!Number.isFinite(num)) return "Must be a valid number.";
      if (num < min) return `Must be at least ${min}.`;
      if (num > max) return `Must be ${max} or less.`;
      return null;
    },

  enum:
    (allowed, { required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null || value === "") && !required) return null;
      return allowed.includes(value) ? null : `Must be one of: ${allowed.join(", ")}.`;
    },

  array:
    ({ min = 0, max = 50, required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null) && !required) return null;
      if (!Array.isArray(value)) return "Must be an array.";
      if (value.length < min) return `Must include at least ${min} item(s).`;
      if (value.length > max) return `Must include ${max} item(s) or fewer.`;
      return null;
    },

  object:
    ({ required = false } = {}) =>
    (value) => {
      if ((value === undefined || value === null) && !required) return null;
      return isPlainObject(value) ? null : "Must be an object.";
    },
};

const validateShape = (schema = {}, source, location, errors) => {
  Object.entries(schema).forEach(([field, validators]) => {
    const value = source?.[field];
    const list = Array.isArray(validators) ? validators : [validators];
    for (const validator of list) {
      const error = validator(value, source);
      if (error) {
        addError(errors, location, field, error);
        break;
      }
    }
  });
};

const validatePhysicalItems = (value) => {
  const list = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : value;
  const baseError = rules.array({ min: 1, max: 25, required: true })(list);
  if (baseError) return `Cart items ${baseError.charAt(0).toLowerCase()}${baseError.slice(1)}`;
  for (const [index, item] of list.entries()) {
    if (!isPlainObject(item)) return `Item ${index + 1} must be an object.`;
    if (!asString(item.sku || item.id)) return `Item ${index + 1} sku is required.`;
    if (!asString(item.title)) return `Item ${index + 1} title is required.`;
    const quantity = Number(item.quantity || 1);
    const price = Number(item.unitPrice ?? item.price ?? 0);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return `Item ${index + 1} quantity must be between 1 and 20.`;
    }
    if (!Number.isFinite(price) || price < 0.5 || price > 1000) {
      return `Item ${index + 1} price is invalid.`;
    }
  }
  return null;
};

const validateShippingAddress = (value) => {
  const baseError = rules.object({ required: true })(value);
  if (baseError) return baseError;
  const requiredFields = ["fullName", "phone", "line1", "city", "state", "postalCode", "country"];
  const missing = requiredFields.find((field) => !asString(value[field]));
  if (missing) return `Shipping ${missing} is required.`;
  if (value.email && rules.email()(value.email)) return "Shipping email is invalid.";
  return null;
};

const validateCampaignShippingAddress = (value, body) => {
  if (body?.tier !== "both") return null;
  const baseError = rules.object({ required: true })(value);
  if (baseError) return baseError;
  const requiredFields = ["fullName", "line1", "city", "country"];
  const missing = requiredFields.find((field) => !asString(value[field]));
  return missing ? `Shipping ${missing} is required.` : null;
};

const validateRequest = ({ body, params, query } = {}) => (req, res, next) => {
  const errors = [];
  validateShape(body, req.body, "body", errors);
  validateShape(params, req.params, "params", errors);
  validateShape(query, req.query, "query", errors);

  if (errors.length) {
    return res.status(400).json({
      status: "error",
      message: errors[0].message,
      errors,
    });
  }
  return next();
};

module.exports = {
  validateRequest,
  rules,
  validatePhysicalItems,
  validateShippingAddress,
  validateCampaignShippingAddress,
};
