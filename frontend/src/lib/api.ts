// Base URL for the API. In production, set VITE_API_BASE to your backend URL including /api,
// e.g. "https://loan-backend-oyhr.onrender.com/api". Falls back to relative /api for local dev.
// Cast import.meta as any so this file doesn't depend on Vite's type declarations being present.
const raw = ((import.meta as any).env?.VITE_API_BASE as string | undefined) || "/api";
const API = raw.startsWith("http") && !raw.endsWith("/api") ? `${raw.replace(/\/$/, "")}/api` : raw;

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
