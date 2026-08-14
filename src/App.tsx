import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import SplashIntro from "@/components/SplashIntro";
import Home from "./pages/Home.tsx";
import Auth from "./pages/Auth.tsx";
import CreateEvent from "./pages/CreateEvent.tsx";
import EventPage from "./pages/EventPage.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const Protected = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[100dvh] bg-background" />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const Landing = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-[100dvh] bg-background" />;
  return user ? <Home /> : <Auth />;
};

const AppShell = () => {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem("mv_splash_seen"),
  );

  useEffect(() => {
    if (!showSplash) return;
    const t = setTimeout(() => {
      sessionStorage.setItem("mv_splash_seen", "1");
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(t);
  }, [showSplash]);

  return (
    <>
      <AnimatePresence>{showSplash && <SplashIntro />}</AnimatePresence>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/create"
          element={
            <Protected>
              <CreateEvent />
            </Protected>
          }
        />
        <Route path="/event/:eventId" element={<EventPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/organizer/:eventId" element={<OrganizerDashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
