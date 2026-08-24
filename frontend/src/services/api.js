export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("start2scale_token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { message: (await response.text()) || "Request failed" };
  if (!response.ok) {
    const error = new Error(data.message || "Request failed");
    error.response = { status: response.status, data };
    throw error;
  }
  return { data };
}

export async function checkBackendHealth(signal) {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { Accept: "application/json" },
    signal,
  });
  const data = await response.json();

  if (!response.ok || data.status !== "ok") {
    throw new Error("The API or database is not ready");
  }

  return data;
}

const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  upload: (path, body) => request(path, { method: "POST", body }),
};

export default api;
