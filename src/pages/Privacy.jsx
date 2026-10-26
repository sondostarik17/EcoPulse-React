
import { useEffect, useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  UserRound,
  Database,
  Eye,
  EyeOff,
  Bell,
  FileText,
  Trash2,
  LogOut,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  ArrowLeft,
  Leaf,
  Settings,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";

const Privacy = () => {
  const [firstname, setFirstname] = useState(
    localStorage.getItem("Firstname") || ""
  );
  const [lastname, setLastname] = useState(
    localStorage.getItem("Lastname") || ""
  );
  const [email, setEmail] = useState(
    localStorage.getItem("Email") || ""
  );

  const [showEmail, setShowEmail] = useState(false);
  const [notifications, setNotifications] = useState(
    localStorage.getItem("privacyNotifications") !== "false"
  );
  const [profileVisibility, setProfileVisibility] = useState(
    localStorage.getItem("profileVisibility") || "private"
  );

  useEffect(() => {
    const elements = document.querySelectorAll(".privacy-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("privacy-visible");
          } else {
            entry.target.classList.remove("privacy-visible");
          }
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const syncUser = () => {
      setFirstname(localStorage.getItem("Firstname") || "");
      setLastname(localStorage.getItem("Lastname") || "");
      setEmail(localStorage.getItem("Email") || "");
    };

    window.addEventListener("storage", syncUser);

    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const fullName =
    `${firstname} ${lastname}`.trim() || "EcoPulse User";

  const toggleNotifications = (checked) => {
    setNotifications(checked);
    localStorage.setItem("privacyNotifications", String(checked));

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: checked
        ? "Notifications enabled"
        : "Notifications disabled",
      showConfirmButton: false,
      timer: 1800,
      background: "#1b1524",
      color: "#f5f3ff",
    });
  };

  const handleVisibility = (value) => {
    setProfileVisibility(value);
    localStorage.setItem("profileVisibility", value);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Log out?",
      text: "Are you sure you want to log out?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Log Out",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#8b5cf6",
      cancelButtonColor: "#6b7280",
      background: "#17121f",
      color: "#f5f3ff",
    });

    if (result.isConfirmed) {
      localStorage.setItem("isLoggedIn", "false");
      window.location.href = "/login";
    }
  };

  const handleDeleteLocalData = async () => {
    const result = await Swal.fire({
      title: "Clear local EcoPulse data?",
      text: "This removes locally saved reports, the profile picture, and local privacy preferences from this browser. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Clear Local Data",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      background: "#17121f",
      color: "#f5f3ff",
    });

    if (!result.isConfirmed) return;

    // Clear only the app data listed here.
    // Account credentials and unrelated browser data are preserved.
    [
      "allReports",
      "userProfilePic",
      "privacyNotifications",
      "profileVisibility",
    ].forEach((key) => localStorage.removeItem(key));

    setNotifications(true);
    setProfileVisibility("private");

    window.dispatchEvent(new Event("reportsUpdated"));

    await Swal.fire({
      icon: "success",
      title: "Local data cleared",
      text: "The selected local data has been removed from this browser.",
      confirmButtonColor: "#8b5cf6",
      background: "#17121f",
      color: "#f5f3ff",
    });
  };

  return (
    <>
      <style>{`
        .privacy-reveal {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity .6s ease, transform .6s ease;
        }

        .privacy-reveal.privacy-visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .privacy-reveal,
          .privacy-reveal.privacy-visible {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>

      <main className="min-h-screen overflow-x-clip bg-[#f7f5fa] px-4 py-6 text-gray-900 transition-colors duration-300 dark:bg-[#100d16] dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">

          {/* Header */}
          <header className="privacy-reveal flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => (window.location.href = "/profile")}
                className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300"
              >
                <ArrowLeft size={17} />
                Back to Profile
              </button>

              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400">
                <ShieldCheck size={18} />
                <span>Account Protection</span>
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Privacy & Security
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                Manage your privacy preferences and learn how your
                EcoPulse account data is handled.
              </p>
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-purple-200 bg-purple-100 text-purple-700 dark:border-purple-400/20 dark:bg-purple-500/15 dark:text-purple-300">
              <ShieldCheck size={28} />
            </div>
          </header>

          {/* Security Status */}
          <section className="privacy-reveal rounded-3xl border border-purple-200/70 bg-white p-5 shadow-sm dark:border-purple-400/15 dark:bg-[#17121f] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckCircle2 size={25} />
                </div>

                <div>
                  <h2 className="font-bold">Your Privacy Center</h2>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    Review the settings available on this device.
                  </p>
                </div>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Preferences Available
              </span>
            </div>
          </section>

          {/* Account Information */}
          <section className="privacy-reveal rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#17121f] sm:p-7">
            <SectionHeading
              icon={<UserRound size={20} />}
              title="Account Information"
              subtitle="Review the basic information saved for your profile."
            />

            <div className="mt-5 space-y-3">
              <SettingRow
                icon={<UserRound size={19} />}
                title="Full Name"
                description={fullName}
              />

              <div className="flex items-center gap-3 rounded-2xl border border-gray-200/80 p-4 dark:border-white/10">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                  <Fingerprint size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold">Email Address</h3>
                  <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                    {email
                      ? showEmail
                        ? email
                        : email.replace(/^(.{2}).*(@.*)$/, "$1••••$2")
                      : "No email saved"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEmail((value) => !value)}
                  aria-label={showEmail ? "Hide email" : "Show email"}
                  className="shrink-0 rounded-xl p-2 text-gray-500 transition hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
                >
                  {showEmail ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>
          </section>

          {/* Privacy Preferences */}
          <section className="privacy-reveal rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#17121f] sm:p-7">
            <SectionHeading
              icon={<LockKeyhole size={20} />}
              title="Privacy Preferences"
              subtitle="Choose how these preferences should behave in this browser."
            />

            <div className="mt-5 space-y-3">
              <SettingRow
                icon={<Eye size={19} />}
                title="Profile Visibility"
                description="Choose your preferred visibility setting."
              >
                <select
                  value={profileVisibility}
                  onChange={(event) => handleVisibility(event.target.value)}
                  className="max-w-[145px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-purple-400 dark:border-white/10 dark:bg-[#100d16]"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
              </SettingRow>

              <SettingRow
                icon={<Bell size={19} />}
                title="Notifications Preference"
                description="Save your preference for notifications on this device."
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications}
                  onClick={() => toggleNotifications(!notifications)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    notifications ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                      notifications ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </SettingRow>
            </div>
          </section>

          {/* Data Management */}
          <section className="privacy-reveal rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#17121f] sm:p-7">
            <SectionHeading
              icon={<Database size={20} />}
              title="Data Management"
              subtitle="Understand and manage data saved locally by this version of EcoPulse."
            />

            <div className="mt-5 space-y-3">
              <SettingRow
                icon={<FileText size={19} />}
                title="Saved Reports"
                description="Report information may be stored in this browser."
              />

              <SettingRow
                icon={<UserRound size={19} />}
                title="Profile Picture"
                description="Your selected profile picture may be saved locally."
              />

              <div className="flex items-start gap-3 rounded-2xl border border-blue-200/70 bg-blue-50/70 p-4 dark:border-blue-400/15 dark:bg-blue-500/[0.06]">
                <Info size={19} className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-300" />
                <p className="text-sm leading-relaxed text-blue-900/80 dark:text-blue-200/80">
                  These settings do not change server-side data or guarantee
                  that information has been deleted from a database. Server
                  data must be managed through the backend.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDeleteLocalData}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-red-200/80 p-4 text-start transition hover:bg-red-50 dark:border-red-400/15 dark:hover:bg-red-500/[0.06]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                    <Trash2 size={19} />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-300">
                      Clear Local Data
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                      Remove selected EcoPulse data from this browser.
                    </p>
                  </div>
                </div>

                <ChevronLeft
                  size={18}
                  className="shrink-0 text-red-400"
                />
              </button>
            </div>
          </section>

          {/* Sign Out */}
          <section className="privacy-reveal rounded-3xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#17121f] sm:p-7">
            <SectionHeading
              icon={<LogOut size={20} />}
              title="Session Management"
              subtitle="Sign out of your current EcoPulse session on this device."
            />

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 flex w-full items-center justify-between gap-3 rounded-2xl border border-gray-200 p-4 text-start transition hover:border-red-200 hover:bg-red-50 dark:border-white/10 dark:hover:border-red-400/20 dark:hover:bg-red-500/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300">
                  <LogOut size={19} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Log Out</h3>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    End your current session.
                  </p>
                </div>
              </div>

              <ChevronLeft size={18} className="text-gray-400" />
            </button>
          </section>

          {/* Security Notice */}
          <section className="privacy-reveal flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4 dark:border-amber-400/15 dark:bg-amber-500/[0.06]">
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />

            <div>
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Security Notice
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-amber-900/75 dark:text-amber-100/70">
                Password changes, account deletion, and server-side privacy
                controls require backend support. This page only manages the
                local preferences implemented above.
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer className="privacy-reveal flex flex-col items-center justify-between gap-2 border-t border-gray-200 py-5 text-center text-xs text-gray-500 dark:border-white/10 dark:text-gray-500 sm:flex-row">
            <p>© {new Date().getFullYear()} EcoPulse. All rights reserved.</p>

            <p className="flex items-center gap-1.5">
              Your privacy matters
              <Leaf size={14} className="text-emerald-500" />
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function SettingRow({ icon, title, description, children }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200/80 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 shrink-0 text-purple-600 dark:text-purple-400">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 break-words text-sm leading-relaxed text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>

      {children && <div className="shrink-0 self-end sm:self-center">{children}</div>}
    </div>
  );
}

export default Privacy;
