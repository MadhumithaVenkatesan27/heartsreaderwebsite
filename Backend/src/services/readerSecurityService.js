const jwt = require("jsonwebtoken");

const getReadSecret = () => {
  const secret = process.env.READ_TOKEN_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("READ_TOKEN_SECRET or JWT_SECRET is required.");
  }
  return secret;
};

const signReadToken = ({ userId, bookId, chapterId }) =>
  jwt.sign(
    {
      purpose: "read_chapter",
      userId: userId.toString(),
      bookId: bookId.toString(),
      chapterId: chapterId.toString(),
    },
    getReadSecret(),
    { expiresIn: process.env.READ_TOKEN_EXPIRES_IN || "2m" }
  );

const verifyReadToken = (token) => jwt.verify(token, getReadSecret());

const setSecurePdfHeaders = (res, filename) => {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("Accept-Ranges", "none");
};

module.exports = {
  signReadToken,
  verifyReadToken,
  setSecurePdfHeaders,
};
