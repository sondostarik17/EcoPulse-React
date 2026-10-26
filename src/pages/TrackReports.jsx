
import { useEffect, useRef, useState } from "react";
import {
  ShieldCheck,
  Trash2,
  MapPin,
  CalendarDays,
  ClipboardList,
  CheckCircle2,
  Recycle,
  MessageSquare,
  LoaderCircle,
} from "lucide-react";
import Swal from "sweetalert2";

export default function TrackReports() {
  const [reports, setReports] = useState([]);
  const [isArabic, setIsArabic] = useState(
    () => localStorage.getItem("selectedLang") === "ar"
  );
  const [visibleItems, setVisibleItems] = useState({});
  const [isDark, setIsDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  const itemRefs = useRef([]);

  const t = (en, ar) => (isArabic ? ar : en);

  // Load reports and listen for updates.
  useEffect(() => {
    function loadReports() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("allReports") || "[]"
        );
        setReports(Array.isArray(saved) ? saved : []);
      } catch {
        setReports([]);
      }
    }

    function handleLanguage() {
      setIsArabic(localStorage.getItem("selectedLang") === "ar");
    }

    function handleTheme() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    loadReports();

    window.addEventListener("storage", loadReports);
    window.addEventListener("reportsUpdated", loadReports);
    window.addEventListener("languageChanged", handleLanguage);
    window.addEventListener("themeChanged", handleTheme);

    const themeObserver = new MutationObserver(handleTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("storage", loadReports);
      window.removeEventListener("reportsUpdated", loadReports);
      window.removeEventListener("languageChanged", handleLanguage);
      window.removeEventListener("themeChanged", handleTheme);
      themeObserver.disconnect();
    };
  }, []);

  // Reveal cards gradually when scrolling.
  useEffect(() => {
    const elements = itemRefs.current.filter(Boolean);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.dataset.index);

            setVisibleItems((previous) => ({
              ...previous,
              [index]: true,
            }));

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px",
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [reports.length]);

  // Format dates for display.
  function formatDate(dateValue) {
    if (!dateValue) return t("Date unavailable", "التاريخ غير متاح");

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return String(dateValue);
    }

    return new Intl.DateTimeFormat(isArabic ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  // Normalize the stored status.
  function getStatus(item) {
    const rawStatus = String(
      item.statusText || item.status || "Pending"
    )
      .trim()
      .toLowerCase();

    if (
      ["completed", "complete", "resolved", "done"].includes(rawStatus)
    ) {
      return {
        label: t("Completed", "مكتمل"),
        style:
          "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
        icon: <CheckCircle2 size={21} />,
      };
    }

    if (
      ["rejected", "declined"].includes(rawStatus)
    ) {
      return {
        label: t("Rejected", "مرفوض"),
        style:
          "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400",
        icon: <ShieldCheck size={21} />,
      };
    }

    if (
      ["in progress", "in_progress", "processing"].includes(rawStatus)
    ) {
      return {
        label: t("In Progress", "جارٍ التنفيذ"),
        style:
          "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400",
        icon: <LoaderCircle size={21} />,
      };
    }

    return {
      label: t("Pending Review", "قيد المراجعة"),
      style:
        "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400",
      icon: <ClipboardList size={21} />,
    };
  }

  async function deleteReport(reportToDelete) {
    const result = await Swal.fire({
      background: isDark ? "#0D0D0F" : "#FFFFFF",
      color: isDark ? "#FFFFFF" : "#111827",
      title: t("Delete this report?", "حذف هذا البلاغ؟"),
      text: t(
        "This action cannot be undone.",
        "لا يمكن التراجع عن هذا الإجراء."
      ),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: t("Yes, delete", "نعم، احذف"),
      cancelButtonText: t("Cancel", "إلغاء"),
      confirmButtonColor: "#22C55E",
      cancelButtonColor: "#6B7280",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl",
      },
    });

    if (!result.isConfirmed) return;

    try {
      const currentReports = (() => {
        try {
          const saved = JSON.parse(
            localStorage.getItem("allReports") || "[]"
          );
          return Array.isArray(saved) ? saved : [];
        } catch {
          return [];
        }
      })();

      // Match the specific report rather than relying only on its list index.
      const targetIndex = currentReports.findIndex(
        (item) => item === reportToDelete
      );

      // localStorage creates new object references after parsing,
      // so use the report ID when available.
      const fallbackIndex = currentReports.findIndex(
        (item) =>
          item.requestId &&
          reportToDelete.requestId &&
          item.requestId === reportToDelete.requestId
      );

      const indexToDelete =
        targetIndex !== -1 ? targetIndex : fallbackIndex;

      if (indexToDelete === -1) {
        await Swal.fire({
          background: isDark ? "#0D0D0F" : "#FFFFFF",
          color: isDark ? "#FFFFFF" : "#111827",
          title: t("Report not found", "لم يتم العثور على البلاغ"),
          icon: "error",
          confirmButtonColor: "#22C55E",
        });
        return;
      }

      const updatedReports = currentReports.filter(
        (_, index) => index !== indexToDelete
      );

      localStorage.setItem(
        "allReports",
        JSON.stringify(updatedReports)
      );

      setReports(updatedReports);
      setVisibleItems({});
      window.dispatchEvent(new Event("reportsUpdated"));

      await Swal.fire({
        background: isDark ? "#0D0D0F" : "#FFFFFF",
        color: isDark ? "#FFFFFF" : "#111827",
        title: t("Report deleted", "تم حذف البلاغ"),
        icon: "success",
        timer: 1300,
        showConfirmButton: false,
        iconColor: "#22C55E",
      });
    } catch (error) {
      console.error("Delete report error:", error);

      await Swal.fire({
        background: isDark ? "#0D0D0F" : "#FFFFFF",
        color: isDark ? "#FFFFFF" : "#111827",
        title: t("Error", "خطأ"),
        text: t(
          "Could not delete the report.",
          "تعذر حذف البلاغ."
        ),
        icon: "error",
        confirmButtonColor: "#22C55E",
      });
    }
  }

  const cardBg =
    "border-gray-200 bg-white dark:border-green-500/15 dark:bg-[#0D0D0F]";

  const mainText = "text-gray-900 dark:text-white";
  const mutedText = "text-gray-500 dark:text-gray-400";

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen bg-gray-50 px-4 py-6 pb-10 text-gray-900 transition-colors duration-300 dark:bg-[#050505] dark:text-white sm:px-6 sm:py-8 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header
          className="mb-8 transition-all duration-700 animate-fade-up sm:mb-10"
        >
          <div
            className={`relative flex min-h-[180px] items-center justify-between gap-5 overflow-hidden rounded-[2rem] border p-6 shadow-lg shadow-green-950/5 transition-colors sm:min-h-[220px] sm:rounded-[3rem] sm:p-10 lg:p-12 ${cardBg} dark:shadow-green-950/10`}
          >
            <div className="min-w-0">
              <p className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-green-600 dark:text-green-500">
                <span className="h-2 w-2 animate-ping rounded-full bg-green-500" />
                {t("Live Tracking System", "نظام متابعة البلاغات")}
              </p>

              <h1
                className={`break-words text-3xl font-black tracking-tighter sm:text-4xl lg:text-5xl ${mainText}`}
              >
                {t("Track Request", "متابعة البلاغات")}
              </h1>

              <p className={`mt-3 max-w-lg text-sm leading-6 ${mutedText}`}>
                {t(
                  "Your submitted reports and their current status.",
                  "تابعي البلاغات التي أرسلتيها وحالتها الحالية."
                )}
              </p>
            </div>

            <ShieldCheck
              size={75}
              strokeWidth={1.5}
              className="hidden shrink-0 text-green-500/20 sm:block"
            />
          </div>
        </header>

        {/* Reports heading */}
        <div className="mb-6 flex animate-fade-up flex-wrap items-center justify-between gap-3 [animation-delay:120ms]">
          <div className="flex items-center gap-3">
            <ClipboardList
              className="text-green-600 dark:text-green-500"
              size={24}
            />
            <h2 className={`text-xl font-black ${mainText}`}>
              {t("My Reports", "بلاغاتي")}
            </h2>
          </div>

          <span className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-2 text-sm font-bold text-green-700 dark:text-green-400">
            {reports.length}{" "}
            {t(
              reports.length === 1 ? "Report" : "Reports",
              reports.length === 1 ? "بلاغ" : "بلاغات"
            )}
          </span>
        </div>

        {/* Empty state */}
        {reports.length === 0 ? (
          <section
            className={`animate-fade-up rounded-[2rem] border px-5 py-16 text-center shadow-lg shadow-green-950/5 sm:rounded-[2.5rem] sm:py-24 ${cardBg}`}
          >
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-500">
              <ClipboardList size={38} />
            </div>

            <h2 className={`text-xl font-black sm:text-2xl ${mainText}`}>
              {t("No History Found", "لا توجد بلاغات حتى الآن")}
            </h2>

            <p className={`mx-auto mt-3 max-w-md text-sm ${mutedText}`}>
              {t(
                "Your submitted reports will appear here.",
                "البلاغات التي ترسلينها ستظهر هنا."
              )}
            </p>

            <a
              href="/report"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 py-3 font-bold text-black transition hover:bg-green-400"
            >
              <Recycle size={19} />
              {t("Create a Report", "إنشاء بلاغ")}
            </a>
          </section>
        ) : (
          <div className="space-y-6">
            {reports.map((item, index) => {
              const status = getStatus(item);

              return (
                <article
                  key={item.requestId || `${item.date || "report"}-${index}`}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  data-index={index}
                  style={{ transitionDelay: `${Math.min(index * 80, 400)}ms` }}
                  className={`group relative overflow-hidden rounded-[2rem] border p-4 shadow-lg shadow-green-950/5 transition-all duration-700 hover:border-green-500/30 hover:shadow-green-950/10 sm:rounded-[2.5rem] sm:p-6 lg:p-8 ${cardBg} ${
                    visibleItems[index]
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  }`}
                >
                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => deleteReport(item)}
                    title={t("Delete report", "حذف البلاغ")}
                    aria-label={t("Delete report", "حذف البلاغ")}
                    className={`absolute top-4 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 transition hover:bg-red-500 hover:text-white dark:text-red-400 sm:top-6 ${
                      isArabic ? "left-4 sm:left-6" : "right-4 sm:right-6"
                    }`}
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex min-w-0 flex-col gap-5 lg:flex-row lg:gap-8">
                    {/* Image */}
                    <div className="h-56 w-full shrink-0 overflow-hidden rounded-[1.5rem] border border-gray-200 bg-gray-100 dark:border-green-500/10 dark:bg-[#080808] sm:h-64 lg:w-64">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={t("Reported waste", "صورة البلاغ")}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-500">
                          <Recycle size={38} className="text-green-500/60" />
                          <span className="text-sm">
                            {t("No image available", "لا توجد صورة")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1 space-y-6 pt-1">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            {t("Case ID", "رقم البلاغ")}
                          </span>

                          <h3
                            className={`mt-1 break-words text-3xl font-black italic tracking-tighter sm:text-4xl ${mainText}`}
                          >
                            {item.requestId || `#${index + 1}`}
                          </h3>
                        </div>

                        <div
                          className={`flex w-fit max-w-full items-center gap-3 rounded-2xl border px-4 py-3 sm:px-5 ${status.style}`}
                        >
                          <div className="min-w-0">
                            <p className="break-words text-xs font-black uppercase sm:text-sm">
                              {status.label}
                            </p>

                            <p className="mt-1 text-[10px] font-bold opacity-80">
                              {item.statusSub ||
                                t(
                                  "Report status",
                                  "حالة البلاغ"
                                )}
                            </p>
                          </div>

                          {status.icon}
                        </div>
                      </div>

                      {/* Information */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <InfoBox
                          label={t("Type", "النوع")}
                          value={item.issueType || t("Waste Report", "بلاغ مخلفات")}
                        />

                        <InfoBox
                          label={t("Location", "الموقع")}
                          value={item.location || "—"}
                          icon={<MapPin size={14} />}
                        />

                        <InfoBox
                          label={t("Posted", "تاريخ الإرسال")}
                          value={formatDate(item.date)}
                          icon={<CalendarDays size={14} />}
                        />

                        <InfoBox
                          label={t("Priority", "الأولوية")}
                          value={item.priority || t("Normal", "عادية")}
                          priority
                        />
                      </div>

                      {/* Description */}
                      <div className="rounded-2xl border border-green-500/20 bg-green-50 p-5 text-sm leading-7 dark:bg-green-500/[0.04] sm:p-6">
                        <p className="mb-2 flex items-center gap-2 font-bold text-green-600 dark:text-green-500">
                          <MessageSquare size={16} />
                          {t("Description", "وصف البلاغ")}
                        </p>

                        <p className="break-words text-gray-700 dark:text-gray-300">
                          {item.description ||
                            t(
                              "No description provided.",
                              "لم تتم إضافة وصف."
                            )}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(22px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-up {
          animation: fadeUp 700ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up {
            animation: none;
          }

          article {
            transition-duration: 0ms !important;
            transform: none !important;
            opacity: 1 !important;
          }
        }
      `}</style>
    </main>
  );
}

function InfoBox({ label, value, priority = false, icon }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-4 transition-colors sm:p-5 ${
        priority
          ? "border-red-500/20 bg-red-50 dark:bg-red-500/[0.04]"
          : "border-gray-200 bg-gray-50 dark:border-green-500/10 dark:bg-[#080808]"
      }`}
    >
      <p
        className={`mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide ${
          priority ? "text-red-500 dark:text-red-400" : "text-gray-500"
        }`}
      >
        {icon}
        {label}
      </p>

      <p
        className={`break-words text-sm font-bold ${
          priority
            ? "text-red-500 dark:text-red-400"
            : "text-gray-900 dark:text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
