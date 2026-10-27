const DEFAULT_DESCRIPTION =
  "PENCILBOY. — PNCHE STUDIIOS. Independent fashion, drops and stories from Lagos.";

export function setPageMeta(title, description = DEFAULT_DESCRIPTION) {
  document.title = title;

  let meta = document.querySelector('meta[name="description"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.appendChild(meta);
  }

  meta.content = description;
}
