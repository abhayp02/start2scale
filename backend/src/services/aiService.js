import Anthropic from "@anthropic-ai/sdk";

const askLLM = async (prompt) => {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY is not configured");
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: `${prompt}\nReturn valid JSON only, with no markdown fences or commentary.` }],
    });
    const text = response.content.find((item) => item.type === "text")?.text;
    if (!text) throw new Error("Claude returned no text content");
    return text;
  } catch (error) {
    throw new Error(`Claude request failed: ${error.message}`);
  }
};

const parseJSON = (text) => JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").trim());

export async function extractRequirements(problemText) {
  try {
    const text = await askLLM(`Extract procurement requirements from this problem statement. Return exactly this shape: {"technology":"string","domain":"string","requiredAccuracy":"string","deployment":"string"}. Problem statement:\n${problemText}`);
    const result = parseJSON(text);
    return { technology: String(result.technology || ""), domain: String(result.domain || ""), requiredAccuracy: String(result.requiredAccuracy || ""), deployment: String(result.deployment || "") };
  } catch (error) { throw new Error(`Requirement extraction failed: ${error.message}`); }
}

export async function matchStartups(requirements, startupList) {
  try {
    const text = await askLLM(`Rank the candidate startups against the requirements. Return a JSON array of {"startupId":"string","startupName":"string","matchScore":number,"explanation":"string"}. Scores must be 0-100. Requirements: ${JSON.stringify(requirements)}. Candidates: ${JSON.stringify(startupList)}`);
    const result = parseJSON(text);
    if (!Array.isArray(result)) throw new Error("Expected an array");
    return result.map((item) => ({ ...item, matchScore: Number(item.matchScore) })).sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) { throw new Error(`Startup matching failed: ${error.message}`); }
}

export async function fillTemplate(templateContent, dataObject) {
  try {
    const text = await askLLM(`Fill every {{placeholder}} in this template using only the supplied data. Preserve all other wording exactly. Return {"filledContent":"string"}. Template: ${JSON.stringify(templateContent)}. Data: ${JSON.stringify(dataObject)}`);
    const result = parseJSON(text);
    if (typeof result.filledContent !== "string") throw new Error("Missing filledContent");
    return result.filledContent;
  } catch (error) { throw new Error(`Template filling failed: ${error.message}`); }
}

export async function analyzeKPIProgress(pilot, kpiRecords) {
  try {
    const text = await askLLM(`Analyze pilot KPI progress. Officer and citizen records MUST carry more evidentiary weight than startup self-reports. Explicitly flag every gap between startup-reported and officer/citizen values in authenticityFlags. Return exactly {"overallStatus":"string","summary":"string","flaggedKPIs":[{"kpiName":"string","reason":"string"}],"recommendation":"scale-up|extend|terminate","authenticityFlags":[{"kpiName":"string","issue":"string"}]}. Pilot: ${JSON.stringify(pilot)}. KPI records: ${JSON.stringify(kpiRecords)}`);
    const result = parseJSON(text);
    return { overallStatus: result.overallStatus, summary: result.summary, flaggedKPIs: result.flaggedKPIs || [], recommendation: result.recommendation, authenticityFlags: result.authenticityFlags || [] };
  } catch (error) { throw new Error(`KPI analysis failed: ${error.message}`); }
}

