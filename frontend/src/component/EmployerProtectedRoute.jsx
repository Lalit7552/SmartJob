import { Navigate } from "react-router-dom";

export default function EmployerProtectedRoute({ children }) {
  const employerToken = localStorage.getItem("employerAuthToken");
  const workerToken = localStorage.getItem("workerAuthToken");

  if (!employerToken) {
    if (workerToken) {
      return <Navigate to="/worker-dashboard" replace />;
    }
    return <Navigate to="/employer-signup" replace />;
  }

  return children;
}
