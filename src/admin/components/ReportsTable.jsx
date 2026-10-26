import { Eye, MapPin, CalendarDays, Trash2 } from "lucide-react";
import {
  STATUS_OPTIONS,
  formatReportDate,
  getReportDescription,
  getReportId,
  getReportImage,
  getReportLocation,
  normalizeStatus,
} from "../adminUtils";

const styles = {
  pending: "bg-amber-400/10 text-amber-300",
  "in-progress": "bg-blue-400/10 text-blue-300",
  completed: "bg-emerald-400/10 text-emerald-300",
  rejected: "bg-red-400/10 text-red-300",
};

export default function ReportsTable({
  reports = [],
  onStatusChange,
  onView,
  onDelete,
  showStatusActions = true,
}) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] text-gray-500">
          <Eye size={24} />
        </div>

        <h3 className="mt-4 font-bold text-white">No reports found</h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
          Try changing your search or filters, or wait for new reports.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px] text-left">
        <thead className="bg-white/[0.02]">
          <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            <th className="px-5 py-4 sm:px-6">Report</th>
            <th className="px-5 py-4">Location</th>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-white/[0.05]">
          {reports.map((report, index) => {
            const status = normalizeStatus(report);
            const image = getReportImage(report);
            const id = getReportId(
              report,
              report.__adminIndex ?? index
            );

            return (
              <tr
                key={`${id}-${report.__adminIndex ?? index}`}
                className="transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    {image ? (
                      <img
                        src={image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl border border-white/10 object-cover"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <Eye size={18} />
                      </div>
                    )}

                    <div className="min-w-0 max-w-[220px]">
                      <p className="text-sm font-bold text-white">
                        {id}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {getReportDescription(report)}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <span className="flex max-w-[190px] items-start gap-2 text-sm text-gray-400">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-emerald-400"
                    />

                    <span className="line-clamp-2 break-words">
                      {getReportLocation(report)}
                    </span>
                  </span>
                </td>

                <td className="whitespace-nowrap px-5 py-4">
                  <span className="flex items-center gap-2 text-xs text-gray-400">
                    <CalendarDays
                      size={14}
                      className="text-gray-500"
                    />

                    {formatReportDate(report)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {showStatusActions && onStatusChange ? (
                    <select
                      value={status}
                      onChange={(event) =>
                        onStatusChange(report, event.target.value)
                      }
                      aria-label={`Change status for ${id}`}
                      className="max-w-[145px] rounded-lg border border-white/10 bg-[#111612] px-2.5 py-2 text-xs font-semibold text-gray-200 outline-none focus:border-emerald-400"
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
                  ) : (
                    <span
                      className={`rounded-full px-2.5 py-1.5 text-[11px] font-semibold ${
                        styles[status] || styles.pending
                      }`}
                    >
                      {STATUS_OPTIONS.find(
                        (option) => option.value === status
                      )?.label || "Pending"}
                    </span>
                  )}
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    {onView && (
                      <button
                        type="button"
                        onClick={() => onView(report)}
                        title="View report"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.025] text-gray-400 transition hover:border-emerald-400/30 hover:text-emerald-300"
                      >
                        <Eye size={16} />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(report)}
                        title="Delete report"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-400/10 bg-red-400/[0.04] text-red-400 transition hover:bg-red-400/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}