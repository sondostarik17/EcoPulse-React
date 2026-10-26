import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  Leaf,
  Sprout,
  Recycle,
  ShieldCheck,
} from "lucide-react";

import MainLayout from "./layouts/MainLayout";

// User pages
import Home from "./pages/Home";
import Awareness from "./pages/Awareness";
import ReportWaste from "./pages/ReportWaste";
import TrackReports from "./pages/TrackReports";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";

// Admin pages
import AdminLayout from "./admin/AdminLayout";
import Overview from "./admin/pages/Overview";
import ReportsManagement from "./admin/pages/ReportsManagement";
import UsersManagement from "./admin/pages/UsersManagement";
import Analytics from "./admin/pages/Analytics";
import AdminSettings from "./admin/pages/AdminSettings";

function App() {
  const location = useLocation();

  const [splashPhase, setSplashPhase] = useState("loading");

  const previousPath = useRef(location.pathname);

  // Initial loading animation.
  useEffect(() => {
    const exitTimer = window.setTimeout(() => {
      setSplashPhase("exiting");
    }, 1700);

    const hideTimer = window.setTimeout(() => {
      setSplashPhase("hidden");
    }, 2200);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  // Show the loading screen when entering the main website
  // or crossing into/out of the admin area.
  useEffect(() => {
    const oldPath = previousPath.current;
    const newPath = location.pathname;

    if (oldPath === newPath) return;

    previousPath.current = newPath;

    const wasAdmin = oldPath.startsWith("/admin");
    const isAdmin = newPath.startsWith("/admin");

    const shouldShowSplash =
      newPath === "/" ||
      newPath === "/admin" ||
      wasAdmin !== isAdmin;

    if (!shouldShowSplash) return;

    setSplashPhase("loading");

    const exitTimer = window.setTimeout(() => {
      setSplashPhase("exiting");
    }, 1700);

    const hideTimer = window.setTimeout(() => {
      setSplashPhase("hidden");
    }, 2200);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  const isAdminArea = location.pathname.startsWith("/admin");

  return (
    <>
      {/* Application routes */}
      <Routes>
        {/* User website */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/awareness" element={<Awareness />} />
          <Route path="/report" element={<ReportWaste />} />
          <Route path="/track" element={<TrackReports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* User authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Other pages */}
        <Route path="/privacy" element={<Privacy />} />

        {/* Separate admin login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Overview />} />

          <Route
            path="reports"
            element={<ReportsManagement />}
          />

          <Route
            path="users"
            element={<UsersManagement />}
          />

          <Route
            path="analytics"
            element={<Analytics />}
          />

          <Route
            path="settings"
            element={<AdminSettings />}
          />
        </Route>

        {/* Old dashboard URL */}
        <Route
          path="/dashboard"
          element={<Navigate to="/admin" replace />}
        />

        {/* Unknown URLs */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>

      {/* Premium loading screen */}
      {splashPhase !== "hidden" && (
        <div
          role="status"
          aria-live="polite"
          aria-label="Loading EcoPulse"
          className={`fixed inset-0 z-[99999] flex items-center justify-center overflow-hidden bg-[#050806] text-white transition-opacity duration-500 ${
            splashPhase === "exiting"
              ? "pointer-events-none opacity-0"
              : "opacity-100"
          }`}
        >
          <style>{`
            @keyframes ecoGlow {
              0%, 100% {
                transform: scale(1);
                opacity: .45;
              }
              50% {
                transform: scale(1.15);
                opacity: .8;
              }
            }

            @keyframes ecoOrbit {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            @keyframes ecoProgress {
              0% { width: 0%; }
              35% { width: 38%; }
              70% { width: 76%; }
              100% { width: 100%; }
            }

            @keyframes ecoFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-7px); }
            }

            @keyframes ecoDot {
              0%, 80%, 100% { opacity: .25; }
              40% { opacity: 1; }
            }

            .eco-glow {
              animation: ecoGlow 2.8s ease-in-out infinite;
            }

            .eco-orbit {
              animation: ecoOrbit 8s linear infinite;
            }

            .eco-float {
              animation: ecoFloat 2.4s ease-in-out infinite;
            }

            .eco-progress {
              animation: ecoProgress 1.7s cubic-bezier(.65,0,.35,1) forwards;
            }

            .eco-dot-1 {
              animation: ecoDot 1.4s infinite;
            }

            .eco-dot-2 {
              animation: ecoDot 1.4s .2s infinite;
            }

            .eco-dot-3 {
              animation: ecoDot 1.4s .4s infinite;
            }

            @media (prefers-reduced-motion: reduce) {
              .eco-glow,
              .eco-orbit,
              .eco-float,
              .eco-progress,
              .eco-dot-1,
              .eco-dot-2,
              .eco-dot-3 {
                animation-duration: .01ms;
                animation-iteration-count: 1;
              }
            }
          `}</style>

          {/* Background effects */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="eco-glow absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.10] blur-[110px]" />

            <div className="eco-glow absolute -bottom-40 -right-40 h-[460px] w-[460px] rounded-full bg-green-400/[0.08] blur-[120px]" />

            <div
              className="absolute inset-0 opacity-[0.035]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />

            <div className="absolute left-1/2 top-1/2 h-[440px] w-[440px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/[0.05]" />

            <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] max-w-[75vw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/[0.07]" />
          </div>

          {/* Loading content */}
          <div className="relative z-10 mx-4 flex w-full max-w-md flex-col items-center text-center">
            {/* Animated logo */}
            <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
              <div className="absolute inset-0 rounded-[32px] bg-emerald-400/10 blur-xl" />

              <div className="eco-orbit absolute inset-0 rounded-[32px] border border-emerald-400/25">
                <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(52,211,153,.9)]" />
              </div>

              <div className="eco-float relative flex h-[82px] w-[82px] items-center justify-center rounded-[25px] border border-emerald-300/25 bg-gradient-to-br from-[#193b28] to-[#0b1710] shadow-[0_0_60px_rgba(16,185,129,.13)]">
                {isAdminArea ? (
                  <ShieldCheck
                    size={40}
                    strokeWidth={1.6}
                    className="text-emerald-300"
                  />
                ) : (
                  <Leaf
                    size={42}
                    strokeWidth={1.6}
                    className="text-emerald-300"
                  />
                )}

                <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-lg border border-[#102219] bg-emerald-400 text-[#06130b]">
                  <Recycle size={16} />
                </span>
              </div>
            </div>

            {/* Brand */}
            <p className="text-3xl font-black tracking-[-1px] sm:text-4xl">
              Eco<span className="text-emerald-400">Pulse</span>
            </p>

            <p className="mt-3 text-[10px] font-bold uppercase tracking-[4px] text-gray-500 sm:text-xs">
              Cleaner communities
            </p>

            <div className="mt-8 flex items-center gap-2">
              <span className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-400/50" />

              <span className="text-xs font-semibold tracking-wide text-emerald-300">
                {isAdminArea
                  ? "Preparing Admin Workspace"
                  : "A Cleaner City Starts Here"}
              </span>

              <span className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>

            <p className="mt-3 text-xs text-gray-500">
              {isAdminArea
                ? "Preparing your dashboard and reports"
                : "Preparing your EcoPulse experience"}
              <span className="eco-dot-1 ml-1 inline-block">.</span>
              <span className="eco-dot-2 inline-block">.</span>
              <span className="eco-dot-3 inline-block">.</span>
            </p>

            {/* Progress bar */}
            <div className="mt-9 w-full max-w-[260px]">
              <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                <div className="eco-progress h-full rounded-full bg-gradient-to-r from-emerald-700 via-emerald-400 to-lime-300 shadow-[0_0_14px_rgba(52,211,153,.5)]" />
              </div>

              <div className="mt-3 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[2px] text-gray-600">
                <span>EcoPulse System</span>
                <span className="text-emerald-400/80">
                  Loading
                </span>
              </div>
            </div>

            {/* Bottom caption */}
            <div className="mt-12 flex items-center gap-2 text-[10px] tracking-wide text-gray-600">
              <Sprout size={13} className="text-emerald-500/70" />
              <span>Together for a cleaner environment</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;