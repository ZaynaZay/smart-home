import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/MainLayout";

// Import all page components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import AccountPage from "./pages/AccountPage";
import OnboardingPage from "./pages/OnboardingPage";
import LocalAgentPage from "./pages/LocalAgentPage";

// Import route-handling components
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* The MainLayout provides the consistent Navbar and Footer for all pages */}
      <Route element={<MainLayout />}>
        {/* --- Public Routes --- */}
        {/* The HomePage is accessible to everyone. */}
        <Route path="/" element={<HomePage />} />

        {/* --- Auth Redirect Routes --- */}
        {/* These routes are for logged-OUT users only. */}
        {/* If a logged-in user tries to visit /login, they will be redirected to the dashboard. */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* --- Protected Routes --- */}
        {/* These routes are for logged-IN users only. */}
        {/* If a logged-out user tries to visit any of these, they will be redirected to /login. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/local-agent" element={<LocalAgentPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
