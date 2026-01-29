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

export const fetchJson = async (path) => {
  const primaryUrl = buildUrl(API_BASE, path);
  const fallbackUrl = path;

  let res;
  try {
    res = await fetch(primaryUrl);
  } catch (err) {
    if (!API_BASE) throw err;
  }

  if (!res || !res.ok) {
    if (API_BASE && primaryUrl !== fallbackUrl) {
      res = await fetch(fallbackUrl);
    }
  }

  if (!res || !res.ok) {
    throw new Error(`Request failed: ${res ? res.status : "network error"}`);
  }

  return res.json();
};
