// ── Validation helpers ────────────────────────────────────────────────────

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password rules: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,72}$/;
const COMMON_PASSWORDS = new Set([
  "password",
  "password123",
  "password@123",
  "admin@123",
  "user@12345",
  "crossedhearts@123",
  "qwerty123",
  "welcome@123",
  "letmein@123",
]);

// Name: only letters, spaces, hyphens, apostrophes — no script injection
const NAME_REGEX = /^[a-zA-Z\u00C0-\u024F\s'\-]{1,100}$/;

const validateEmail = (email) => {
  if (!email || typeof email !== "string") return "Email is required.";
  const clean = email.trim().toLowerCase();
  if (clean.length > 254) return "Email address is too long.";
  if (!EMAIL_REGEX.test(clean)) return "Please enter a valid email address.";
  return null;
};

const validatePassword = (password, fieldName = "Password") => {
  if (!password || typeof password !== "string") return `${fieldName} is required.`;
  if (password.length < 8) return `${fieldName} must be at least 8 characters.`;
  if (password.length > 72) return `${fieldName} is too long (max 72 characters).`; // bcrypt limit
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return `${fieldName} is too common. Please choose a more secure password.`;
  }
  if (!PASSWORD_REGEX.test(password)) {
    return `${fieldName} must contain at least one uppercase letter, one lowercase letter, one number, and one special character (e.g. !@#$%).`;
  }
  return null;
};

const validateName = (name) => {
  if (!name || typeof name !== "string") return "Name is required.";
  const clean = name.trim();
  if (clean.length < 2) return "Name must be at least 2 characters.";
  if (clean.length > 100) return "Name cannot exceed 100 characters.";
  if (!NAME_REGEX.test(clean)) return "Name contains invalid characters.";
  return null;
};

// ── NoSQL injection sanitiser ─────────────────────────────────────────────
// Strips MongoDB operators ($where, $gt, etc.) from any string or object
const sanitiseInput = (value) => {
  if (typeof value === "string") {
    // Remove $ operator patterns that could be injected
    return value.replace(/\$|\{|\}/g, "");
  }
  if (typeof value === "object" && value !== null) {
    const safe = {};
    for (const key of Object.keys(value)) {
      if (key.startsWith("$")) continue; // drop operator keys entirely
      safe[key] = sanitiseInput(value[key]);
    }
    return safe;
  }
  return value;
};

// ── XSS sanitiser — strips HTML tags from strings ─────────────────────────
const sanitiseXSS = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// ── Express middleware: sanitise all req.body fields ─────────────────────
const sanitiseBody = (req, res, next) => {
  if (req.body && typeof req.body === "object") {
    req.body = sanitiseInput(req.body);
  }
  if (req.query && typeof req.query === "object") {
    req.query = sanitiseInput(req.query);
  }
  if (req.params && typeof req.params === "object") {
    req.params = sanitiseInput(req.params);
  }
  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  sanitiseInput,
  sanitiseXSS,
  sanitiseBody,
};
