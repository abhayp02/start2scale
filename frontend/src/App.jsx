import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import OperationalPage from "./pages/OperationalPage.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AnalyticsDashboard from "./pages/dashboard/AnalyticsDashboard.jsx";
import GovernmentDashboard from "./pages/dashboard/GovernmentDashboard.jsx";
import PaymentsDue from "./pages/dashboard/PaymentsDue.jsx";
import StartupDashboard from "./pages/dashboard/StartupDashboard.jsx";
import AIMatching from "./pages/department/AIMatching.jsx";
import CreateChallenge from "./pages/department/CreateChallenge.jsx";
import MyChallenges from "./pages/department/MyChallenges.jsx";
import EligibilityCheck from "./pages/evaluation/EligibilityCheck.jsx";
import ScoreApplications from "./pages/evaluation/ScoreApplications.jsx";
import KPIUpdate from "./pages/pilots/KPIUpdate.jsx";
import MilestoneTracker from "./pages/pilots/MilestoneTracker.jsx";
import PilotDetail from "./pages/pilots/PilotDetail.jsx";
import PilotList from "./pages/pilots/PilotList.jsx";
import Apply from "./pages/startup/Apply.jsx";
import BrowseChallenges from "./pages/startup/BrowseChallenges.jsx";
import MyApplications from "./pages/startup/MyApplications.jsx";
import GenerateContract from "./pages/templates/GenerateContract.jsx";
import TemplateLibrary from "./pages/templates/TemplateLibrary.jsx";

function AccountHome() {
  const { user } = useAuth();
  return user.role === "startup" ? (
    <StartupDashboard />
  ) : (
    <GovernmentDashboard />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/welcome" element={<Navigate to="/" replace />} />
          <Route path="/explore" element={<BrowseChallenges publicView />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/government/login"
            element={<Login portal="government" />}
          />
          <Route path="/startup/login" element={<Login portal="startup" />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<AccountHome />} />
              <Route path="/matching" element={<AIMatching />} />
              <Route path="/recommendations" element={<BrowseChallenges />} />
              <Route path="/pilots" element={<PilotList />} />
              <Route path="/pilots/:pilotId" element={<PilotDetail />} />
              <Route
                path="/pilots/:pilotId/milestones"
                element={<MilestoneTracker />}
              />
              <Route path="/pilots/:pilotId/kpis" element={<KPIUpdate />} />
              <Route path="/templates" element={<TemplateLibrary />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route
                path="/scale-up"
                element={<OperationalPage title="Scale-Up" />}
              />
              <Route
                path="/reports"
                element={<OperationalPage title="Reports" />}
              />
              <Route
                path="/audit"
                element={<OperationalPage title="Audit Trail" />}
              />
              <Route
                path="/notifications"
                element={<OperationalPage title="Notifications" />}
              />
              <Route
                path="/settings"
                element={<OperationalPage title="Settings" />}
              />
              <Route
                path="/company-profile"
                element={<OperationalPage title="Company Profile" />}
              />
              <Route
                path="/documents"
                element={<OperationalPage title="Documents" />}
              />
              <Route
                path="/payments-status"
                element={<OperationalPage title="Payments" />}
              />
              <Route
                path="/evaluation-status"
                element={<OperationalPage title="Evaluations" />}
              />

              <Route element={<ProtectedRoute allowedRoles={["government"]} />}>
                <Route
                  path="/department/challenges/new"
                  element={<CreateChallenge />}
                />
                <Route
                  path="/department/challenges"
                  element={<MyChallenges />}
                />
                <Route path="/payments" element={<PaymentsDue />} />
                <Route
                  path="/contracts/generate"
                  element={<GenerateContract />}
                />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["startup"]} />}>
                <Route path="/challenges" element={<BrowseChallenges />} />
                <Route
                  path="/challenges/:challengeId/apply"
                  element={<Apply />}
                />
                <Route path="/applications" element={<MyApplications />} />
              </Route>
              <Route
                element={
                  <ProtectedRoute
                    allowedRoles={["government", "evaluator", "admin"]}
                  />
                }
              >
                <Route
                  path="/evaluation/eligibility"
                  element={<EligibilityCheck />}
                />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={["evaluator"]} />}>
                <Route
                  path="/evaluation/score"
                  element={<ScoreApplications />}
                />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
