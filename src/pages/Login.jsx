import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "../all.css";

const ADMIN_EMAIL = "admin@ecopulse.com";
const ADMIN_PASSWORD = "Admin@123";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminLogin =
    location.pathname === "/admin/login" ||
    location.state?.role === "admin";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-2.5 w-full rounded-xl border border-white/10 bg-[#090D0C] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  const login = (event) => {
    event.preventDefault();
    setError("");

    const value = identifier.trim().toLowerCase();

    if (!value || !password) {
      setError("Please enter your login details.");
      return;
    }

    // Separate administrator login.
    if (isAdminLogin) {
      if (
        value === ADMIN_EMAIL &&
        password === ADMIN_PASSWORD
      ) {
        setLoading(true);

        localStorage.setItem("Role", "admin");
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("isAdminLoggedIn", "true");

        localStorage.setItem("Firstname", "Administrator");
        localStorage.setItem("Lastname", "EcoPulse");
        localStorage.setItem("Email", ADMIN_EMAIL);
        localStorage.setItem("Phone", "Admin Account");

        window.dispatchEvent(new Event("authChanged"));

        navigate("/admin", { replace: true });
        return;
      }

      setError("Incorrect administrator email or password.");
      return;
    }

    // User login.
    let users = [];

    try {
      const savedUsers = JSON.parse(
        localStorage.getItem("ecopulseUsers") || "[]"
      );

      users = Array.isArray(savedUsers) ? savedUsers : [];
    } catch {
      setError("Unable to read account data. Please try again.");
      return;
    }

    const matchesIdentifier = (user) =>
      user.email?.trim().toLowerCase() === value ||
      user.firstName?.trim().toLowerCase() === value;

    const registeredRecord = users.find(
      (user) =>
        user.role !== "admin" &&
        user.active !== false &&
        matchesIdentifier(user) &&
        user.password === password
    );

    // Do not let a disabled account bypass the check using legacy data.
    const disabledAccountExists = users.some(
      (user) =>
        user.role !== "admin" &&
        user.active === false &&
        matchesIdentifier(user)
    );

    let account = registeredRecord;

    // Compatibility with accounts created by the older Register.jsx.
    if (!account && !disabledAccountExists) {
      const legacyRole = localStorage.getItem("Role");
      const legacyName = (
        localStorage.getItem("Firstname") || ""
      ).trim().toLowerCase();
      const legacyEmail = (
        localStorage.getItem("Email") || ""
      ).trim().toLowerCase();
      const legacyPassword = localStorage.getItem("Password") || "";

      const legacyAccountMatches =
        legacyRole !== "admin" &&
        localStorage.getItem("legacyUserActive") !== "false" &&
        legacyPassword === password &&
        (legacyName === value || legacyEmail === value);

      if (legacyAccountMatches) {
        account = {
          firstName: localStorage.getItem("Firstname") || "",
          lastName: localStorage.getItem("Lastname") || "",
          email: localStorage.getItem("Email") || "",
          phone: localStorage.getItem("Phone") || "",
          profilePic: localStorage.getItem("userProfilePic") || "",
          role: "user",
        };
      }
    }

    if (!account) {
      setError(
        "Incorrect email/username or password. Check your details or create an account."
      );
      return;
    }

    setLoading(true);

    // Restore the selected user's profile for the existing Profile page.
    localStorage.setItem("Firstname", account.firstName || "");
    localStorage.setItem("Lastname", account.lastName || "");
    localStorage.setItem("Email", account.email || "");
    localStorage.setItem("Phone", account.phone || "");
    localStorage.setItem("Role", "user");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAdminLoggedIn", "false");

    if (account.profilePic) {
      localStorage.setItem("userProfilePic", account.profilePic);
    } else {
      localStorage.removeItem("userProfilePic");
    }

    // Keep old local login code working if it reads Password.
    if (account.password) {
      localStorage.setItem("Password", account.password);
    } else {
      localStorage.removeItem("Password");
    }

    window.dispatchEvent(new Event("authChanged"));

    navigate("/", { replace: true });
  };

  const guestLogin = () => {
    localStorage.setItem("Role", "user");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("isAdminLoggedIn", "false");
    localStorage.setItem("Firstname", "Guest");
    localStorage.setItem("Lastname", "Explorer");
    localStorage.setItem("Email", "guest@ecopulse.com");
    localStorage.setItem("Phone", "");

    window.dispatchEvent(new Event("authChanged"));

    navigate("/", { replace: true });
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#060908] px-4 py-8 text-white sm:px-6">
      <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-emerald-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-green-500/[0.08] blur-[110px]" />

      <div className="relative z-10 w-full max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-400 transition hover:text-emerald-400"
        >
          <ArrowLeft size={17} />
          Back to EcoPulse
        </Link>

        <div className="grid overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#0B0F0D] shadow-2xl shadow-black/40 lg:grid-cols-[1fr_0.82fr]">
          {/* Login form */}
          <section className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/15">
                <Leaf size={23} strokeWidth={2.5} />
              </div>

              <div>
                <p className="text-xl font-black tracking-tight">
                  Eco<span className="text-emerald-400">Pulse</span>
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[2.5px] text-gray-500">
                  Cleaner communities
                </p>
              </div>
            </div>

            <div className="mb-7">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-semibold text-emerald-300">
                {isAdminLogin ? (
                  <ShieldCheck size={14} />
                ) : (
                  <UserRound size={14} />
                )}

                {isAdminLogin ? "Administrator access" : "User account"}
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                {isAdminLogin ? "Admin " : "Welcome "}
                <span className="text-emerald-400">
                  {isAdminLogin ? "Sign In." : "back."}
                </span>
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                {isAdminLogin
                  ? "Sign in with authorized administrator credentials to manage EcoPulse."
                  : "Sign in to report waste, track cleanup requests, and help create cleaner streets."}
              </p>
            </div>

            {location.state?.registered && !isAdminLogin && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] p-3 text-sm text-emerald-300">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                <span>
                  Account created successfully. You can sign in now.
                </span>
              </div>
            )}

            <form onSubmit={login} className="space-y-5">
              <label className="block text-sm font-semibold text-gray-300">
                {isAdminLogin ? "Admin email" : "Email or first name"}

                <span className="relative block">
                  <Mail
                    size={18}
                    className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                  />

                  <input
                    required
                    type={isAdminLogin ? "email" : "text"}
                    autoComplete="username"
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      setError("");
                    }}
                    placeholder={
                      isAdminLogin
                        ? "admin@ecopulse.com"
                        : "Enter your email or first name"
                    }
                    className={`${inputClass} pl-11`}
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-gray-300">
                Password

                <span className="relative block">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                  />

                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
                    className={`${inputClass} pl-11 pr-11`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-3 top-[26px] -translate-y-1/2 text-gray-500 transition hover:text-emerald-400"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </span>
              </label>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-sm text-red-300"
                >
                  <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-4 text-sm font-extrabold text-gray-950 shadow-lg shadow-emerald-500/10 transition hover:-translate-y-0.5 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Signing in..."
                  : isAdminLogin
                    ? "Open Admin Dashboard"
                    : "Sign In"}

                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>

              {!isAdminLogin && (
                <button
                  type="button"
                  onClick={guestLogin}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3.5 text-sm font-semibold text-gray-300 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.04] hover:text-white"
                >
                  Continue as Guest
                </button>
              )}

              <div className="pt-1 text-center text-sm text-gray-400">
                {isAdminLogin ? (
                  <Link
                    to="/login"
                    className="font-bold text-emerald-400 transition hover:text-emerald-300"
                  >
                    Back to User Login
                  </Link>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-bold text-emerald-400 transition hover:text-emerald-300"
                    >
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            </form>
          </section>

          {/* Decorative panel */}
          <aside className="relative hidden flex-col justify-between overflow-hidden border-l border-white/[0.07] bg-[#0E1712] p-10 lg:flex xl:p-12">
            <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full border border-emerald-400/10" />
            <div className="pointer-events-none absolute -right-8 top-28 h-44 w-44 rounded-full border border-emerald-400/[0.08]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                {isAdminLogin ? (
                  <ShieldCheck size={28} />
                ) : (
                  <Leaf size={28} />
                )}
              </div>

              <h2 className="mt-8 max-w-sm text-3xl font-black leading-tight xl:text-4xl">
                {isAdminLogin ? (
                  <>
                    Your workspace.
                    <br />
                    <span className="text-emerald-400">Your impact.</span>
                  </>
                ) : (
                  <>
                    A cleaner city
                    <br />
                    starts with
                    <span className="text-emerald-400"> you.</span>
                  </>
                )}
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                {isAdminLogin
                  ? "Review reports, monitor cleanup progress, and manage EcoPulse operations."
                  : "Report dirty locations, follow cleanup progress, and become part of a cleaner community."}
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Submit reports about dirty locations",
                  "Track your cleanup requests",
                  "Support a cleaner community",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-400"
                    />
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-12 rounded-2xl border border-white/[0.08] bg-black/20 p-5">
              <p className="text-sm font-bold text-white">
                One community, one goal.
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-400">
                Every report is a step toward a cleaner environment.
              </p>
            </div>
          </aside>
        </div>

        <p className="mt-5 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} EcoPulse. Together for a cleaner
          environment.
        </p>
      </div>
    </main>
  );
}