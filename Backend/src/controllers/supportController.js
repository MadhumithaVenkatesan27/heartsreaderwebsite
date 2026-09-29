const mongoose = require("mongoose");
const SupportTicket = require("../models/SupportTicket");
const { catchAsync, createError } = require("../middleware/errorMiddleware");
const { createNotification } = require("../services/notificationService");

const cleanMessage = (value) => String(value || "").trim();

const createTicket = catchAsync(async (req, res, next) => {
  const subject = cleanMessage(req.body.subject);
  const message = cleanMessage(req.body.message);

  if (subject.length < 5) {
    return next(createError("Ticket subject must be at least 5 characters.", 400));
  }
  if (message.length < 10) {
    return next(createError("Ticket message must be at least 10 characters.", 400));
  }

  const ticket = await SupportTicket.create({
    userId: req.user._id,
    subject,
    category: req.body.category || "other",
    priority: req.body.priority || "normal",
    messages: [
      {
        senderId: req.user._id,
        senderRole: "user",
        message,
      },
    ],
    lastMessageAt: new Date(),
  });

  res.status(201).json({
    status: "success",
    message: "Support ticket created.",
    data: { ticket },
  });
});

const listMyTickets = catchAsync(async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user._id })
    .sort({ lastMessageAt: -1 })
    .select("subject category priority status lastMessageAt createdAt updatedAt");

  res.status(200).json({
    status: "success",
    results: tickets.length,
    data: { tickets },
  });
});

const getMyTicket = catchAsync(async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.ticketId)) {
    return next(createError("Support ticket not found.", 404));
  }

  const ticket = await SupportTicket.findOne({
    _id: req.params.ticketId,
    userId: req.user._id,
  }).populate("messages.senderId", "name email role");

  if (!ticket) return next(createError("Support ticket not found.", 404));

  res.status(200).json({
    status: "success",
    data: { ticket },
  });
});

const replyToMyTicket = catchAsync(async (req, res, next) => {
  const message = cleanMessage(req.body.message);
  if (message.length < 2) {
    return next(createError("Reply message is required.", 400));
  }
  if (!mongoose.isValidObjectId(req.params.ticketId)) {
    return next(createError("Support ticket not found.", 404));
  }

  const ticket = await SupportTicket.findOne({
    _id: req.params.ticketId,
    userId: req.user._id,
  });

  if (!ticket) return next(createError("Support ticket not found.", 404));
  if (ticket.status === "closed") {
    return next(createError("This support ticket is closed.", 400));
  }

  ticket.messages.push({
    senderId: req.user._id,
    senderRole: "user",
    message,
  });
  ticket.status = "open";
  ticket.lastMessageAt = new Date();
  await ticket.save();

  res.status(200).json({
    status: "success",
    message: "Reply added.",
    data: { ticket },
  });
});

module.exports = {
  createTicket,
  listMyTickets,
  getMyTicket,
  replyToMyTicket,
};
