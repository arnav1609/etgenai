import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import { authRequired } from "../middleware/authMiddleware.js";
import { verifyCognitoToken } from "../middleware/cognitoAuth.js";

const router = express.Router();

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

// ─── Cognito Login ───────────────────────────────────────────────────────────
// Verifies the Cognito ID token, then finds-or-creates the user in MongoDB
// and issues the same JWT your existing middleware already expects.
// This keeps ALL protected routes (/goals, /transactions, /family, etc.) working.
router.post("/cognito-login", verifyCognitoToken, async (req, res) => {
  try {
    // Identity comes from the verified token payload — never trust req.body for this
    const email = req.cognitoUser.email;
    const cognitoId = req.cognitoUser.sub;          // Cognito's stable user ID
    const name = req.cognitoUser.name
      || req.cognitoUser["cognito:username"]
      || email.split("@")[0];                       // graceful fallback

    let user = await User.findOne({ email });

    if (!user) {
      // First Cognito login — create user in MongoDB
      user = await User.create({ name, email, cognitoId });
    } else if (!user.cognitoId) {
      // Existing email/password user logging in via Cognito for the first time
      user.cognitoId = cognitoId;
      await user.save();
    }

    const token = signToken(user._id.toString());

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Cognito login error:", err);
    res.status(500).json({ message: "Auth failed" });
  }
});

// ─── Legacy email/password auth (kept, not deleted) ──────────────────────────
// These routes are commented out as Cognito now handles authentication.
// Uncomment to re-enable if Cognito is removed or for testing.

// router.post("/signup", async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Name, email and password are required" });
//     }
//     const existing = await User.findOne({ email });
//     if (existing) {
//       return res.status(409).json({ message: "Email already registered" });
//     }
//     const salt = await bcrypt.genSalt(10);
//     const passwordHash = await bcrypt.hash(password, salt);
//     const user = await User.create({ name, email, passwordHash });
//     const token = signToken(user._id.toString());
//     res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     console.error("Signup error", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid credentials" });
//     const match = await bcrypt.compare(password, user.passwordHash);
//     if (!match) return res.status(401).json({ message: "Invalid credentials" });
//     const token = signToken(user._id.toString());
//     res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
//   } catch (err) {
//     console.error("Login error", err);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// });

router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (err) {
    console.error("Me error", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
