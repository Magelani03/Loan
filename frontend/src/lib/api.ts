const API = "/api";

export const api = {
  async get<T>(path: string): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  async post<T>(path: string, body: any, file?: File): Promise<T> {
    const token = localStorage.getItem("token");
    const form = new FormData();
    Object.entries(body).forEach(([k, v]) => form.append(k, v as string));
    if (file) form.append("file", file);

    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};