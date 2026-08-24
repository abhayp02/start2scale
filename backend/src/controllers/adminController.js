import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";
import Challenge from "../models/Challenge.js";
import Pilot from "../models/Pilot.js";
import Template from "../models/Template.js";
import User from "../models/User.js";
import { governmentDomains, recordAudit } from "./authController.js";

export async function getAdminOverview(req, res) {
  try {
    const [users, challenges, applications, pilots, recentActivity] =
      await Promise.all([
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        Challenge.countDocuments(),
        Application.countDocuments(),
        Pilot.countDocuments(),
        AuditLog.find()
          .sort({ timestamp: -1 })
          .limit(8)
          .populate("userId", "name email role"),
      ]);
    const roleCounts = Object.fromEntries(users.map((item) => [item._id, item.count]));
    return res.json({
      metrics: {
        totalUsers: users.reduce((sum, item) => sum + item.count, 0),
        governmentUsers: roleCounts.government || 0,
        startups: roleCounts.startup || 0,
        evaluators: roleCounts.evaluator || 0,
        challenges,
        applications,
        pilots,
      },
      recentActivity,
    });
  } catch {
    return res.status(500).json({ message: "Unable to load admin overview" });
  }
}

export async function listUsers(req, res) {
  try {
    const query = {};
    if (req.query.role) query.role = req.query.role;
    if (req.query.status) query.accountStatus = req.query.status;
    if (req.query.search) {
      query.$or = ["name", "email", "departmentName"].map((field) => ({
        [field]: { $regex: req.query.search, $options: "i" },
      }));
    }
    const users = await User.find(query)
      .select("-passwordHash -verificationCodeHash")
      .sort({ _id: -1 })
      .limit(200);
    return res.json({ users });
  } catch {
    return res.status(500).json({ message: "Unable to load users" });
  }
}

export async function updateUserStatus(req, res) {
  try {
    const { accountStatus } = req.body;
    if (!["active", "suspended"].includes(accountStatus)) {
      return res.status(400).json({ message: "Invalid account status" });
    }
    if (req.params.userId === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot change your own status" });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { accountStatus },
      { new: true, runValidators: true },
    ).select("-passwordHash -verificationCodeHash");
    if (!user) return res.status(404).json({ message: "User not found" });
    await recordAudit("ACCOUNT_STATUS_CHANGED", req.user._id, {
      targetUserId: user._id,
      targetEmail: user.email,
      accountStatus,
    });
    return res.json({ user });
  } catch {
    return res.status(500).json({ message: "Unable to update account" });
  }
}

export async function listAuditLogs(req, res) {
  try {
    const query = {};
    if (req.query.action) query.action = { $regex: req.query.action, $options: "i" };
    if (req.query.userId) query.userId = req.query.userId;
    const logs = await AuditLog.find(query)
      .populate("userId", "name email role departmentName")
      .sort({ timestamp: -1 })
      .limit(250);
    return res.json({ logs });
  } catch {
    return res.status(500).json({ message: "Unable to load audit history" });
  }
}

export async function getPlatformSettings(req, res) {
  return res.json({
    governmentEmailDomains: governmentDomains(),
    verificationMode: "demo-code",
    registrationLimit: "5 attempts per email and IP per hour",
    startupProtection: [
      "Honeypot bot detection",
      "Disposable email blocklist",
      "Unique email and company registration number",
      "Mandatory accuracy declaration",
    ],
    aiProvider: "Google Gemini",
    aiModel: process.env.GEMINI_MODEL || "Not configured",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
}

export async function updateTemplate(req, res) {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.templateId,
      { title: req.body.title, content: req.body.content, fields: req.body.fields },
      { new: true, runValidators: true },
    );
    if (!template) return res.status(404).json({ message: "Template not found" });
    await recordAudit("TEMPLATE_UPDATED", req.user._id, {
      templateId: template._id,
      type: template.type,
    });
    return res.json({ template });
  } catch {
    return res.status(500).json({ message: "Unable to update template" });
  }
}
