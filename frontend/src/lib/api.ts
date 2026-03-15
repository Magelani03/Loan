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
    if (!res.ok) {
      const text = await res.text();
      let message = text;
      try {
        const json = JSON.parse(text);
        if (json?.error) message = json.error;
      } catch {
        /* use text */
      }
      throw new Error(message);
    }
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
    if (!res.ok) {
      const text = await res.text();
      let message = text;
      try {
        const json = JSON.parse(text);
        if (json?.error) message = json.error;
      } catch {
        /* use text */
      }
      if (res.status === 405) {
        message = `405 Method Not Allowed. The request may be hitting the wrong server. Set VITE_API_BASE to your backend URL (e.g. https://your-backend.onrender.com/api).`;
      } else if (res.status === 404 && message === text && text.length < 100) {
        message = `404 Not Found. Check that VITE_API_BASE points to your backend (e.g. https://your-backend.onrender.com/api).`;
      }
      throw new Error(message);
    }
    return res.json();
  },
};
