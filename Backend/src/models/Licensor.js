const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const accessLogSchema = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  accessedAt: { type: Date, default: Date.now },
  ipAddress: { type: String },
});

const licensorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    organisation: { type: String },
    role: {
      type: String,
      enum: ["publisher", "reviewer", "press"],
      default: "reviewer",
    },
    // Which books they have access to
    grantedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
    isActive: { type: Boolean, default: true },
    accessLog: [accessLogSchema],
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

licensorSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

licensorSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("Licensor", licensorSchema);
