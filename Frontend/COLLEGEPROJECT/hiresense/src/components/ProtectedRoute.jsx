import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const role = localStorage.getItem("userRole");

  if (!role) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If logged in but wrong role, redirect to their appropriate dashboard instead
    return <Navigate to={`/${role}-dashboard`} replace />;
  }

  return children;
}

export default ProtectedRoute;
