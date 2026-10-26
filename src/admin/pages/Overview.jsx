import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowUpRight,
  Activity,
  RefreshCw,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import ReportsTable from "../components/ReportsTable";
import ReportDetails from "../components/ReportDetails";
import {
  readReports,
  saveReports,
  normalizeStatus,
  getReportDate,
} from "../adminUtils";

export default function Overview() {
  const [reports, setReports] = useState(readReports);
  const [selectedReport, setSelectedReport] = useState(null);

  const refreshReports = () => {
    setReports(readReports());
  };

  useEffect(() => {
    window.addEventListener("reportsUpdated", refreshReports);
    window.addEventListener("storage", refreshReports);

    return () => {
      window.removeEventListener("reportsUpdated", refreshReports);
      window.removeEventListener("storage", refreshReports);
    };
  }, []);

  const indexedReports = useMemo(
    () =>
      reports.map((report, index) => ({
        ...report,
        __adminIndex: index,
      })),
    [reports]
  );

  const stats = useMemo(() => {
    const result = {
      total: reports.length,
      pending: 0,
      inProgress: 0,
      completed: 0,
      rejected: 0,
    };

    reports.forEach((report) => {
      const status = normalizeStatus(report);

      if (status === "pending") result.pending += 1;
      if (status === "in-progress") result.inProgress += 1;
      if (status === "completed") result.completed += 1;
      if (status === "rejected") result.rejected += 1;
    });

    return result;
  }, [reports]);

  const lastSevenDays = useMemo(() => {
    const today = new Date();
    const days = [];

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);

      const start = new Date(date);
      start.setHours(0, 0, 0, 0);

      const end = new Date(date);
      end.setHours(23, 59, 59, 999);

      const count = reports.filter((report) => {
        const reportDate = getReportDate(report);

        return (
          reportDate &&
          reportDate.getTime() >= start.getTime() &&
          reportDate.getTime() <= end.getTime()
        );
      }).length;

      days.push({
        label: date.toLocaleDateString("en", {
          weekday: "short",
        }),
        date: date.toLocaleDateString("en-GB"),
        count,
      });
    }

    return days;
  }, [reports]);

  const maxDailyCount = Math.max(
    1,
    ...lastSevenDays.map((day) => day.count)
  );

  const recentReports = useMemo(
    () =>
      [...indexedReports]
        .sort((a, b) => {
          const dateA = getReportDate(a)?.getTime() || 0;
          const dateB = getReportDate(b)?.getTime() || 0;
          return dateB - dateA;
        })
        .slice(0, 6),
    [indexedReports]
  );

  const changeStatus = (report, nextStatus) => {
    const index = report.__adminIndex;

    if (index == null || !reports[index]) return;

    const labels = {
      pending: "Pending",
      "in-progress": "In Progress",
      completed: "Completed",
      rejected: "Rejected",
    };

    const updated = reports.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            status: nextStatus,
            statusText: labels[nextStatus],
          }
        : item
    );

    setReports(updated);
    saveReports(updated);

    if (
      selectedReport &&
      selectedReport.__adminIndex === index
    ) {
      setSelectedReport({
        ...selectedReport,
        status: nextStatus,
        statusText: labels[nextStatus],
      });
    }
  };

  const statusItems = [
    {
      label: "Pending",
      count: stats.pending,
      color: "bg-amber-400",
    },
    {
      label: "In Progress",
      count: stats.inProgress,
      color: "bg-blue-400",
    },
    {
      label: "Completed",
      count: stats.completed,
      color: "bg-emerald-400",
    },
    {
      label: "Rejected",
      count: stats.rejected,
      color: "bg-red-400",
    },
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-400/15 bg-gradient-to-br from-[#102219] via-[#0D1510] to-[#0B0D0C] p-6 sm:p-8 lg:p-9">
        <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[35px] border-emerald-400/[0.04]" />

        <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              ADMIN CONTROL CENTER
            </span>

            <h2 className="mt-5 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl">
              A cleaner city starts with{" "}
              <span className="text-emerald-400">better action.</span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Monitor cleanup reports, track progress, and manage community
              requests from one workspace.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshReports}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-bold text-white transition hover:border-emerald-400/30 hover:bg-emerald-400/10"
          >
            <RefreshCw size={16} />
            Refresh data
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-white">
            Reports Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Summary of the reports currently saved in this browser.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 2xl:grid-cols-4">
          <StatsCard
            title="Total Reports"
            value={stats.total}
            description="All recorded reports"
            icon={ClipboardList}
            color="green"
          />

          <StatsCard
            title="Pending Reports"
            value={stats.pending}
            description="Waiting for review"
            icon={Clock3}
            color="amber"
          />

          <StatsCard
            title="In Progress"
            value={stats.inProgress}
            description="Currently being handled"
            icon={AlertCircle}
            color="blue"
          />

          <StatsCard
            title="Completed"
            value={stats.completed}
            description="Marked as resolved"
            icon={CheckCircle2}
            color="green"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.35fr_0.85fr]">
        <article className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-white">
                Reports Activity
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Submissions over the last 7 days
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <TrendingUp size={19} />
            </div>
          </div>

          <div className="mt-7 flex h-52 items-end gap-2 sm:gap-4">
            {lastSevenDays.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} reports`}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-bold text-gray-400">
                  {day.count}
                </span>

                <div className="flex h-[145px] w-full items-end justify-center overflow-hidden rounded-t-lg bg-white/[0.025]">
                  <div
                    className="w-full max-w-9 rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-300 transition-all duration-500"
                    style={{
                      height: `${
                        day.count > 0
                          ? Math.max(8, (day.count / maxDailyCount) * 100)
                          : 3
                      }%`,
                      opacity: day.count > 0 ? 1 : 0.3,
                    }}
                  />
                </div>

                <span className="text-[10px] font-medium text-gray-500 sm:text-xs">
                  {day.label}
                </span>
              </div>
            ))}
          </div>

          <p className="mt-5 border-t border-white/[0.06] pt-4 text-xs leading-5 text-gray-500">
            Only reports with readable dates appear in the daily chart.
          </p>
        </article>

        <article className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-white">
                Status Breakdown
              </h2>

              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                Current progress of all reports
              </p>
            </div>

            <Activity size={19} className="text-emerald-400" />
          </div>

          <div className="mt-7 space-y-5">
            {statusItems.map((item) => {
              const percentage =
                stats.total > 0
                  ? Math.round((item.count / stats.total) * 100)
                  : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-300">
                      {item.label}
                    </span>

                    <span className="text-xs font-bold text-gray-300">
                      {item.count}
                      <span className="ml-2 font-medium text-gray-500">
                        {percentage}%
                      </span>
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3.5">
            <CheckCircle2 size={20} className="text-emerald-300" />

            <div>
              <p className="text-sm font-bold text-white">
                {stats.total
                  ? `${Math.round(
                      (stats.completed / stats.total) * 100
                    )}% completion rate`
                  : "No reports available yet"}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Based on recorded report statuses
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D110F]">
        <div className="flex flex-col justify-between gap-3 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-extrabold text-white">Recent Reports</h2>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Latest community cleanup requests
            </p>
          </div>

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 self-start text-sm font-bold text-emerald-400 transition hover:text-emerald-300 sm:self-auto"
          >
            View all reports
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <ReportsTable
          reports={recentReports}
          onStatusChange={changeStatus}
          onView={setSelectedReport}
        />
      </section>

      {selectedReport && (
        <ReportDetails
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}