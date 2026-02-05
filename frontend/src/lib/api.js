const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const normalizeBase = (base) => base.replace(/\/+$/, "");

const buildUrl = (base, path) => {
  if (!base) return path;
  const cleanBase = normalizeBase(base);
  if (cleanBase.endsWith("/api") && path.startsWith("/api")) {
    return `${cleanBase}${path.replace(/^\/api/, "")}`;
  }
  return `${cleanBase}${path}`;
};

export const buildApiUrl = (path) => buildUrl(API_BASE, path);

export const fetchJson = async (path, init = undefined) => {
  const primaryUrl = buildApiUrl(path);
  const fallbackUrl = path;

  let res;
  try {
    res = await fetch(primaryUrl, init);
  } catch (err) {
    if (!API_BASE) throw err;
  }

  if (!res || !res.ok) {
    if (API_BASE && primaryUrl !== fallbackUrl) {
      res = await fetch(fallbackUrl, init);
    }
  }

  if (!res || !res.ok) {
    throw new Error(`Request failed: ${res ? res.status : "network error"}`);
  }

  return res.json();
};

const getFilenameFromDisposition = (disposition) => {
  if (!disposition) return null;
  const match = /filename\\*?=(?:UTF-8''|\"?)([^\";]+)/i.exec(disposition);
  return match ? decodeURIComponent(match[1].replace(/\"/g, "")) : null;
};

export const downloadFile = async (path, fallbackName = "dataset.xlsx") => {
  const url = buildApiUrl(path);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download failed: ${res.status}`);
  }
  const blob = await res.blob();
  const disposition = res.headers.get("content-disposition");
  const filename = getFilenameFromDisposition(disposition) || fallbackName;
  const link = document.createElement("a");
  const objectUrl = window.URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};
