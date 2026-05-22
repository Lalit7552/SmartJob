const mongoose = require("mongoose");
const ChatMessage = require("../models/ChatMessage");
const Employer = require("../models/Employer");
const Worker = require("../models/Worker");

function formatMessage(msg) {
  return {
    id: msg._id.toString(),
    workerId: msg.workerId.toString(),
    employerId: msg.employerId.toString(),
    senderRole: msg.senderRole,
    senderId: msg.senderId.toString(),
    text: msg.text,
    clientId: msg.clientId,
    createdAt: msg.createdAt,
  };
}

async function listMessages(req, res, next) {
  try {
    const workerId = req.query?.workerId;
    const employerId = req.query?.employerId;
    const limit = Math.min(100, Math.max(1, Number(req.query?.limit) || 50));
    const before = req.query?.before ? new Date(req.query.before) : null;

    if (!mongoose.isValidObjectId(workerId) || !mongoose.isValidObjectId(employerId)) {
      return res.status(400).json({
        ok: false,
        error: { code: "VALIDATION", message: "workerId and employerId are required" },
      });
    }

    if (req.worker && req.worker._id.toString() !== workerId) {
      return res.status(403).json({
        ok: false,
        error: { code: "FORBIDDEN", message: "Not allowed for this worker" },
      });
    }

    if (req.employer && req.employer._id.toString() !== employerId) {
      return res.status(403).json({
        ok: false,
        error: { code: "FORBIDDEN", message: "Not allowed for this employer" },
      });
    }

    const query = { workerId, employerId };
    if (before && !Number.isNaN(before.getTime())) {
      query.createdAt = { $lt: before };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return res.json({
      ok: true,
      data: {
        messages: messages
          .reverse()
          .map(formatMessage),
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function listThreads(req, res, next) {
  try {
    if (req.worker) {
      const workerId = req.worker._id;
      const threads = await ChatMessage.aggregate([
        { $match: { workerId } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$employerId", lastMessage: { $first: "$$ROOT" } } },
        {
          $lookup: {
            from: Employer.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "employer",
          },
        },
        { $unwind: { path: "$employer", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            employerId: "$_id",
            contactName: { $ifNull: ["$employer.profile.name", "$employer.profile.companyName"] },
            city: "$employer.profile.city",
            lastMessage: {
              text: "$lastMessage.text",
              createdAt: "$lastMessage.createdAt",
              senderRole: "$lastMessage.senderRole",
            },
          },
        },
        { $sort: { "lastMessage.createdAt": -1 } },
      ]);

      return res.json({
        ok: true,
        data: {
          threads: threads.map((t) => ({
            employerId: t.employerId?.toString(),
            contactName: t.contactName || "Employer",
            city: t.city || "",
            lastMessage: t.lastMessage || null,
          })),
        },
      });
    }

    if (req.employer) {
      const employerId = req.employer._id;
      const threads = await ChatMessage.aggregate([
        { $match: { employerId } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$workerId", lastMessage: { $first: "$$ROOT" } } },
        {
          $lookup: {
            from: Worker.collection.name,
            localField: "_id",
            foreignField: "_id",
            as: "worker",
          },
        },
        { $unwind: { path: "$worker", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            workerId: "$_id",
            fullName: "$worker.profile.fullName",
            city: "$worker.profile.city",
            lastMessage: {
              text: "$lastMessage.text",
              createdAt: "$lastMessage.createdAt",
              senderRole: "$lastMessage.senderRole",
            },
          },
        },
        { $sort: { "lastMessage.createdAt": -1 } },
      ]);

      return res.json({
        ok: true,
        data: {
          threads: threads.map((t) => ({
            workerId: t.workerId?.toString(),
            fullName: t.fullName || "Worker",
            city: t.city || "",
            lastMessage: t.lastMessage || null,
          })),
        },
      });
    }

    return res.status(403).json({
      ok: false,
      error: { code: "FORBIDDEN", message: "Not allowed" },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { listMessages, listThreads, formatMessage };
