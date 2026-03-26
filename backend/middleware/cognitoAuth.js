import { getCognitoVerifier } from "../utils/cognitoVerifier.js";

/**
 * Middleware: verifies the Cognito ID token from the Authorization header.
 * On success, sets req.cognitoUser = decoded Cognito payload and calls next().
 * Used exclusively on /api/auth/cognito-login — not on regular JWT-protected routes.
 */
export async function verifyCognitoToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Cognito token missing" });
    }

    const payload = await getCognitoVerifier().verify(token);
    req.cognitoUser = payload;
    next();
  } catch (err) {
    console.error("Cognito token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired Cognito token" });
  }
}
