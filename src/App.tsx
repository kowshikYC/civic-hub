import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Events from "./pages/Events";
import Issues from "./pages/Issues";
import ReportIssue from "./pages/ReportIssue";
import Profile from "./pages/Profile";
import LoginSelection from "./pages/LoginSelection";
import ReporterLogin from "./pages/ReporterLogin";
import SolverLogin from "./pages/SolverLogin";
import NGOIssues from "./pages/NGOIssues";
import ReporterSignup from "./pages/ReporterSignup";
import SolverSignup from "./pages/SolverSignup";
import EventHandlerLogin from "./pages/EventHandlerLogin";
import EventHandlerDashboard from "./pages/EventHandlerDashboard";
import EventHandlerSignup from "./pages/EventHandlerSignup";
import Redeem from "./pages/Redeem";
import MapView from "./pages/MapView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/events" element={<Events />} />
            <Route path="/issues" element={<Issues />} />
            <Route path="/report" element={<ReportIssue />} />
            <Route path="/redeem" element={<Redeem />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<LoginSelection />} />
            <Route path="/login/reporter" element={<ReporterLogin />} />
            <Route path="/login/solver" element={<SolverLogin />} />
            <Route path="/login/event-handler" element={<EventHandlerLogin />} />
            <Route path="/ngo/issues" element={<NGOIssues />} />
            <Route path="/event-handler/dashboard" element={<EventHandlerDashboard />} />
            <Route path="/register/reporter" element={<ReporterSignup />} />
            <Route path="/register/solver" element={<SolverSignup />} />
            <Route path="/register/event-handler" element={<EventHandlerSignup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
