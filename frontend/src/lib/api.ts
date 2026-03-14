// Base URL for the API. Set VITE_API_BASE to your backend URL, e.g. "https://loan-backend-oyhr.onrender.com/api"
// (use https:// with two slashes). Paths like /auth/login are appended automatically.
const raw = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || "/api";
const normalized = raw.startsWith("http") && raw.includes("/api")
  ? raw.replace(/(\/api).*$/, "$1")
  : raw;
const API =
  normalized.startsWith("http") && !normalized.endsWith("/api")
    ? `${normalized.replace(/\/$/, "")}/api`
    : normalized;

/** Turn a relative document URL (e.g. /uploads/xyz) into a full URL on the backend. */
export function documentUrl(path: string | undefined): string {
  if (!path) return "#";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const origin = API.startsWith("http") ? API.replace(/\/api\/?$/, "") : "http://localhost:4000";
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async post<T>(path: string, body: any, file?: File): Promise<T> {
    const token = localStorage.getItem("token");

    const headers: HeadersInit = {
      Authorization: token ? `Bearer ${token}` : "",
    };

    let fetchOptions: RequestInit = {
      method: "POST",
      headers,
    };

    if (file) {
      const form = new FormData();
      Object.entries(body).forEach(([k, v]) => {
        if (v != null) form.append(k, String(v));
      });
      form.append("file", file);
      fetchOptions.body = form; // browser sets Content-Type for FormData
    } else {
      fetchOptions.headers = {
        ...headers,
        "Content-Type": "application/json",
      };
      fetchOptions.body = JSON.stringify(body);
    }

    const res = await fetch(`${API}${path}`, fetchOptions);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};
