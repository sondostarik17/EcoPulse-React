import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Camera,
  Mail,
  Phone,
  House,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Clock,
  LogOut,
  UserRound,
  ArrowUpRight,
  Leaf,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";

export default function Profile() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const fileInputRef = useRef(null);

  const [user, setUser] = useState({
    firstName: localStorage.getItem("Firstname") || "",
    lastName: localStorage.getItem("Lastname") || "",
    email: localStorage.getItem("Email") || "",
    phone: localStorage.getItem("Phone") || "",
    profilePic: localStorage.getItem("userProfilePic") || "",
  });

  const [language, setLanguage] = useState(
    localStorage.getItem("selectedLang") || "en"
  );

  const [reports, setReports] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("allReports") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);

  const isArabic = language === "ar";

  const t = {
    title: isArabic ? "ملفي الشخصي" : "My Profile",
    subtitle: isArabic
      ? "مساحتك الشخصية في مجتمع أنظف"
      : "Your personal space for a cleaner community",
    settings: isArabic ? "الإعدادات" : "Settings",
    member: isArabic ? "عضو في EcoPulse" : "EcoPulse Member",
    personalInfo: isArabic ? "معلوماتك الشخصية" : "Personal Information",
    personalSubtitle: isArabic
      ? "بيانات حسابك المسجلة"
      : "Your registered account details",
    firstName: isArabic ? "الاسم الأول" : "First Name",
    lastName: isArabic ? "اسم العائلة" : "Last Name",
    email: isArabic ? "البريد الإلكتروني" : "Email Address",
    phone: isArabic ? "رقم الهاتف" : "Phone Number",
    statistics: isArabic ? "ملخص نشاطك" : "Your Activity",
    statisticsSubtitle: isArabic
      ? "مساهمتك في الحفاظ على بيئتنا"
      : "Your contribution to a cleaner environment",
    total: isArabic ? "إجمالي البلاغات" : "Total Reports",
    resolved: isArabic ? "تم الحل" : "Resolved",
    pending: isArabic ? "قيد المراجعة" : "Pending",
    actions: isArabic ? "الوصول السريع" : "Quick Access",
    actionsSubtitle: isArabic
      ? "كل ما تحتاجينه في مكان واحد"
      : "Everything you need in one place",
    dashboard: isArabic
      ? "لوحة تحكم المسؤول"
      : "Admin Dashboard",
    dashboardDesc: isArabic
      ? "فتح لوحة تحكم المسؤول"
      : "Open the admin control panel",
    history: isArabic ? "سجل البلاغات" : "Report History",
    historyDesc: isArabic ? "تابعي حالة بلاغاتك" : "Track your submissions",
    privacy: isArabic ? "الخصوصية والأمان" : "Privacy & Security",
    privacyDesc: isArabic ? "إعدادات حسابك" : "Your account security",
    logout: isArabic ? "تسجيل الخروج" : "Log Out",
    logoutDesc: isArabic ? "الخروج من حسابك" : "Sign out of your account",
    changePhoto: isArabic ? "تغيير الصورة" : "Change Photo",
    noReports: isArabic
      ? "لم تقومي بإرسال أي بلاغ حتى الآن"
      : "You haven't submitted any reports yet",
    uploadError: isArabic
      ? "اختاري صورة صحيحة من فضلك"
      : "Please choose a valid image",
    sizeError: isArabic
      ? "يجب أن يكون حجم الصورة أقل من 3 ميجابايت"
      : "Image size must be less than 3 MB",
    photoUpdated: isArabic
      ? "تم تحديث الصورة بنجاح"
      : "Profile picture updated successfully",
    logoutTitle: isArabic ? "تسجيل الخروج؟" : "Log out?",
    logoutMessage: isArabic
      ? "هل أنت متأكدة أنك تريدين تسجيل الخروج؟"
      : "Are you sure you want to log out?",
    cancel: isArabic ? "إلغاء" : "Cancel",
    confirmLogout: isArabic ? "تسجيل الخروج" : "Log Out",
  };

  // Navigate to the Admin Dashboard.
  const openAdminDashboard = () => {
    setMenuOpen(false);
    navigate("/admin");
  };

  // Keep language synchronized with the rest of the app.
  useEffect(() => {
    const updateLanguage = () => {
      setLanguage(localStorage.getItem("selectedLang") || "en");
    };

    window.addEventListener("languageChanged", updateLanguage);
    window.addEventListener("storage", updateLanguage);

    return () => {
      window.removeEventListener("languageChanged", updateLanguage);
      window.removeEventListener("storage", updateLanguage);
    };
  }, []);

  // Keep profile information synchronized.
  useEffect(() => {
    const updateUser = () => {
      setUser({
        firstName: localStorage.getItem("Firstname") || "",
        lastName: localStorage.getItem("Lastname") || "",
        email: localStorage.getItem("Email") || "",
        phone: localStorage.getItem("Phone") || "",
        profilePic: localStorage.getItem("userProfilePic") || "",
      });
    };

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  // Refresh reports when they are updated.
  useEffect(() => {
    const updateReports = () => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("allReports") || "[]"
        );

        setReports(Array.isArray(saved) ? saved : []);
      } catch {
        setReports([]);
      }
    };

    window.addEventListener("reportsUpdated", updateReports);
    window.addEventListener("storage", updateReports);

    return () => {
      window.removeEventListener("reportsUpdated", updateReports);
      window.removeEventListener("storage", updateReports);
    };
  }, []);

  // Reveal sections as they enter the viewport.
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;

    const elements = root.querySelectorAll(".profile-reveal");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      elements.forEach((element) =>
        element.classList.add("profile-visible")
      );

      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("profile-visible");
          } else {
            entry.target.classList.remove("profile-visible");
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -20px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  // Upload profile picture.
  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "error",
        title: t.uploadError,
        confirmButtonColor: "#22c55e",
      });

      event.target.value = "";
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      Swal.fire({
        icon: "warning",
        title: t.sizeError,
        confirmButtonColor: "#22c55e",
      });

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = reader.result;

      try {
        localStorage.setItem("userProfilePic", image);

        setUser((previous) => ({
          ...previous,
          profilePic: image,
        }));

        Swal.fire({
          icon: "success",
          title: t.photoUpdated,
          timer: 1600,
          showConfirmButton: false,
        });
      } catch {
        Swal.fire({
          icon: "error",
          title: isArabic
            ? "تعذر حفظ الصورة"
            : "Could not save the image",
          text: isArabic
            ? "قد تكون مساحة التخزين ممتلئة. اختاري صورة أصغر."
            : "Storage may be full. Please choose a smaller image.",
          confirmButtonColor: "#22c55e",
        });
      }
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  // Confirm logout.
  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: t.logoutTitle,
      text: t.logoutMessage,
      showCancelButton: true,
      confirmButtonText: t.confirmLogout,
      cancelButtonText: t.cancel,
      confirmButtonColor: "#22c55e",
      cancelButtonColor: "#6b7280",
      reverseButtons: isArabic,
    });

    if (result.isConfirmed) {
      localStorage.setItem("isLoggedIn", "false");
      window.dispatchEvent(new Event("authChanged"));
      navigate("/login");
    }
  };

  const totalReports = reports.length;

  const resolvedReports = reports.filter((report) => {
    const status = String(
      report.statusText || report.status || ""
    ).toLowerCase();

    return (
      status.includes("resolved") ||
      status.includes("solved") ||
      status.includes("completed") ||
      status.includes("تم الحل") ||
      status.includes("تمت المعالجة") ||
      status.includes("مكتمل") ||
      status.includes("تم التنفيذ")
    );
  }).length;

  const pendingReports = Math.max(0, totalReports - resolvedReports);

  const displayName =
    `${user.firstName} ${user.lastName}`.trim() ||
    (isArabic ? "عضو EcoPulse" : "EcoPulse Member");

  const revealStyle = (delay = 0) => ({
    transitionDelay: `${delay}ms`,
  });

  return (
    <main
      ref={pageRef}
      dir={isArabic ? "rtl" : "ltr"}
      className="relative isolate min-h-screen bg-gray-50 px-3 py-5 text-gray-900 transition-colors duration-300 dark:bg-[#050505] dark:text-white sm:px-5 sm:py-7 lg:px-8"
    >
      <style>{`
        .profile-reveal {
          opacity: 0;
          transform: translateY(20px);
          transition:
            opacity 600ms ease,
            transform 600ms cubic-bezier(.22,1,.36,1);
          will-change: opacity, transform;
        }

        .profile-reveal.profile-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .profile-card {
          transition:
            border-color 250ms ease,
            box-shadow 250ms ease;
        }

        .profile-card:hover {
          border-color: rgba(34,197,94,.25);
        }

        .profile-action {
          transition:
            transform 220ms ease,
            background-color 220ms ease,
            border-color 220ms ease;
        }

        @media (prefers-reduced-motion: reduce) {
          .profile-reveal {
            opacity: 1;
            transform: none;
            transition: none;
          }

          .profile-card,
          .profile-action {
            transition: none;
          }
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header
          className="profile-reveal relative z-50 mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6"
          style={revealStyle(0)}
        >
          <div className="min-w-0">
            <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-green-600 dark:text-green-400 sm:text-sm">
              <Leaf size={16} />
              <span>ECOPULSE / ACCOUNT</span>
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              {t.title}
            </h1>

            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 sm:text-base">
              {t.subtitle}
            </p>
          </div>

          {/* Settings dropdown */}
          <div className="relative z-[100] shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((previous) => !previous)}
              aria-expanded={menuOpen}
              aria-haspopup="true"
              className="relative z-[101] flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-semibold shadow-sm transition hover:border-green-500 hover:text-green-600 dark:border-gray-800 dark:bg-[#0D0D0F] dark:hover:text-green-400 sm:px-4 sm:py-3"
            >
              <Settings size={18} />
              {t.settings}
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                  className="fixed inset-0 z-[100] cursor-default"
                />

                <div className="absolute end-0 top-full z-[110] mt-2 w-60 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-[#0D0D0F]">
                  <MenuItem
                    icon={<House size={17} />}
                    label={t.dashboard}
                    onClick={openAdminDashboard}
                  />

                  <MenuItem
                    icon={<ShieldCheck size={17} />}
                    label={t.privacy}
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/privacy");
                    }}
                  />

                  <MenuItem
                    icon={<LogOut size={17} />}
                    label={t.logout}
                    danger
                    onClick={handleLogout}
                  />
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 lg:gap-6">
          {/* Profile card */}
          <section
            className="profile-reveal profile-card min-w-0 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-[#0D0D0F] lg:col-span-1"
            style={revealStyle(80)}
          >
            <div className="relative h-32 overflow-hidden sm:h-36">
              <img
                src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80"
                alt="Green forest"
                className="h-full w-full object-cover transition duration-700 hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

              <div className="absolute bottom-3 start-4 flex items-center gap-2 text-sm font-semibold text-white">
                <Leaf size={16} />
                EcoPulse Community
              </div>
            </div>

            <div className="px-4 pb-5 sm:px-5 sm:pb-6">
              <div className="-mt-10 flex flex-wrap items-end justify-between gap-3">
                <div className="relative shrink-0">
                  {user.profilePic ? (
                    <img
                      src={user.profilePic}
                      alt="Profile"
                      className="h-24 w-24 rounded-2xl border-4 border-white bg-gray-100 object-cover shadow-lg dark:border-[#0D0D0F] dark:bg-gray-800 sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-gray-100 text-gray-400 shadow-lg dark:border-[#0D0D0F] dark:bg-gray-800 sm:h-28 sm:w-28">
                      <UserRound size={42} />
                    </div>
                  )}

                  <button
                    type="button"
                    title={t.changePhoto}
                    aria-label={t.changePhoto}
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1.5 -end-1.5 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white bg-green-500 text-white shadow-md transition hover:scale-105 hover:bg-green-600 dark:border-[#0D0D0F]"
                  >
                    <Camera size={17} />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>

                <span className="mb-1 inline-flex max-w-full items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1.5 text-xs font-semibold text-green-600 dark:bg-green-500/10 dark:text-green-400">
                  <CheckCircle2 size={14} className="shrink-0" />
                  {t.member}
                </span>
              </div>

              <div className="mt-4 min-w-0">
                <h2 className="break-words text-xl font-extrabold tracking-tight sm:text-2xl">
                  {displayName}
                </h2>

                <p className="mt-2 flex min-w-0 items-center gap-2 break-all text-sm text-gray-500 dark:text-gray-400">
                  <Mail size={16} className="shrink-0 text-green-500" />
                  <span>{user.email || "—"}</span>
                </p>

                <p className="mt-2 flex min-w-0 items-center gap-2 break-words text-sm text-gray-500 dark:text-gray-400">
                  <Phone size={16} className="shrink-0 text-green-500" />
                  <span>{user.phone || "—"}</span>
                </p>
              </div>

              <div className="my-4 border-t border-gray-100 dark:border-gray-800 sm:my-5" />

              <div className="rounded-xl border border-green-100 bg-green-50/70 p-3.5 dark:border-green-900/40 dark:bg-green-500/5 sm:p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                    <Leaf size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold sm:text-base">
                      {isArabic
                        ? "كل بلاغ يصنع فرقًا"
                        : "Every report makes a difference"}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {isArabic
                        ? "شكرًا لمساهمتك في جعل مجتمعنا أنظف."
                        : "Thank you for helping make our community cleaner."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin Dashboard button */}
              <button
                type="button"
                onClick={openAdminDashboard}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-green-600 hover:shadow-md sm:text-base"
              >
                <House size={18} />
                {t.dashboard}
                <ArrowUpRight
                  size={17}
                  className={isArabic ? "rotate-[-90deg]" : ""}
                />
              </button>
            </div>
          </section>

          {/* Details and activity */}
          <div className="min-w-0 space-y-5 lg:col-span-2">
            {/* Personal information */}
            <section
              className="profile-reveal profile-card min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0D0D0F] sm:p-5 lg:p-6"
              style={revealStyle(150)}
            >
              <SectionHeading
                icon={<UserRound size={20} />}
                title={t.personalInfo}
                subtitle={t.personalSubtitle}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <InfoField
                  icon={<UserRound size={17} />}
                  label={t.firstName}
                  value={user.firstName}
                />

                <InfoField
                  icon={<UserRound size={17} />}
                  label={t.lastName}
                  value={user.lastName}
                />

                <InfoField
                  icon={<Mail size={17} />}
                  label={t.email}
                  value={user.email}
                />

                <InfoField
                  icon={<Phone size={17} />}
                  label={t.phone}
                  value={user.phone}
                />
              </div>
            </section>

            {/* Report statistics */}
            <section
              className="profile-reveal profile-card min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0D0D0F] sm:p-5 lg:p-6"
              style={revealStyle(220)}
            >
              <SectionHeading
                icon={<FileText size={20} />}
                title={t.statistics}
                subtitle={t.statisticsSubtitle}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                <SummaryItem
                  icon={<FileText size={21} />}
                  label={t.total}
                  value={totalReports}
                  color="green"
                />

                <SummaryItem
                  icon={<CheckCircle2 size={21} />}
                  label={t.resolved}
                  value={resolvedReports}
                  color="green"
                />

                <SummaryItem
                  icon={<Clock size={21} />}
                  label={t.pending}
                  value={pendingReports}
                  color="amber"
                />
              </div>

              {reports.length === 0 && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-gray-200 px-3.5 py-3.5 dark:border-gray-800">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800">
                    <FileText size={18} />
                  </div>

                  <p className="text-sm leading-5 text-gray-500 dark:text-gray-400">
                    {t.noReports}
                  </p>
                </div>
              )}
            </section>

            {/* Quick actions */}
            <section
              className="profile-reveal profile-card min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-[#0D0D0F] sm:p-5 lg:p-6"
              style={revealStyle(290)}
            >
              <SectionHeading
                icon={<Settings size={20} />}
                title={t.actions}
                subtitle={t.actionsSubtitle}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ActionButton
                  icon={<House size={20} />}
                  label={t.dashboard}
                  description={t.dashboardDesc}
                  onClick={openAdminDashboard}
                />

                <ActionButton
                  icon={<FileText size={20} />}
                  label={t.history}
                  description={t.historyDesc}
                  onClick={() => navigate("/track")}
                />

                <ActionButton
                  icon={<ShieldCheck size={20} />}
                  label={t.privacy}
                  description={t.privacyDesc}
                  onClick={() => navigate("/privacy")}
                />

                <ActionButton
                  icon={<LogOut size={20} />}
                  label={t.logout}
                  description={t.logoutDesc}
                  danger
                  onClick={handleLogout}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer
          className="profile-reveal mt-6 flex flex-wrap items-center justify-center gap-2 pb-2 text-center text-xs text-gray-400 sm:mt-7"
          style={revealStyle(350)}
        >
          <Leaf size={14} className="text-green-500" />

          <span>
            © {new Date().getFullYear()} EcoPulse.{" "}
            {isArabic
              ? "معًا من أجل بيئة أنظف."
              : "Together for a cleaner environment."}
          </span>
        </footer>
      </div>
    </main>
  );
}

function SectionHeading({ icon, title, subtitle }) {
  return (
    <div className="mb-4 flex min-w-0 items-center gap-3 sm:mb-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 sm:h-11 sm:w-11">
        {icon}
      </div>

      <div className="min-w-0">
        <h3 className="break-words text-base font-bold sm:text-lg">
          {title}
        </h3>

        <p className="mt-0.5 text-xs leading-5 text-gray-500 dark:text-gray-400 sm:text-sm">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function InfoField({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50/80 p-3.5 transition-colors duration-300 hover:border-green-200 dark:border-gray-800 dark:bg-[#080809] dark:hover:border-green-900 sm:p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <span className="shrink-0 text-green-500">{icon}</span>
        {label}
      </p>

      <p className="break-words text-sm font-semibold leading-5">
        {value || "—"}
      </p>
    </div>
  );
}

function SummaryItem({ icon, label, value, color = "green" }) {
  const colors =
    color === "amber"
      ? {
          icon: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
          border: "hover:border-amber-300 dark:hover:border-amber-900",
        }
      : {
          icon: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
          border: "hover:border-green-300 dark:hover:border-green-900",
        };

  return (
    <div
      className={`profile-card min-w-0 rounded-xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-[#080809] sm:p-4 ${colors.border}`}
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors.icon}`}
      >
        {icon}
      </div>

      <p className="break-words text-xs leading-5 text-gray-500 dark:text-gray-400 sm:text-sm">
        {label}
      </p>

      <p className="mt-1.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  description,
  onClick,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`profile-action group flex min-w-0 items-center gap-3 rounded-xl border p-3.5 text-start sm:p-4 ${
        danger
          ? "border-red-100 hover:border-red-200 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/30"
          : "border-gray-200 hover:border-green-300 hover:bg-green-50/60 dark:border-gray-800 dark:hover:border-green-900 dark:hover:bg-green-500/5"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          danger
            ? "bg-red-50 text-red-500 dark:bg-red-500/10"
            : "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400"
        }`}
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block break-words text-sm font-bold ${
            danger ? "text-red-500" : ""
          }`}
        >
          {label}
        </span>

        <span className="mt-1 block break-words text-xs leading-5 text-gray-500 dark:text-gray-400">
          {description}
        </span>
      </span>

      <ChevronRight
        size={17}
        className="shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-green-500 rtl:rotate-180"
      />
    </button>
  );
}

function MenuItem({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-start text-sm transition ${
        danger
          ? "border-t border-gray-100 text-red-500 hover:bg-red-50 dark:border-gray-800 dark:hover:bg-red-950/30"
          : "hover:bg-gray-100 dark:hover:bg-gray-800"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}