/**
 * AWS Cognito OIDC configuration for react-oidc-context.
 *
 * Pool ID and Client ID are hardcoded here — they are public OIDC values
 * (visible in any browser network tab) and do NOT need to be kept secret.
 */
export const cognitoConfig = {
  authority: "https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_59PmDYFAj",
  client_id: "3rcp7ef73ef9oepmmh61g6asqr",

  // Dynamically uses whatever port the app is running on (3003 locally, CloudFront in prod)
  redirect_uri: window.location.origin,

  // After Cognito destroys its session cookie, redirect back here
  post_logout_redirect_uri: window.location.origin,

  response_type: "code",
  scope: "openid email phone",

  // Silently refresh tokens before they expire
  automaticSilentRenew: true,
};

