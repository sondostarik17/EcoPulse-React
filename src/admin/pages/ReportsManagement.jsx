import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import Swal from "sweetalert2";
import StatsCard from "../components/StatsCard";
import ReportsTable from "../components/ReportsTable";
import ReportDetails from "../components/ReportDetails";
import {
  STATUS_OPTIONS,
  readReports,
  saveReports,
  normalizeStatus,
  getReportId,
  getReportLocation,
  getReportDescription,
  formatReportDate,
} from "../adminUtils";

export default function ReportsManagement() {
  const [reports, setReports] = useState(readReports);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState(null);

  const refreshReports = () => setReports(readReports());

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

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return indexedReports
      .filter((report) => {
        const matchesStatus =
          statusFilter === "all" ||
          normalizeStatus(report) === statusFilter;

        const searchableValues = [
          getReportId(report, report.__adminIndex),
          getReportLocation(report),
          getReportDescription(report),
          report.name,
        ];

        const matchesSearch =
          !query ||
          searchableValues.some((value) =>
            String(value || "").toLowerCase().includes(query)
          );

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(
          a.date || a.createdAt || a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.date || b.createdAt || b.created_at || 0
        ).getTime();

        return (Number.isFinite(dateB) ? dateB : 0) -
          (Number.isFinite(dateA) ? dateA : 0);
      });
  }, [indexedReports, search, statusFilter]);

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

    if (selectedReport?.__adminIndex === index) {
      setSelectedReport({
        ...selectedReport,
        status: nextStatus,
        statusText: labels[nextStatus],
      });
    }
  };

  const deleteReport = async (report) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Delete this report?",
      text: "This removes the report from the current browser's saved data.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#4b5563",
      background: "#111412",
      color: "#ffffff",
    });

    if (!result.isConfirmed) return;

    const index = report.__adminIndex;
    if (index == null || !reports[index]) return;

    const updated = reports.filter(
      (_, itemIndex) => itemIndex !== index
    );

    setReports(updated);
    saveReports(updated);
    setSelectedReport(null);

    Swal.fire({
      icon: "success",
      title: "Report deleted",
      timer: 1300,
      showConfirmButton: false,
      background: "#111412",
      color: "#ffffff",
    });
  };

  const exportCSV = () => {
    const columns = [
      "Report ID",
      "Location",
      "Description",
      "Date",
      "Status",
    ];

    const rows = filteredReports.map((report) => [
      getReportId(report, report.__adminIndex),
      getReportLocation(report),
      getReportDescription(report),
      formatReportDate(report),
      STATUS_OPTIONS.find(
        (option) => option.value === normalizeStatus(report)
      )?.label || "Pending",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    // UTF-8 BOM helps spreadsheet apps open Arabic text correctly.
    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ecopulse-reports.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const pending = reports.filter(
    (report) => normalizeStatus(report) === "pending"
  ).length;

  const completed = reports.filter(
    (report) => normalizeStatus(report) === "completed"
  ).length;

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[2px] text-emerald-400">
            Operations
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Reports Management
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
            Review incoming reports, check their locations, and update their
            progress.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refreshReports}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.07]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-emerald-400"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3">
        <StatsCard
          title="All Reports"
          value={reports.length}
          description="All saved submissions"
          icon={ClipboardList}
          color="green"
        />

        <StatsCard
          title="Pending Review"
          value={pending}
          description="Awaiting action"
          icon={Filter}
          color="amber"
        />

        <StatsCard
          title="Completed"
          value={completed}
          description="Marked as completed"
          icon={ClipboardList}
          color="blue"
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D110F]">
        <div className="border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-extrabold text-white">
                All submissions
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                {filteredReports.length} matching report(s)
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search ID, description, location..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-[#080A09] pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-emerald-400/50"
                />
              </div>

              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  aria-label="Filter by status"
                  className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#080A09] pl-9 pr-8 text-sm text-gray-200 outline-none focus:border-emerald-400/50 sm:w-48"
                >
                  <option value="all">All statuses</option>

                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <ReportsTable
          reports={filteredReports}
          onStatusChange={changeStatus}
          onView={setSelectedReport}
          onDelete={deleteReport}
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