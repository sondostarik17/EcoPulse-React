import { useEffect, useState } from "react";
import {
  Bell,
  SlidersHorizontal,
  Database,
  Download,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import { readReports } from "../adminUtils";

const DEFAULT_SETTINGS = {
  notifications: true,
  compactTables: false,
  showReportDates: true,
};

function readSettings() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("ecopulseAdminSettings") || "{}"
    );

    return {
      ...DEFAULT_SETTINGS,
      ...saved,
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export default function AdminSettings() {
  const [settings, setSettings] = useState(readSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      "ecopulseAdminSettings",
      JSON.stringify(settings)
    );
  }, [settings]);

  const updateSetting = (key, value) => {
    setSaved(false);

    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveSettings = async () => {
    localStorage.setItem(
      "ecopulseAdminSettings",
      JSON.stringify(settings)
    );

    setSaved(true);

    await Swal.fire({
      icon: "success",
      title: "Settings saved",
      text: "Your preferences have been saved in this browser.",
      timer: 1400,
      showConfirmButton: false,
      background: "#111412",
      color: "#ffffff",
    });
  };

  const resetSettings = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Reset settings?",
      text: "Your admin preferences will return to their defaults.",
      showCancelButton: true,
      confirmButtonText: "Reset",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      background: "#111412",
      color: "#ffffff",
    });

    if (!result.isConfirmed) return;

    setSettings({ ...DEFAULT_SETTINGS });

    localStorage.setItem(
      "ecopulseAdminSettings",
      JSON.stringify(DEFAULT_SETTINGS)
    );

    setSaved(true);
  };

  const refreshData = () => {
    window.dispatchEvent(new Event("reportsUpdated"));
  };

  const exportData = () => {
    const reports = readReports();

    const columns = [
      "Report ID",
      "Description",
      "Location",
      "Date",
      "Status",
    ];

    const rows = reports.map((report, index) => [
      report.requestId || report.reportId || report.id || `#${index + 1}`,
      report.description || report.details || "",
      typeof report.location === "string"
        ? report.location
        : report.location?.address || report.location?.name || "",
      report.date || report.createdAt || "",
      report.statusText || report.status || "pending",
    ]);

    const escapeCSV = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [
      columns.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ecopulse-data.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-7">
      <section>
        <p className="text-xs font-bold uppercase tracking-[2px] text-emerald-400">
          Configuration
        </p>

        <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Admin Settings
        </h2>

        <p className="mt-2 text-sm leading-6 text-gray-400">
          Manage your local dashboard preferences and export saved report data.
        </p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0D110F]">
        <div className="flex items-center gap-3 border-b border-white/[0.07] p-5 sm:p-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <h3 className="font-extrabold text-white">
              Dashboard Preferences
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Saved on this browser
            </p>
          </div>
        </div>

        <div className="divide-y divide-white/[0.06]">
          <SettingRow
            icon={<Bell size={19} />}
            title="Notifications preference"
            description="Save your preference for notifications in the dashboard."
            checked={settings.notifications}
            onChange={(value) =>
              updateSetting("notifications", value)
            }
          />

          <SettingRow
            icon={<SlidersHorizontal size={19} />}
            title="Compact tables"
            description="Save your preference for a more compact table layout."
            checked={settings.compactTables}
            onChange={(value) =>
              updateSetting("compactTables", value)
            }
          />

          <SettingRow
            icon={<Database size={19} />}
            title="Show report dates"
            description="Save whether you prefer to display report dates in admin views."
            checked={settings.showReportDates}
            onChange={(value) =>
              updateSetting("showReportDates", value)
            }
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] p-5 sm:px-6">
          <button
            type="button"
            onClick={resetSettings}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.05]"
          >
            Reset defaults
          </button>

          <button
            type="button"
            onClick={saveSettings}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-gray-950 transition hover:bg-emerald-400"
          >
            <CheckCircle2 size={17} />
            {saved ? "Saved" : "Save settings"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.07] bg-[#0D110F] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
            <Database size={20} />
          </div>

          <div>
            <h3 className="font-extrabold text-white">
              Local Report Data
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-400">
              Refresh the dashboard's report event or download a CSV copy of
              reports stored in this browser.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={refreshData}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/[0.05]"
          >
            <RefreshCw size={16} />
            Refresh report data
          </button>

          <button
            type="button"
            onClick={exportData}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-gray-950 transition hover:bg-emerald-400"
          >
            <Download size={16} />
            Download reports CSV
          </button>
        </div>
      </section>

      <p className="text-xs leading-5 text-gray-600">
        These preferences are stored locally. They are not yet synchronized
        between devices or connected to a server-side settings database.
      </p>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  description,
  checked,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-5 sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-gray-300">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-white">{title}</p>

          <p className="mt-1 max-w-xl text-xs leading-5 text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-emerald-500" : "bg-gray-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}