import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("start2scale_token"),
  );
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("start2scale_user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("start2scale_user");
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(token));

  function saveSession(data) {
    localStorage.setItem("start2scale_token", data.token);
    localStorage.setItem("start2scale_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    localStorage.removeItem("start2scale_token");
    localStorage.removeItem("start2scale_user");
    setToken(null);
    setUser(null);
  }

  async function authRequest(path, body, saveWhenAuthenticated = true) {
    const response = await fetch(`${apiUrl}/auth/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Authentication request failed");
    }

    if (saveWhenAuthenticated && data.token) saveSession(data);
    return data;
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${apiUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Session is invalid");
        return response.json();
      })
      .then((data) => {
        setUser(data.user);
        localStorage.setItem("start2scale_user", JSON.stringify(data.user));
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login: async (credentials) =>
        (await authRequest("login", credentials)).user,
      adminLogin: async (credentials) =>
        (await authRequest("admin/login", credentials)).user,
      register: (details) => authRequest("register", details),
      verifyGovernmentEmail: async (details) =>
        (await authRequest("verify-government-email", details)).user,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
