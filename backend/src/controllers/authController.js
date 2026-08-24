import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
]);

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentName: user.departmentName,
    governmentProfile: user.governmentProfile,
    startupProfile: user.startupProfile,
    emailVerified: user.emailVerified,
    accountStatus: user.accountStatus,
  };
}

function createToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not configured");
  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

export function governmentDomains() {
  const configured = (process.env.GOVERNMENT_EMAIL_DOMAINS || "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(["gov.in", "nic.in", ...configured])];
}

function hasGovernmentDomain(email) {
  const domain = email.split("@")[1] || "";
  return governmentDomains().some(
    (allowed) => domain === allowed || domain.endsWith(`.${allowed}`),
  );
}

function mockVerificationCode(email) {
  const localPart = email
    .split("@")[0]
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
  return localPart.length >= 3 ? `${localPart.slice(0, 3)}123` : null;
}

export async function recordAudit(action, userId, details = {}) {
  try {
    await AuditLog.create({ action, userId, details });
  } catch {
    // Authentication remains available if audit persistence is interrupted.
  }
}

export async function register(req, res) {
  try {
    const {
      name,
      email,
      password,
      role,
      departmentName,
      startupProfile,
      accuracyDeclaration,
    } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Name, email, password, and role are required",
      });
    }
    if (!["government", "startup", "evaluator"].includes(role)) {
      return res.status(403).json({ message: "This role cannot be self-registered" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailDomain = normalizedEmail.split("@")[1];
    if (!emailDomain) {
      return res.status(400).json({ message: "Enter a valid email address" });
    }

    const governmentRole = ["government", "evaluator"].includes(role);
    if (governmentRole && !departmentName) {
      return res.status(400).json({ message: "Department or agency name is required" });
    }
    if (governmentRole && !hasGovernmentDomain(normalizedEmail)) {
      return res.status(400).json({
        message: "Use an approved government or agency email domain",
      });
    }

    if (role === "startup") {
      if (!startupProfile?.companyRegistrationNumber) {
        return res.status(400).json({ message: "Company registration number is required" });
      }
      if (!startupProfile.domain || !startupProfile.technology?.length) {
        return res.status(400).json({ message: "Startup domain and capabilities are required" });
      }
      if (!accuracyDeclaration) {
        return res.status(400).json({
          message: "You must accept the information accuracy declaration",
        });
      }
      if (DISPOSABLE_DOMAINS.has(emailDomain)) {
        return res.status(400).json({ message: "Disposable email addresses cannot be used" });
      }
    }

    const duplicateQuery = [{ email: normalizedEmail }];
    if (role === "startup") {
      duplicateQuery.push({
        "startupProfile.companyRegistrationNumber":
          startupProfile.companyRegistrationNumber.trim(),
      });
    }
    const existingUser = await User.findOne({ $or: duplicateQuery });
    if (existingUser) {
      return res.status(409).json({
        message:
          existingUser.email === normalizedEmail
            ? "An account with this email already exists"
            : "This company registration number is already registered",
      });
    }

    const verificationCode = governmentRole
      ? mockVerificationCode(normalizedEmail)
      : null;
    if (governmentRole && !verificationCode) {
      return res.status(400).json({
        message: "Email must begin with at least three letters or numbers",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      departmentName: governmentRole ? departmentName : undefined,
      startupProfile:
        role === "startup" ? { ...startupProfile, profileStatus: "active" } : undefined,
      emailVerified: !governmentRole,
      accountStatus: governmentRole ? "pending-verification" : "active",
      verificationCodeHash: verificationCode
        ? await bcrypt.hash(verificationCode, 10)
        : undefined,
      verificationExpiresAt: governmentRole
        ? new Date(Date.now() + 15 * 60 * 1000)
        : undefined,
    });

    await recordAudit("ACCOUNT_CREATED", user._id, {
      role,
      email: normalizedEmail,
      verificationRequired: governmentRole,
      ipAddress: req.ip,
    });

    if (governmentRole) {
      return res.status(201).json({
        verificationRequired: true,
        email: normalizedEmail,
        user: publicUser(user),
        message: "Account created. Complete demo email verification.",
      });
    }

    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This email or company registration number already exists",
      });
    }
    return res.status(500).json({ message: "Unable to register user" });
  }
}

export async function verifyGovernmentEmail(req, res) {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const code = String(req.body.code || "").trim().toLowerCase();
    const user = await User.findOne({ email });

    if (!user || !["government", "evaluator"].includes(user.role)) {
      return res.status(404).json({ message: "Verification account not found" });
    }
    if (user.accountStatus !== "pending-verification") {
      return res.status(400).json({ message: "This account is already verified" });
    }
    if (!user.verificationExpiresAt || user.verificationExpiresAt < new Date()) {
      return res.status(400).json({
        message: "Verification code expired. Register again to generate a new code.",
      });
    }
    const matches = await bcrypt.compare(code, user.verificationCodeHash || "");
    if (!matches) {
      await recordAudit("EMAIL_VERIFICATION_FAILED", user._id, { ipAddress: req.ip });
      return res.status(400).json({ message: "Invalid verification code" });
    }

    user.emailVerified = true;
    user.accountStatus = "active";
    user.verificationCodeHash = undefined;
    user.verificationExpiresAt = undefined;
    await user.save();
    await recordAudit("EMAIL_VERIFIED", user._id, { mode: "demo-code" });

    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch {
    return res.status(500).json({ message: "Unable to verify email" });
  }
}

async function authenticateCredentials(req, res, requiredRole) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));
    if (!passwordMatches || (requiredRole && user.role !== requiredRole)) {
      await recordAudit("LOGIN_FAILED", user?._id, {
        email: normalizedEmail,
        portal: requiredRole || "standard",
        ipAddress: req.ip,
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.accountStatus === "pending-verification") {
      return res.status(403).json({
        message: "Complete email verification before signing in",
        verificationRequired: true,
        email: user.email,
      });
    }
    if (user.accountStatus === "suspended") {
      return res.status(403).json({ message: "This account is suspended" });
    }

    user.lastLoginAt = new Date();
    await user.save();
    await recordAudit("LOGIN_SUCCEEDED", user._id, {
      portal: requiredRole || "standard",
      ipAddress: req.ip,
    });
    return res.json({ token: createToken(user), user: publicUser(user) });
  } catch {
    return res.status(500).json({ message: "Unable to log in" });
  }
}

export function login(req, res) {
  return authenticateCredentials(req, res);
}

export function adminLogin(req, res) {
  return authenticateCredentials(req, res, "admin");
}

export async function getCurrentUser(req, res) {
  return res.status(200).json({ user: publicUser(req.user) });
}
