const attempts = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function registrationGuard(req, res, next) {
  if (req.body.website) {
    return res.status(400).json({ message: "Registration could not be completed" });
  }

  const email = String(req.body.email || "").trim().toLowerCase();
  const key = `${req.ip}:${email}`;
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter(
    (timestamp) => now - timestamp < WINDOW_MS,
  );

  if (recent.length >= MAX_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many registration attempts. Please try again later.",
    });
  }

  recent.push(now);
  attempts.set(key, recent);
  next();
}
