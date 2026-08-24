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

function words(value) {
  return new Set(
    String(value || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 2),
  );
}

function overlap(left, right) {
  const leftWords = words(left);
  const rightWords = words(right);
  return [...leftWords].filter((word) => rightWords.has(word));
}

function capabilityFit(requirements, profile = {}) {
  const challengeDomain = String(requirements?.domain || "").toLowerCase();
  const startupDomains = [profile.domain, ...(profile.industriesServed || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const capabilities = [
    ...(profile.technology || []),
    ...(profile.capabilityTags || []),
    ...(profile.integrationCapabilities || []),
  ].join(" ");
  const requiredTechnology = requirements?.technology || "";
  const technologyOverlap = overlap(requiredTechnology, capabilities);
  const exactDomain = Boolean(
    challengeDomain &&
      (startupDomains.includes(challengeDomain) ||
        challengeDomain.includes(String(profile.domain || "").toLowerCase())),
  );
  const domainOverlap = overlap(challengeDomain, startupDomains);
  const deploymentOverlap = overlap(
    requirements?.deployment,
    profile.deploymentType,
  );

  let score = exactDomain ? 55 : Math.min(30, domainOverlap.length * 15);
  score += Math.min(30, technologyOverlap.length * 10);
  score += Math.min(10, deploymentOverlap.length * 5);
  if (profile.isRegisteredEntity) score += 5;
  if (["prototype", "deployed"].includes(profile.prototypeStage)) score += 5;

  const reasons = [];
  if (exactDomain) reasons.push(`Domain match: ${profile.domain}`);
  if (technologyOverlap.length)
    reasons.push(`Capability overlap: ${technologyOverlap.join(", ")}`);
  if (deploymentOverlap.length)
    reasons.push(`Deployment fit: ${profile.deploymentType}`);
  if (profile.isRegisteredEntity) reasons.push("Registered entity");
  if (["prototype", "deployed"].includes(profile.prototypeStage))
    reasons.push(`Solution stage: ${profile.prototypeStage}`);

  return { score: Math.min(100, score), reasons };
}

export async function createChallenge(req, res) {
  try {
    const template = await Template.findOne({ type: "problem-statement" });
    if (!template)
      return res
        .status(503)
        .json({ message: "Problem statement template has not been seeded" });

    const missing = template.fields.filter((field) => {
      const value = req.body[field];
      return (
        value === undefined ||
        value === null ||
        (typeof value === "string" && !value.trim()) ||
        (Array.isArray(value) && !value.length)
      );
    });
    if (missing.length)
      return res
        .status(400)
        .json({ message: `Missing required field(s): ${missing.join(", ")}` });

    const problemText = applyTemplate(template.content, req.body);
    let requirements;
    let aiWarning;

    try {
      requirements = await extractRequirements(problemText);
    } catch (error) {
      requirements = {
        technology: req.body.technicalRequirements || req.body.technology || "",
        domain: req.body.sector,
        requiredAccuracy:
          req.body.performanceRequirements || req.body.requiredAccuracy || "",
        deployment:
          req.body.integrationRequirements || req.body.deployment || "",
      };
      aiWarning =
        "AI requirement extraction is temporarily unavailable. Structured form values were saved and can be analyzed again later.";
    }
    const challenge = await Challenge.create({
      createdBy: req.user._id,
      departmentName: req.body.departmentName,
      problemText,
      requirements,
      templateRef: template._id,
      status: "draft",
    });

    return res.status(201).json({ challenge, aiWarning });
  } catch (error) {
    return res
      .status(502)
      .json({ message: error.message || "Failed to create challenge" });
  }
}

export async function getStartupMatches(req, res) {
  let analyzedCount = 0;
  let candidateCount = 0;

  try {
    const challenge = await Challenge.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });
    const startups = await User.find({ role: "startup" })
      .select("name startupProfile")
      .lean();
    const rankedCandidates = startups
      .map((startup) => ({
        candidate: {
          startupId: startup._id.toString(),
          startupName: startup.name,
          ...startup.startupProfile,
        },
        fit: capabilityFit(challenge.requirements, startup.startupProfile),
      }))
      .sort((left, right) => right.fit.score - left.fit.score);
    analyzedCount = rankedCandidates.length;
    const relevantCandidates = rankedCandidates.filter(
      ({ fit }) => fit.score >= 35,
    );
    const candidatesForAI = (
      relevantCandidates.length ? relevantCandidates : rankedCandidates
    )
      .slice(0, 12)
      .map(({ candidate }) => candidate);
    candidateCount = candidatesForAI.length;
    const matches = await matchStartups(
      challenge.requirements,
      candidatesForAI,
    );
    return res.json({ matches, analyzedCount, candidateCount });
  } catch (error) {
    return res
      .status(502)
      .json({ message: error.message, analyzedCount, candidateCount });
  }
}

export async function recommendedChallenges(req, res) {
  try {
    const profile = req.user.startupProfile || {};
    const published = await Challenge.find({ status: "published" })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    const challenges = published
      .map((challenge) => {
        const fit = capabilityFit(challenge.requirements, profile);
        return {
          ...challenge,
          recommendation: {
            matchScore: fit.score,
            reasons: fit.reasons,
          },
        };
      })
      .filter((challenge) => challenge.recommendation.matchScore >= 35)
      .sort(
        (left, right) =>
          right.recommendation.matchScore - left.recommendation.matchScore,
      );

    return res.json({
      challenges,
      analyzedCount: published.length,
      profileDomain: profile.domain || "",
    });
  } catch {
    return res.status(500).json({ message: "Failed to generate recommendations" });
  }
}

export async function getMyChallenges(req, res) {
  try {
    const challenges = await Challenge.find({ createdBy: req.user._id })
      .populate("templateRef", "type title")
      .sort({ createdAt: -1 });
    return res.status(200).json({ challenges });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load challenges" });
  }
}

export async function browseChallenges(req, res) {
  try {
    const challenges = await Challenge.find({ status: "published" })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json({ challenges });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to load published challenges" });
  }
}

export async function updateChallengeStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["draft", "published", "closed"].includes(status))
      return res.status(400).json({ message: "Invalid challenge status" });
    const challenge = await Challenge.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true },
    );
    if (!challenge)
      return res.status(404).json({ message: "Challenge not found" });
    return res.status(200).json({ challenge });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update challenge" });
  }
}
