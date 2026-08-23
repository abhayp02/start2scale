import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    departmentName: user.departmentName,
    startupProfile: user.startupProfile,
  };
}

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, role, departmentName, startupProfile } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Name, email, password, and role are required" });
    }

    if (role === "government" && !departmentName) {
      return res.status(400).json({ message: "Department name is required for government users" });
    }

    if (role === "startup" && !startupProfile) {
      return res.status(400).json({ message: "Startup profile is required for startup users" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      departmentName: role === "government" ? departmentName : undefined,
      startupProfile: role === "startup" ? startupProfile : undefined,
    });

    return res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Unable to register user" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = user && (await bcrypt.compare(password, user.passwordHash));

    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.status(200).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in" });
  }
}

export async function getCurrentUser(req, res) {
  return res.status(200).json({ user: publicUser(req.user) });
}

