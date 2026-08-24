import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { checkBackendHealth } from "../services/api.js";

const SystemStatusContext = createContext(null);
const HEALTH_CHECK_INTERVAL = 10 * 60 * 1000;
const HEALTH_CHECK_TIMEOUT = 65 * 1000;

export function SystemStatusProvider({ children }) {
  const [status, setStatus] = useState("connecting");
  const [lastCheckedAt, setLastCheckedAt] = useState(null);

  const checkStatus = useCallback(async () => {
    setStatus("connecting");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

    try {
      await checkBackendHealth(controller.signal);
      setStatus("operational");
    } catch {
      setStatus("unavailable");
    } finally {
      clearTimeout(timeout);
      setLastCheckedAt(Date.now());
    }
  }, []);

  useEffect(() => {
    checkStatus();

    const interval = setInterval(checkStatus, HEALTH_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const value = useMemo(
    () => ({ status, lastCheckedAt, checkStatus }),
    [status, lastCheckedAt, checkStatus],
  );

  return (
    <SystemStatusContext.Provider value={value}>
      {children}
    </SystemStatusContext.Provider>
  );
}

export function useSystemStatus() {
  const context = useContext(SystemStatusContext);

  if (!context) {
    throw new Error("useSystemStatus must be used within SystemStatusProvider");
  }

  return context;
}
