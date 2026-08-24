import Application from "../models/Application.js";
import Evaluation from "../models/Evaluation.js";
import Template from "../models/Template.js";
import User from "../models/User.js";

export async function listEvaluators(req, res) {
  try {
    const filter = {
      role: "evaluator",
      accountStatus: "active",
    };
    if (req.user.departmentName) filter.departmentName = req.user.departmentName;
    const evaluators = await User.find(filter)
      .select("name email departmentName evaluatorProfile")
      .sort({ name: 1 });
    return res.json({ evaluators });
  } catch {
    return res.status(500).json({ message: "Failed to load evaluators" });
  }
}

export async function assignEvaluator(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate("challengeId");
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (application.challengeId.createdBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the challenge owner can assign evaluators" });
    if (application.status !== "eligible")
      return res.status(400).json({ message: "Complete eligibility before assigning an evaluator" });

    const evaluator = await User.findOne({
      _id: req.body.evaluatorId,
      role: "evaluator",
      accountStatus: "active",
    });
    if (!evaluator)
      return res.status(404).json({ message: "Active evaluator not found" });
    if (
      req.user.departmentName &&
      evaluator.departmentName &&
      evaluator.departmentName !== req.user.departmentName
    )
      return res.status(403).json({ message: "Evaluator belongs to another department" });

    const evaluation = await Evaluation.findOneAndUpdate(
      { applicationId: application._id, evaluatorId: evaluator._id },
      {
        assignedBy: req.user._id,
        status: "assigned",
        assignedAt: new Date(),
        dueDate: req.body.dueDate || undefined,
        instructions: req.body.instructions || "",
        conflictDeclared: false,
        conflictDetails: "",
        scores: [],
        totalScore: undefined,
        notes: "",
        submittedAt: undefined,
      },
      { upsert: true, new: true, runValidators: true },
    ).populate("evaluatorId", "name email departmentName");
    return res.status(201).json({ evaluation });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "This evaluator is already assigned" });
    return res.status(400).json({ message: error.message || "Assignment failed" });
  }
}

export async function assignedEvaluations(req, res) {
  try {
    const evaluations = await Evaluation.find({ evaluatorId: req.user._id })
      .populate({
        path: "applicationId",
        populate: [
          { path: "startupId", select: "name email startupProfile" },
          { path: "challengeId", select: "departmentName problemText requirements" },
        ],
      })
      .populate("assignedBy", "name departmentName")
      .sort({ assignedAt: -1 });
    return res.json({ evaluations });
  } catch {
    return res.status(500).json({ message: "Failed to load assignments" });
  }
}

export async function getRubric(req, res) {
  try {
    const template = await Template.findOne({ type: "evaluation-rubric" });
    if (!template)
      return res
        .status(503)
        .json({ message: "Evaluation rubric has not been seeded" });
    return res.json({ rubric: JSON.parse(template.content) });
  } catch {
    return res.status(500).json({ message: "Failed to load rubric" });
  }
}

export async function scoreApplication(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    const assignment = await Evaluation.findOne({
      applicationId: application._id,
      evaluatorId: req.user._id,
      status: "assigned",
    });
    if (!assignment)
      return res.status(403).json({ message: "This application is not assigned to you" });
    if (req.body.conflictDeclared !== true)
      return res.status(400).json({ message: "Conflict-of-interest declaration is required" });
    const rubricTemplate = await Template.findOne({
      type: "evaluation-rubric",
    });
    const rubric = rubricTemplate && JSON.parse(rubricTemplate.content);
    if (!rubric)
      return res
        .status(503)
        .json({ message: "Evaluation rubric has not been seeded" });
    const submitted = new Map(
      (req.body.scores || []).map((item) => [
        item.criterion,
        Number(item.score),
      ]),
    );
    const scores = rubric.criteria.map(({ name, weight }) => ({
      criterion: name,
      weight,
      score: submitted.get(name),
    }));
    if (
      scores.some(
        ({ score }) => !Number.isFinite(score) || score < 0 || score > 10,
      )
    )
      return res
        .status(400)
        .json({
          message: "Every rubric criterion requires a score from 0 to 10",
        });
    const totalScore = scores.reduce(
      (total, item) => total + (item.score * item.weight) / 10,
      0,
    );
    assignment.scores = scores;
    assignment.totalScore = totalScore;
    assignment.notes = req.body.notes || "";
    assignment.conflictDeclared = true;
    assignment.conflictDetails = req.body.conflictDetails || "No conflict declared";
    assignment.status = "submitted";
    assignment.submittedAt = new Date();
    const evaluation = await assignment.save();
    return res.json({ evaluation });
  } catch {
    return res.status(500).json({ message: "Failed to save evaluation" });
  }
}

export async function applicationEvaluations(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId)
      .populate("challengeId");
    if (!application)
      return res.status(404).json({ message: "Application not found" });
    if (
      req.user.role === "government" &&
      application.challengeId.createdBy.toString() !== req.user._id.toString()
    )
      return res.status(403).json({ message: "Access denied" });
    if (
      req.user.role === "evaluator" &&
      !(await Evaluation.exists({ applicationId: application._id, evaluatorId: req.user._id }))
    )
      return res.status(403).json({ message: "Access denied" });
    const evaluations = await Evaluation.find({
      applicationId: req.params.applicationId,
    }).populate("evaluatorId", "name");
    const submitted = evaluations.filter((evaluation) => evaluation.status === "submitted");
    const committeeScore = submitted.length
      ? submitted.reduce((sum, evaluation) => sum + evaluation.totalScore, 0) / submitted.length
      : null;
    return res.json({ evaluations, committeeScore });
  } catch {
    return res.status(500).json({ message: "Failed to load evaluations" });
  }
}
