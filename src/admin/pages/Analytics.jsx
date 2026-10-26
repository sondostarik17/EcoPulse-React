import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChartNoAxesCombined,
  MapPin,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import {
  readReports,
  normalizeStatus,
  getReportDate,
  getReportLocation,
} from "../adminUtils";

export default function Analytics() {
  const [reports, setReports] = useState(readReports);
  const [period, setPeriod] = useState("30");

  const refreshReports = () => setReports(readReports());

  useEffect(() => {
    window.addEventListener("reportsUpdated", refreshReports);
    window.addEventListener("storage", refreshReports);

    return () => {
      window.removeEventListener("reportsUpdated", refreshReports);
      window.removeEventListener("storage", refreshReports);
    };
  }, []);

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

  const dailyActivity = useMemo(() => {
    const numberOfDays = Number(period);
    const today = new Date();
    const results = [];

    for (let offset = numberOfDays - 1; offset >= 0; offset -= 1) {
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

      results.push({
        date: date.toLocaleDateString("en-GB"),
        label:
          numberOfDays === 7
            ? date.toLocaleDateString("en", { weekday: "short" })
            : date.toLocaleDateString("en", {
                day: "2-digit",
                month: "short",
              }),
        count,
      });
    }

    return results;
  }, [reports, period]);

  const maxCount = Math.max(
    1,
    ...dailyActivity.map((item) => item.count)
  );

  const topLocations = useMemo(() => {
    const counts = new Map();

    reports.forEach((report) => {
      const location = getReportLocation(report);

      if (location !== "Location unavailable") {
        counts.set(location, (counts.get(location) || 0) + 1);
      }
    });

    return [...counts.entries()]
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [reports]);

  const statusData = [
    { label: "Pending", value: stats.pending, color: "bg-amber-400" },
    {
      label: "In Progress",
      value: stats.inProgress,
      color: "bg-blue-400",
    },
    {
      label: "Completed",
      value: stats.completed,
      color: "bg-emerald-400",
    },
    { label: "Rejected", value: stats.rejected, color: "bg-red-400" },
  ];

  const peak = Math.max(1, ...topLocations.map((item) => item.count));

  const completionRate =
    stats.total > 0
      ? Math.round((stats.completed / stats.total) * 100)
      : 0;

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-emerald-400">
            Insights
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Analytics
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-400">
            Understand report activity and cleanup progress from available
            records.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshReports}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.07]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 2xl:grid-cols-4">
        <StatsCard
          title="Total Reports"
          value={stats.total}
          description="All recorded reports"
          icon={ChartNoAxesCombined}
          color="green"
        />

        <StatsCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description="Completed / total reports"
          icon={TrendingUp}
          color="blue"
        />

        <StatsCard
          title="Pending"
          value={stats.pending}
          description="Awaiting review"
          icon={CalendarDays}
          color="amber"
        />

        <StatsCard
          title="In Progress"
          value={stats.inProgress}
          description="Currently being handled"
          icon={Activity}
          color="purple"
        />
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-extrabold text-white">
              Submission Trend
            </h3>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Number of reports received per day
            </p>
          </div>

          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            aria-label="Analytics time period"
            className="h-10 rounded-xl border border-white/10 bg-[#080A09] px-3 text-sm text-gray-200 outline-none focus:border-emerald-400/50"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="mt-8 flex h-60 items-end gap-1 overflow-x-auto pb-2 sm:gap-2">
          {dailyActivity.map((item) => (
            <div
              key={item.date}
              title={`${item.date}: ${item.count} reports`}
              className="flex h-full min-w-[10px] flex-1 flex-col items-center justify-end gap-2"
            >
              <span className="text-[10px] font-semibold text-gray-500">
                {item.count || ""}
              </span>

              <div className="flex h-[175px] w-full items-end justify-center rounded-t-md bg-white/[0.025]">
                <div
                  className="w-full max-w-6 rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-300 transition-all duration-500"
                  style={{
                    height: `${
                      item.count
                        ? Math.max(6, (item.count / maxCount) * 100)
                        : 2
                    }%`,
                    opacity: item.count ? 1 : 0.25,
                  }}
                />
              </div>

              {(period === "7" ||
                item.date.endsWith("/01") ||
                item.date.endsWith("/15")) && (
                <span className="whitespace-nowrap text-[9px] text-gray-500">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          The chart includes reports with valid dates. If the source data has
          no dates, the chart will show no recorded activity.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <article className="rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
              <Activity size={20} />
            </div>

            <div>
              <h3 className="font-extrabold text-white">
                Status Distribution
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                All report statuses
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {statusData.map((item) => {
              const percentage =
                stats.total > 0
                  ? Math.round((item.value / stats.total) * 100)
                  : 0;

              return (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="text-sm text-gray-300">
                      {item.label}
                    </span>

                    <span className="text-xs font-bold text-gray-400">
                      {item.value} ({percentage}%)
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div
                      className={`h-2 rounded-full ${item.color}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <MapPin size={20} />
            </div>

            <div>
              <h3 className="font-extrabold text-white">
                Frequent Report Locations
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Locations grouped by saved location text
              </p>
            </div>
          </div>

          {topLocations.length === 0 ? (
            <p className="mt-7 rounded-xl border border-dashed border-white/10 p-5 text-sm text-gray-500">
              No location data is available yet.
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              {topLocations.map((item) => (
                <div key={item.location}>
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <span className="flex min-w-0 items-start gap-2 text-sm text-gray-300">
                      <MapPin
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />

                      <span className="break-words">{item.location}</span>
                    </span>

                    <span className="shrink-0 text-xs font-bold text-gray-400">
                      {item.count}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06]">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{
                        width: `${(item.count / peak) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </div>
  );
}