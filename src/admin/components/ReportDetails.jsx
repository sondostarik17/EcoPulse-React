import {
  X,
  MapPin,
  CalendarDays,
  ClipboardList,
  Image as ImageIcon,
} from "lucide-react";
import {
  formatReportDate,
  getReportDescription,
  getReportId,
  getReportImage,
  getReportLocation,
  normalizeStatus,
} from "../adminUtils";

const statusStyles = {
  pending: "bg-amber-400/10 text-amber-300",
  "in-progress": "bg-blue-400/10 text-blue-300",
  completed: "bg-emerald-400/10 text-emerald-300",
  rejected: "bg-red-400/10 text-red-300",
};

const statusLabels = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
  rejected: "Rejected",
};

export default function ReportDetails({ report, onClose }) {
  if (!report) return null;

  const status = normalizeStatus(report);
  const image = getReportImage(report);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-detail-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0D110F] shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <ClipboardList size={20} />
            </div>

            <div>
              <h2
                id="report-detail-title"
                className="font-extrabold text-white"
              >
                Report Details
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                {getReportId(report, report.__adminIndex ?? 0)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report details"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-black/20">
            {image ? (
              <img
                src={image}
                alt="Reported waste"
                className="max-h-[320px] w-full object-contain"
              />
            ) : (
              <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-gray-500">
                <ImageIcon size={32} />
                <p className="text-sm">No image attached to this report</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-bold text-white">
              Report status
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                statusStyles[status] || statusStyles.pending
              }`}
            >
              {statusLabels[status] || "Pending"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Info
              icon={<MapPin size={17} />}
              label="Location"
              value={getReportLocation(report)}
            />

            <Info
              icon={<CalendarDays size={17} />}
              label="Submitted date"
              value={formatReportDate(report)}
            />
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Description
            </p>

            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
              {getReportDescription(report)}
            </p>
          </div>

          {(report.lat != null || report.latitude != null) && (
            <div className="rounded-xl border border-white/[0.07] p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Coordinates
              </p>

              <p className="mt-2 break-words text-sm text-gray-300">
                {report.lat ?? report.latitude},{" "}
                {report.lng ?? report.longitude}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/[0.07] px-5 py-4 text-right sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-emerald-400"
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="flex items-center gap-2 text-xs font-semibold text-gray-500">
        <span className="text-emerald-400">{icon}</span>
        {label}
      </p>

      <p className="mt-2 break-words text-sm leading-5 text-gray-200">
        {value || "—"}
      </p>
    </div>
  );
}