import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  CheckCircle2,
  ShieldCheck,
  Sprout,
  AlertCircle,
} from "lucide-react";
import "../all.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "mt-2.5 w-full rounded-xl border border-white/10 bg-[#090D0C] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10";

  const update = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

  const register = (event) => {
    event.preventDefault();
    setError("");

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!firstName || !lastName || !email) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

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

    const emailExists = users.some(
      (user) => user.email?.trim().toLowerCase() === email
    );

    const legacyEmail = (
      localStorage.getItem("Email") || ""
    ).trim().toLowerCase();

    const legacyAccountExists =
      localStorage.getItem("Role") !== "admin" &&
      legacyEmail === email;

    if (emailExists || legacyAccountExists) {
      setError("This email is already registered. Please log in.");
      return;
    }

    const newUser = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `user-${Date.now()}`,
      firstName,
      lastName,
      email,
      phone,
      password: form.password,
      role: "user",
      active: true,
      createdAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "ecopulseUsers",
        JSON.stringify([...users, newUser])
      );

      // Registration never grants an admin role.
      localStorage.setItem("isLoggedIn", "false");
      localStorage.setItem("isAdminLoggedIn", "false");

      setLoading(true);

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch {
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
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
          {/* Register form */}
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
                <UserRound size={14} />
                Create a user account
              </span>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                Join the
                <span className="text-emerald-400"> movement.</span>
              </h1>

              <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                Create an account to report dirty locations, track cleanup
                requests, and help build cleaner streets.
              </p>
            </div>

            <form onSubmit={register} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-300">
                  First name
                  <input
                    required
                    name="firstName"
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={update}
                    placeholder="Enter first name"
                    className={inputClass}
                  />
                </label>

                <label className="block text-sm font-semibold text-gray-300">
                  Last name
                  <input
                    required
                    name="lastName"
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={update}
                    placeholder="Enter last name"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className="block text-sm font-semibold text-gray-300">
                Email address
                <span className="relative block">
                  <Mail
                    size={18}
                    className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                  />

                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={update}
                    placeholder="you@example.com"
                    className={`${inputClass} pl-11`}
                  />
                </span>
              </label>

              <label className="block text-sm font-semibold text-gray-300">
                Phone number
                <span className="relative block">
                  <Phone
                    size={18}
                    className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                  />

                  <input
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={update}
                    placeholder="Enter phone number"
                    className={`${inputClass} pl-11`}
                  />
                </span>
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Password
                  <span className="relative block">
                    <LockKeyhole
                      size={17}
                      className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                    />

                    <input
                      required
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      minLength={6}
                      value={form.password}
                      onChange={update}
                      placeholder="At least 6 characters"
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

                <label className="block text-sm font-semibold text-gray-300">
                  Confirm password
                  <span className="relative block">
                    <LockKeyhole
                      size={17}
                      className="absolute left-4 top-[26px] -translate-y-1/2 text-gray-500"
                    />

                    <input
                      required
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={form.confirmPassword}
                      onChange={update}
                      placeholder="Repeat password"
                      className={`${inputClass} pl-11 pr-11`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-[26px] -translate-y-1/2 text-gray-500 transition hover:text-emerald-400"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </span>
                </label>
              </div>

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
                {loading ? "Creating account..." : "Create Account"}

                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                )}
              </button>

              <p className="pt-2 text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-emerald-400 transition hover:text-emerald-300"
                >
                  Sign in
                </Link>
              </p>
            </form>

            <p className="mt-7 text-center text-[11px] leading-5 text-gray-600">
              User registration only. Administrator access is managed
              separately.
            </p>
          </section>

          {/* Decorative panel */}
          <aside className="relative hidden flex-col justify-between overflow-hidden border-l border-white/[0.07] bg-[#0E1712] p-10 lg:flex xl:p-12">
            <div className="pointer-events-none absolute -right-20 top-16 h-64 w-64 rounded-full border border-emerald-400/10" />
            <div className="pointer-events-none absolute -right-8 top-28 h-44 w-44 rounded-full border border-emerald-400/[0.08]" />
            <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-emerald-500/[0.07] blur-3xl" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <Sprout size={28} />
              </div>

              <h2 className="mt-8 max-w-sm text-3xl font-black leading-tight xl:text-4xl">
                Small actions.
                <br />
                <span className="text-emerald-400">Cleaner future.</span>
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
                Your reports help organize cleanup efforts and make
                neighborhoods cleaner, one location at a time.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  "Report waste in your area",
                  "Track the progress of reports",
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
              <ShieldCheck size={22} className="text-emerald-400" />

              <p className="mt-3 text-sm font-bold text-white">
                One community, one goal.
              </p>

              <p className="mt-1 text-xs leading-5 text-gray-400">
                Work together to keep our streets clean and our environment
                healthy.
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