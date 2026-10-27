export function formatNaira(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG")}`;
}

export function formatNumber(value) {
  return new Intl.NumberFormat("en-NG").format(
    Number(value) || 0
  );
}

export function formatDate(value) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function formatShortDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-NG", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
