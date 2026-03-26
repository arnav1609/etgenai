import { CognitoJwtVerifier } from "aws-jwt-verify";

/**
 * Returns a lazily-created Cognito JWT verifier.
 *
 * IMPORTANT: must be called AFTER loadSecrets() has run so that
 * process.env.COGNITO_USER_POOL_ID and process.env.COGNITO_CLIENT_ID are set.
 * Creating the verifier at module load time would fail because ES Module imports
 * are hoisted and execute before the top-level `await loadSecrets()` in server.js.
 */
let _verifier = null;

export function getCognitoVerifier() {
  if (!_verifier) {
    _verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.COGNITO_USER_POOL_ID,
      tokenUse: "id",
      clientId: process.env.COGNITO_CLIENT_ID,
    });
  }
  return _verifier;
}
