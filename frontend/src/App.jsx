import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import LandingPage from "./Panel/LandingPage";
import RoleSelect from "./Panel/RoleSelect";

/* Worker */
import WorkerSignup from "./Panel/worker/Worker-Signup";
import WorkerSkills from "./Panel/worker/WorkerSkills";
import UploadDocuments from "./Panel/worker/UploadDocuments";
import WorkerDashboard from "./Panel/worker/WorkerDashboard";
import WorkerProfileform from "./Panel/worker/WorkerProfileform";
import WorkerLayout from "./Panel/worker/WorkerLayout";
import WorkerProfile from "./Panel/worker/WorkerProfile";
import WorkerFindJobs from "./Panel/worker/WorkerFindJobs";
import WorkerChatList from "./Panel/worker/WorkerChatList";
import WorkerChatPage from "./Panel/worker/WorkerChatPage";
import WorkerJobHistory from "./Panel/worker/WorkerJobHistory";
import WorkerJobCard from "./Panel/worker/WorkerJobCard";
import Rating from "./Panel/worker/Rating";

/* Employer (Employee Panel) */
import EmployerSignup from "./Panel/employer/Employee-Signup";
import EmployerProfileForm from "./Panel/employer/EmployeeprofileFrom";
import EmployeeLayout from "./Panel/employer/EmployeeLayout";
import EmployeeDashboard from "./Panel/employer/EmployeeDashboard";
import EmployeeProfile from "./Panel/employer/EmployeeProfile";
import EmployeeJobs from "./Panel/employer/EmployeeJobs";
import EmployeeChatList from "./Panel/employer/EmployeeChatList";
import EmployeeChatPage from "./Panel/employer/EmployeeChatPage";
import Employeemyjobs from "./Panel/employer/Employeemyjobs";
import EmployeemyjobsDetails from "./Panel/employer/EmployeemyjobsDetails";
import PostJobPage from "./Panel/employer/PostJobPage";
import WorkerDetail from "./Panel/employer/WorkerDetails";
import Enquirypage from "./Panel/employer/Enquirypage";

/* Admin */
import AdminLogin from "./Panel/admin/AdminLogin";
import AdminDashboard from "./Panel/admin/AdminDashboard";
import AdminLayout from "./Panel/admin/AdminLayout";
import AdminProtectedRoute from "./component/AdminProtectedRoute";
import WorkerApprovals from "./Panel/admin/WorkerApprovals";
import UserManagement from "./Panel/admin/UserManagement";
import ActiveJobs from "./Panel/admin/ActiveJobs";
import OneDayJobs from "./Panel/admin/OneDayJobs";

/* Protected Routes */
import WorkerProtectedRoute from "./component/WorkerProtectedRoute";
import EmployerProtectedRoute from "./component/EmployerProtectedRoute";

/* Legal Pages */
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsConditions from "./pages/TermsConditions";
import DeleteAccount from "./pages/DeleteAccount";

import OneDayJobPageform from "./Panel/employer/OneDayJobPageform";
import OnedayJobs from "./Panel/employer/OnedayJobs";
import OnedayJob from "./Panel/worker/OnedayJob";
import OneDayJobDetail from "./Panel/worker/OneDayJobDetail";
import Appliedjob from "./Panel/worker/Appliedjob";
import Wallet from "./Panel/worker/Wallet";
import AdminWallet from "./Panel/admin/AdminWallet";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/role-select" element={<RoleSelect />} />

        {/* Legal Pages */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />
          <Route path="/delete" element={<DeleteAccount />} />

        {/* Worker Onboarding */}
        <Route path="/worker-signup" element={<WorkerSignup />} />
        <Route path="/worker-profile" element={<WorkerProfileform />} />
        <Route path="/worker-skills" element={<WorkerSkills />} />
        <Route path="/worker-document" element={<UploadDocuments />} />

        {/* Employer Onboarding */}
        <Route path="/employer-signup" element={<EmployerSignup />} />
        <Route path="/employee-signup" element={<EmployerSignup />} />
        <Route path="/employee-profileform" element={<EmployerProfileForm />} />

        {/* Worker Panel */}
        <Route
          element={
            <WorkerProtectedRoute>
              <WorkerLayout />
            </WorkerProtectedRoute>
          }
        >
          <Route path="/worker-dashboard" element={<WorkerDashboard />} />
          <Route path="/worker/profile" element={<WorkerProfile />} />
          <Route path="/worker/jobs" element={<WorkerFindJobs />} />
          <Route path="/worker/job/:id" element={<WorkerJobCard />} />
          <Route path="/worker/chats" element={<WorkerChatList />} />
          <Route path="/worker/chat/:employerId" element={<WorkerChatPage />} />
          <Route path="/worker/history" element={<WorkerJobHistory />} />
          <Route path="/worker/onedayjob" element={<OnedayJob />} />
           <Route path="/worker/appliedjob" element={<Appliedjob />} />
             <Route path="/worker/wallet" element={<Wallet/>} />
          <Route path="/worker/onedayjob/:id" element={<OneDayJobDetail />} />
          <Route path="/worker/rating" element={<Rating />} />
        </Route>

        {/* Employer Panel */}
        <Route
          element={
            <EmployerProtectedRoute>
              <EmployeeLayout />
            </EmployerProtectedRoute>
          }
        >
          <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
          <Route path="/employer/post-job" element={<PostJobPage />} />
          <Route path="/employer/one-day" element={<OneDayJobPageform />} />
           <Route path="/employer/one-dayjob" element={<OnedayJobs />} />
          <Route path="/employee/profile" element={<EmployeeProfile />} />
          <Route path="/employee/jobs" element={<EmployeeJobs />} />
          <Route path="/employee/workerdetail" element={<WorkerDetail />} />
          <Route path="/employee/chats" element={<EmployeeChatList />} />
          <Route path="/employee/chat/:workerId" element={<EmployeeChatPage />} />
          <Route path="/employee/myjobs" element={<Employeemyjobs />} />
          <Route path="/employee/myjobs/:jobId" element={<EmployeemyjobsDetails />} />
          <Route path="/employee/enquiry" element={<Enquirypage />} />
        </Route>

        {/* Admin Redirect */}
        <Route
          path="/admin"
          element={
            localStorage.getItem("adminToken")
              ? <Navigate to="/admin-dashboard" replace />
              : <Navigate to="/admin-login" replace />
          }
        />

        {/* Admin Login */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Admin Panel */}
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/worker-approvals" element={<WorkerApprovals />} />
          <Route path="/admin/user-management" element={<UserManagement />} />
          <Route path="/admin/jobs" element={<ActiveJobs />} />
          <Route path="/admin/one-day-jobs" element={<OneDayJobs />} />
          <Route path="/admin/wallet" element={<AdminWallet />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}
