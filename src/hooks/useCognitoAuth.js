import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * useCognitoAuth
 *
 * Watches for a completed Cognito login, exchanges the Cognito ID token
 * for your backend JWT, and stores it as "nf_token" in localStorage so
 * that ProtectedRoute and all existing API calls continue to work unchanged.
 */
export function useCognitoAuth() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuthenticated || !auth.user) return;

    const idToken = auth.user.id_token;
    console.log("Cognito authenticated — ID token:", idToken);  
    if (!idToken) return;

    const exchange = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/cognito-login`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.error("Backend token exchange failed:", res.status);
          return;
        }

        const data = await res.json();

        // Store under "nf_token" — matches ProtectedRoute + all existing API calls
        localStorage.setItem("nf_token", data.token);
        localStorage.setItem("nf_user", JSON.stringify(data.user));
        console.log("✅ Backend JWT stored — navigating to dashboard");

        // Navigate to dashboard after successful exchange
        navigate("/dashboard", { replace: true });
      } catch (err) {
        console.error("Cognito token exchange error:", err);
      }
    };

    exchange();
  }, [auth.isAuthenticated, auth.user?.expires_at]);

  return {
    auth,
    login: () => auth.signinRedirect(),
    logout: () => {
      localStorage.removeItem("nf_token");
      localStorage.removeItem("nf_user");
      auth.removeUser();
    },
  };
}

