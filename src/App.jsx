import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./app/page";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AssistantPage from "./pages/AssistantPage.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LaunchNotesSection from "./components/LaunchNotesSection";
import ForCompaniesSection from "./components/ForCompaniesSection";
import Details from "./components/Details.jsx";
import { useCognitoAuth } from "./hooks/useCognitoAuth";

// ⭐ ADD THIS
import SubscriptionPage from "./components/SubscriptionPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import TaxationPage from "./pages/TaxationPage.jsx";
import TaxCalculatePage from "./pages/TaxCalculatePage.jsx";
import TaxComparePage from "./pages/TaxComparePage.jsx";
import TaxClaimsPage from "./pages/TaxClaimsPage.jsx";
import TaxTipsPage from "./pages/TaxTipsPage.jsx";
import TaxSavedPage from "./pages/TaxSavedPage.jsx";
import TaxInternationalPage from "./pages/TaxInternationalPage.jsx";

// Layout + Cognito token exchange on every render
const Layout = ({ children }) => {
  const location = useLocation();
  useCognitoAuth(); // fires token exchange when Cognito redirects back

  const showNavbar = !location.pathname.startsWith("/tax") && !["/dashboard", "/assistant", "/details"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      {children}
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>

          {/* Public Routes */}
          <Route path="/" element={<Home />} />

          {/* ⭐ ADD THIS */}
          <Route path="/subscribe" element={<SubscriptionPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/launch" element={<LaunchNotesSection />} />
          <Route path="/for-companies" element={<ForCompaniesSection />} />

          <Route path="/details" element={<Details />} />
          <Route path="/tax" element={<TaxationPage />} />
          <Route path="/tax/calculate" element={<TaxCalculatePage />} />
          <Route path="/tax/compare" element={<TaxComparePage />} />
          <Route path="/tax/claims" element={<TaxClaimsPage />} />
          <Route path="/tax/tips" element={<TaxTipsPage />} />
          <Route path="/tax/saved" element={<TaxSavedPage />} />
          <Route path="/tax/international-duty" element={<TaxInternationalPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All Route - Must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
