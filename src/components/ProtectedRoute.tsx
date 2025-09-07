import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  // If the session is still loading, don't render anything yet
  if (loading) {
    return null; // Or a loading spinner component
  }

  // If there is a user, render the child routes (e.g., the dashboard)
  // Otherwise, redirect to the login page
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
