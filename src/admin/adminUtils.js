export const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export function readReports() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("allReports") || "[]"
    );

    if (Array.isArray(saved)) return saved;

    if (Array.isArray(saved?.reports)) {
      return saved.reports;
    }

    return [];
  } catch {
    return [];
  }
}

export function normalizeStatus(report) {
  const status = String(
    report?.status || report?.statusText || "pending"
  )
    .trim()
    .toLowerCase();

  if (
    status.includes("complete") ||
    status.includes("resolved") ||
    status.includes("solved") ||
    status.includes("مكتمل") ||
    status.includes("تم التنفيذ") ||
    status.includes("تم الحل") ||
    status.includes("تمت المعالجة")
  ) {
    return "completed";
  }

  if (
    status.includes("reject") ||
    status.includes("مرفوض") ||
    status.includes("رفض")
  ) {
    return "rejected";
  }

  if (
    status.includes("progress") ||
    status.includes("processing") ||
    status.includes("جاري التنفيذ") ||
    status.includes("قيد التنفيذ") ||
    status.includes("جاري العمل")
  ) {
    return "in-progress";
  }

  return "pending";
}

export function getReportDate(report) {
  const value =
    report?.date ||
    report?.createdAt ||
    report?.created_at;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function getReportId(report, index = 0) {
  return (
    report?.requestId ||
    report?.reportId ||
    report?.id ||
    `#${index + 1}`
  );
}

export function getReportLocation(report) {
  const location =
    report?.location ||
    report?.address ||
    report?.place;

  if (typeof location === "string" && location.trim()) {
    return location;
  }

  if (location && typeof location === "object") {
    if (location.address) return location.address;
    if (location.name) return location.name;

    if (location.lat != null && location.lng != null) {
      return `${location.lat}, ${location.lng}`;
    }
  }

  if (report?.lat != null && report?.lng != null) {
    return `${report.lat}, ${report.lng}`;
  }

  if (
    report?.latitude != null &&
    report?.longitude != null
  ) {
    return `${report.latitude}, ${report.longitude}`;
  }

  return "Location unavailable";
}

export function getReportImage(report) {
  return (
    report?.image ||
    report?.imageUrl ||
    report?.photo ||
    report?.photoUrl ||
    ""
  );
}

export function getReportDescription(report) {
  return (
    report?.description ||
    report?.details ||
    report?.wasteType ||
    "No description provided"
  );
}

export function formatReportDate(report) {
  const date = getReportDate(report);

  if (!date) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function saveReports(reports) {
  localStorage.setItem(
    "allReports",
    JSON.stringify(reports)
  );

  window.dispatchEvent(new Event("reportsUpdated"));
}