import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  AlertCircle,
  MapPin,
  CalendarDays,
  Leaf,
  Menu,
  X,
  Bell,
  RefreshCw,
  ArrowUpRight,
  ChevronDown,
  Activity,
  LogOut,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

function readReports() {
  try {
    const saved = JSON.parse(localStorage.getItem("allReports") || "[]");

    if (Array.isArray(saved)) return saved;
    if (Array.isArray(saved?.reports)) return saved.reports;

    return [];
  } catch {
    return [];
  }
}

function getStatus(report) {
  const value = String(
    report.status || report.statusText || report.status_ar || "pending"
  ).toLowerCase();

  if (
    value.includes("complete") ||
    value.includes("resolved") ||
    value.includes("done") ||
    value.includes("مكتمل") ||
    value.includes("تم التنفيذ")
  ) {
    return "completed";
  }

  if (
    value.includes("reject") ||
    value.includes("رفض") ||
    value.includes("مرفوض")
  ) {
    return "rejected";
  }

  if (
    value.includes("progress") ||
    value.includes("review") ||
    value.includes("processing") ||
    value.includes("مراجعة") ||
    value.includes("جاري")
  ) {
    return "in-progress";
  }

  return "pending";
}

function getDate(report) {
  const value = report.date || report.createdAt || report.created_at;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(report) {
  const date = getDate(report);

  if (!date) return "Date unavailable";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getLocation(report) {
  const location =
    report.location || report.address || report.place || "";

  if (typeof location === "string" && location.trim()) {
    return location;
  }

  if (location && typeof location === "object") {
    return (
      location.address ||
      location.name ||
      (location.lat && location.lng
        ? `${location.lat}, ${location.lng}`
        : "Location unavailable")
    );
  }

  if (report.lat && report.lng) {
    return `${report.lat}, ${report.lng}`;
  }

  return "Location unavailable";
}

function getReportId(report, index) {
  return report.requestId || report.reportId || report.id || `#${index + 1}`;
}

const statusStyles = {
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/15 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20",
  "in-progress":
    "bg-blue-50 text-blue-700 ring-blue-600/15 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20",
  completed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/15 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  rejected:
    "bg-red-50 text-red-700 ring-red-600/15 dark:bg-red-400/10 dark:text-red-300 dark:ring-red-400/20",
};

function StatusBadge({ status }) {
  const option = STATUS_OPTIONS.find((item) => item.value === status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        statusStyles[status] || statusStyles.pending
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {option?.label || "Pending"}
    </span>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const colorStyles = {
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
    red: "bg-red-50 text-red-700 dark:bg-red-400/10 dark:text-red-300",
  };

  return (
    <div className="group rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/[0.04] dark:border-white/[0.08] dark:bg-gray-900/80 dark:hover:shadow-black/20 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>

          <p className="mt-3 text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-4xl">
            {value}
          </p>

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${colorStyles[color]}`}
        >
          <Icon size={21} strokeWidth={1.9} />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [activePage, setActivePage] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [updatingIndex, setUpdatingIndex] = useState(null);

  const loadReports = () => {
    setReports(readReports());
  };

  useEffect(() => {
    loadReports();

    const handleReportsUpdate = () => loadReports();

    window.addEventListener("storage", handleReportsUpdate);
    window.addEventListener("reportsUpdated", handleReportsUpdate);

    return () => {
      window.removeEventListener("storage", handleReportsUpdate);
      window.removeEventListener("reportsUpdated", handleReportsUpdate);
    };
  }, []);

  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(
      (report) => getStatus(report) === "pending"
    ).length;
    const inProgress = reports.filter(
      (report) => getStatus(report) === "in-progress"
    ).length;
    const completed = reports.filter(
      (report) => getStatus(report) === "completed"
    ).length;

    return { total, pending, inProgress, completed };
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports
      .map((report, index) => ({ report, index }))
      .filter(({ report }) => {
        const matchesStatus =
          statusFilter === "all" || getStatus(report) === statusFilter;

        const matchesSearch =
          !query ||
          [
            getReportId(report, 0),
            getLocation(report),
            report.description,
            report.name,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value).toLowerCase().includes(query)
            );

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = getDate(a.report)?.getTime() || 0;
        const dateB = getDate(b.report)?.getTime() || 0;

        return dateB - dateA;
      });
  }, [reports, search, statusFilter]);

  const recentActivity = useMemo(() => {
    const counts = [
      { label: "Pending", value: stats.pending, color: "bg-amber-400" },
      {
        label: "In Progress",
        value: stats.inProgress,
        color: "bg-blue-500",
      },
      {
        label: "Completed",
        value: stats.completed,
        color: "bg-emerald-500",
      },
      {
        label: "Rejected",
        value: reports.filter(
          (report) => getStatus(report) === "rejected"
        ).length,
        color: "bg-red-500",
      },
    ];

    return counts;
  }, [reports, stats]);

  const updateStatus = (index, nextStatus) => {
    const updatedReports = reports.map((report, reportIndex) => {
      if (reportIndex !== index) return report;

      const selectedStatus = STATUS_OPTIONS.find(
        (item) => item.value === nextStatus
      );

      return {
        ...report,
        status: nextStatus,
        statusText: selectedStatus?.label || "Pending",
      };
    });

    setReports(updatedReports);
    localStorage.setItem("allReports", JSON.stringify(updatedReports));
    window.dispatchEvent(new Event("reportsUpdated"));
  };

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "reports",
      label: "All Reports",
      icon: ClipboardList,
      count: reports.length,
    },
  ];

  const pageTitle =
    activePage === "dashboard" ? "Dashboard Overview" : "Manage Reports";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-300 dark:bg-[#0b0b10] dark:text-white">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <div className="mx-auto flex min-h-screen max-w-[1800px]">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-gray-200/80 bg-white transition-transform duration-300 dark:border-white/[0.08] dark:bg-gray-950 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="flex h-[82px] items-center justify-between border-b border-gray-100 px-6 dark:border-white/[0.08]">
            <Link
              to="/"
              className="flex items-center gap-3"
              aria-label="EcoPulse website"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-sm font-black text-white shadow-lg shadow-emerald-600/20">
                EP
              </span>

              <span>
                <span className="block text-xl font-extrabold tracking-tight text-gray-950 dark:text-white">
                  Eco<span className="text-emerald-600">Pulse</span>
                </span>

                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[2px] text-gray-400">
                  Admin Portal
                </span>
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-gray-400">
              Workspace
            </p>

            <nav className="space-y-1.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActivePage(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-white/[0.06] dark:hover:text-white"
                    }`}
                  >
                    <Icon size={19} strokeWidth={1.9} />
                    <span className="flex-1">{item.label}</span>

                    {item.count !== undefined && (
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-bold ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-300"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-9">
              <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[2px] text-gray-400">
                Quick access
              </p>

              <Link
                to="/"
                className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.06]"
              >
                <ArrowUpRight size={19} />
                <span>View User Website</span>
              </Link>
            </div>
          </div>

          {/* Sidebar footer */}
          <div className="border-t border-gray-100 p-4 dark:border-white/[0.08]">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-400/[0.06]">
              <div className="flex items-center gap-2">
                <Leaf size={17} className="text-emerald-600" />

                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  EcoPulse Mission
                </span>
              </div>

              <p className="mt-2 text-xs leading-5 text-gray-600 dark:text-gray-400">
                Cleaner streets start with action. Keep every report moving.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-sm font-bold text-white dark:bg-emerald-600">
                A
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                  Administrator
                </p>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Admin workspace
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex min-h-[82px] items-center justify-between gap-3 border-b border-gray-200/80 bg-white/90 px-4 backdrop-blur-xl dark:border-white/[0.08] dark:bg-gray-950/90 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                    Admin
                  </p>
                  <span className="text-gray-300 dark:text-gray-700">/</span>
                  <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                    {pageTitle}
                  </p>
                </div>

                <h1 className="mt-1 truncate text-lg font-extrabold tracking-tight text-gray-950 dark:text-white sm:text-xl">
                  {activePage === "dashboard"
                    ? "Welcome back, Admin"
                    : "Reports Management"}
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={loadReports}
                className="flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08]"
                title="Refresh reports"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300"
                title="Admin notifications"
              >
                <Bell size={18} />
              </div>

              <div className="hidden h-9 w-px bg-gray-200 dark:bg-white/10 sm:block" />

              <div className="hidden items-center gap-2 sm:flex">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300">
                  A
                </div>

                <ChevronDown
                  size={16}
                  className="text-gray-400"
                />
              </div>
            </div>
          </header>

          <div className="space-y-7 p-4 sm:p-6 lg:p-8">
            {/* Welcome section */}
            <section className="relative overflow-hidden rounded-3xl bg-gray-950 px-6 py-7 text-white shadow-xl shadow-gray-900/10 dark:bg-[#13131b] sm:px-8 sm:py-9">
              <div className="pointer-events-none absolute -right-14 -top-24 h-64 w-64 rounded-full border-[35px] border-emerald-500/10" />
              <div className="pointer-events-none absolute -bottom-28 right-40 h-52 w-52 rounded-full bg-emerald-500/10 blur-3xl" />

              <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
                    <Activity size={14} />
                    Admin Control Center
                  </div>

                  <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                    Make a cleaner city,
                    <span className="text-emerald-400"> one report at a time.</span>
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-gray-300 sm:text-[15px]">
                    Review community reports, monitor progress, and keep
                    cleanup requests organized from one place.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActivePage("reports")}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-gray-950 transition hover:-translate-y-0.5 hover:bg-emerald-400"
                >
                  <ClipboardList size={17} />
                  Review Reports
                  <ArrowUpRight size={16} />
                </button>
              </div>
            </section>

            {/* Statistics */}
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-extrabold text-gray-950 dark:text-white sm:text-lg">
                    Reports Overview
                  </h2>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                    Current status of community cleanup requests
                  </p>
                </div>

                <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300 sm:inline-flex">
                  <Activity size={14} />
                  Live local data
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 2xl:grid-cols-4">
                <StatCard
                  title="Total Reports"
                  value={stats.total}
                  subtitle="All submitted reports"
                  icon={ClipboardList}
                  color="green"
                />

                <StatCard
                  title="Pending Reports"
                  value={stats.pending}
                  subtitle="Waiting for review"
                  icon={Clock3}
                  color="amber"
                />

                <StatCard
                  title="In Progress"
                  value={stats.inProgress}
                  subtitle="Currently being handled"
                  icon={AlertCircle}
                  color="blue"
                />

                <StatCard
                  title="Completed"
                  value={stats.completed}
                  subtitle="Cleanup marked complete"
                  icon={CheckCircle2}
                  color="green"
                />
              </div>
            </section>

            {/* Activity and status breakdown */}
            {activePage === "dashboard" && (
              <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.08] dark:bg-gray-900/80 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="font-extrabold text-gray-950 dark:text-white">
                        Report Status
                      </h2>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Breakdown of all recorded reports
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300">
                      <Activity size={19} />
                    </div>
                  </div>

                  <div className="mt-7 space-y-5">
                    {recentActivity.map((item) => {
                      const percentage =
                        stats.total > 0
                          ? Math.round((item.value / stats.total) * 100)
                          : 0;

                      return (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                            <span className="font-medium text-gray-600 dark:text-gray-300">
                              {item.label}
                            </span>

                            <span className="font-bold text-gray-900 dark:text-white">
                              {item.value}
                              <span className="ml-2 text-xs font-medium text-gray-400">
                                {percentage}%
                              </span>
                            </span>
                          </div>

                          <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.07]">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${item.color}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.08] dark:bg-gray-900/80 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-gray-950 dark:text-white">
                        Quick Actions
                      </h2>

                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Manage your cleanup workflow
                      </p>
                    </div>

                    <Activity
                      size={19}
                      className="text-emerald-600"
                    />
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setActivePage("reports");
                        setStatusFilter("pending");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/60 dark:border-white/[0.08] dark:hover:border-amber-400/30 dark:hover:bg-amber-400/[0.05]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300">
                        <Clock3 size={19} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">
                          Review pending reports
                        </span>

                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          {stats.pending} reports need review
                        </span>
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="text-gray-400"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePage("reports");
                        setStatusFilter("all");
                        setSearch("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/60 dark:border-white/[0.08] dark:hover:border-emerald-400/30 dark:hover:bg-emerald-400/[0.05]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                        <ClipboardList size={19} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">
                          View all reports
                        </span>

                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          Search and update report statuses
                        </span>
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="text-gray-400"
                      />
                    </button>

                    <Link
                      to="/"
                      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50/60 dark:border-white/[0.08] dark:hover:border-blue-400/30 dark:hover:bg-blue-400/[0.05]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
                        <ArrowUpRight size={19} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">
                          Open user website
                        </span>

                        <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                          Preview the public-facing site
                        </span>
                      </span>

                      <ArrowUpRight
                        size={17}
                        className="text-gray-400"
                      />
                    </Link>
                  </div>
                </div>
              </section>
            )}

            {/* Reports table */}
            <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white dark:border-white/[0.08] dark:bg-gray-900/80">
              <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 dark:border-white/[0.08] sm:p-6 lg:flex-row lg:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-gray-950 dark:text-white">
                      {activePage === "dashboard"
                        ? "Recent Reports"
                        : "All Reports"}
                    </h2>

                    <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-bold text-gray-600 dark:bg-white/[0.08] dark:text-gray-300">
                      {filteredReports.length}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Review details and update each report status
                  </p>
                </div>

                <div className="flex flex-col gap-2 min-[480px]:flex-row">
                  <div className="relative min-w-0 flex-1 lg:w-60 lg:flex-none">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search reports..."
                      className="h-10 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 dark:border-white/10 dark:bg-gray-950 dark:text-white"
                    />
                  </div>

                  <div className="relative min-w-0">
                    <Filter
                      size={15}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <select
                      value={statusFilter}
                      onChange={(event) =>
                        setStatusFilter(event.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm font-medium text-gray-700 outline-none transition focus:border-emerald-500 dark:border-white/10 dark:bg-gray-950 dark:text-gray-200 min-[480px]:w-auto"
                      aria-label="Filter by report status"
                    >
                      <option value="all">All statuses</option>

                      {STATUS_OPTIONS.map((status) => (
                        <option
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-white/[0.06] dark:text-gray-500">
                    <ClipboardList size={28} />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-gray-900 dark:text-white">
                    {reports.length === 0
                      ? "No reports yet"
                      : "No matching reports"}
                  </h3>

                  <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {reports.length === 0
                      ? "Reports submitted through the user website will appear here when they are saved in this browser."
                      : "Try changing the search term or status filter to see more reports."}
                  </p>

                  {(search || statusFilter !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setStatusFilter("all");
                      }}
                      className="mt-4 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[820px] text-left">
                    <thead className="bg-gray-50/80 dark:bg-white/[0.025]">
                      <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        <th className="px-6 py-4">Report</th>
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Update status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                      {filteredReports
                        .slice(
                          0,
                          activePage === "dashboard"
                            ? 6
                            : filteredReports.length
                        )
                        .map(({ report, index }) => {
                          const id = getReportId(report, index);
                          const description =
                            report.description ||
                            report.details ||
                            "No description provided";
                          const status = getStatus(report);

                          return (
                            <tr
                              key={`${id}-${index}`}
                              className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.025]"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                                    <Leaf size={18} />
                                  </div>

                                  <div className="max-w-[220px]">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                                      {id}
                                    </p>

                                    <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                                      {description}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <div className="flex max-w-[190px] items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                  <MapPin
                                    size={15}
                                    className="mt-0.5 shrink-0 text-gray-400"
                                  />

                                  <span className="line-clamp-2 break-words">
                                    {getLocation(report)}
                                  </span>
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                  <CalendarDays
                                    size={15}
                                    className="text-gray-400"
                                  />

                                  {formatDate(report)}
                                </div>
                              </td>

                              <td className="px-6 py-4">
                                <StatusBadge status={status} />
                              </td>

                              <td className="px-6 py-4">
                                <div className="relative w-[145px]">
                                  <select
                                    value={status}
                                    disabled={updatingIndex === index}
                                    onChange={(event) =>
                                      updateStatus(index, event.target.value)
                                    }
                                    className="h-9 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-xs font-semibold text-gray-700 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 disabled:opacity-60 dark:border-white/10 dark:bg-gray-950 dark:text-gray-200"
                                    aria-label={`Update status for ${id}`}
                                  >
                                    {STATUS_OPTIONS.map((option) => (
                                      <option
                                        key={option.value}
                                        value={option.value}
                                      >
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>

                                  <ChevronDown
                                    size={14}
                                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

              {activePage === "dashboard" && filteredReports.length > 6 && (
                <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4 dark:border-white/[0.08] sm:px-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Showing 6 of {filteredReports.length} reports
                  </p>

                  <button
                    type="button"
                    onClick={() => setActivePage("reports")}
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200"
                  >
                    View all reports
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              )}
            </section>

            {/* Footer */}
            <footer className="flex flex-col items-center justify-between gap-2 pb-3 text-center text-xs text-gray-500 dark:text-gray-500 sm:flex-row sm:text-left">
              <p>© {new Date().getFullYear()} EcoPulse Admin Dashboard</p>

              <p className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Built for cleaner communities
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}