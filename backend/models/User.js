import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },                                  // optional — Cognito users may not supply it
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },                                      // optional — not set for Cognito users
    cognitoId: { type: String, sparse: true },                          // Cognito sub (unique per Cognito user)
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
