import { Navigate } from "react-router-dom";

export default function WorkerProtectedRoute({ children }) {
  const workerToken = localStorage.getItem("workerAuthToken");
  const employerToken = localStorage.getItem("employerAuthToken");

  if (!workerToken) {
    if (employerToken) {
      return <Navigate to="/employee-dashboard" replace />;
    }
    return <Navigate to="/worker-signup" replace />;
  }

  return children;
}
