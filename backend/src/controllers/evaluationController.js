import Application from "../models/Application.js";
import Evaluation from "../models/Evaluation.js";
import Template from "../models/Template.js";

export async function getRubric(req, res) {
  try {
    const template = await Template.findOne({ type: "evaluation-rubric" });
    if (!template) return res.status(503).json({ message: "Evaluation rubric has not been seeded" });
    return res.json({ rubric: JSON.parse(template.content) });
  } catch { return res.status(500).json({ message: "Failed to load rubric" }); }
}

export async function scoreApplication(req, res) {
  try {
    const application = await Application.findById(req.params.applicationId);
    if (!application) return res.status(404).json({ message: "Application not found" });
    const rubricTemplate = await Template.findOne({ type: "evaluation-rubric" });
    const rubric = rubricTemplate && JSON.parse(rubricTemplate.content);
    if (!rubric) return res.status(503).json({ message: "Evaluation rubric has not been seeded" });
    const submitted = new Map((req.body.scores || []).map((item) => [item.criterion, Number(item.score)]));
    const scores = rubric.criteria.map(({ name, weight }) => ({ criterion: name, weight, score: submitted.get(name) }));
    if (scores.some(({ score }) => !Number.isFinite(score) || score < 0 || score > 10)) return res.status(400).json({ message: "Every rubric criterion requires a score from 0 to 10" });
    const totalScore = scores.reduce((total, item) => total + item.score * item.weight / 10, 0);
    const evaluation = await Evaluation.findOneAndUpdate(
      { applicationId: application._id, evaluatorId: req.user._id },
      { scores, totalScore, notes: req.body.notes || "" },
      { upsert: true, new: true, runValidators: true },
    );
    return res.json({ evaluation });
  } catch { return res.status(500).json({ message: "Failed to save evaluation" }); }
}

export async function applicationEvaluations(req, res) {
  try {
    const evaluations = await Evaluation.find({ applicationId: req.params.applicationId }).populate("evaluatorId", "name");
    return res.json({ evaluations });
  } catch { return res.status(500).json({ message: "Failed to load evaluations" }); }
}

