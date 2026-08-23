import Challenge from "../models/Challenge.js";
import Template from "../models/Template.js";
import User from "../models/User.js";
import { extractRequirements, matchStartups } from "../services/aiService.js";

function applyTemplate(content, values) {
  return content.replace(/{{\s*([^{}]+?)\s*}}/g, (match, field) => {
    const value = values[field];
    return Array.isArray(value) ? value.join(", ") : String(value ?? "");
  });
}

export async function createChallenge(req, res) {
  try {
    const template = await Template.findOne({ type: "problem-statement" });
    if (!template) return res.status(503).json({ message: "Problem statement template has not been seeded" });

    const missing = template.fields.filter((field) => {
      const value = req.body[field];
      return value === undefined || value === null || (typeof value === "string" && !value.trim()) || (Array.isArray(value) && !value.length);
    });
    if (missing.length) return res.status(400).json({ message: `Missing required field(s): ${missing.join(", ")}` });

    const problemText = applyTemplate(template.content, req.body);
    const requirements = await extractRequirements(problemText);
    const challenge = await Challenge.create({
      createdBy: req.user._id,
      departmentName: req.body.departmentName,
      problemText,
      requirements,
      templateRef: template._id,
      status: "draft",
    });

    return res.status(201).json({ challenge });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create challenge" });
  }
}

export async function getStartupMatches(req, res) {
  try {
    const challenge = await Challenge.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    const startups = await User.find({ role: "startup" }).select("name startupProfile").lean();
    const candidates = startups.map((startup) => ({ startupId: startup._id.toString(), startupName: startup.name, ...startup.startupProfile }));
    const matches = await matchStartups(challenge.requirements, candidates);
    return res.json({ matches });
  } catch (error) { return res.status(502).json({ message: error.message }); }
}

export async function getMyChallenges(req, res) {
  try {
    const challenges = await Challenge.find({ createdBy: req.user._id }).populate("templateRef", "type title").sort({ createdAt: -1 });
    return res.status(200).json({ challenges });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load challenges" });
  }
}

export async function browseChallenges(req, res) {
  try {
    const challenges = await Challenge.find({ status: "published" }).populate("createdBy", "name").sort({ createdAt: -1 });
    return res.status(200).json({ challenges });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load published challenges" });
  }
}

export async function updateChallengeStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["draft", "published", "closed"].includes(status)) return res.status(400).json({ message: "Invalid challenge status" });
    const challenge = await Challenge.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true },
    );
    if (!challenge) return res.status(404).json({ message: "Challenge not found" });
    return res.status(200).json({ challenge });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update challenge" });
  }
}
