/**
 * Resolves the Socket.io & API backend server URL dynamically.
 * Prioritizes configured environment variables, local dev hostnames,
 * and the deployed production Render backend.
 */
export function getBackendUrl() {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // 1. Explicitly configured VITE_BACKEND_URL
  if (envUrl && typeof envUrl === "string" && envUrl.trim()) {
    const cleaned = envUrl.trim().replace(/\/+$/, "");
    if (cleaned) return cleaned;
  }

  // 2. Localhost development
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "0.0.0.0" ||
      window.location.hostname.startsWith("192.168."))
  ) {
    return "http://localhost:3000";
  }

  // 3. Production Render backend fallback for Vercel deployment
  return "https://collabcode-mm6u.onrender.com";
}

/**
 * Pre-warms the Render backend service to eliminate cold-start lag.
 */
let pinged = false;
export function prewarmBackend() {
  if (pinged) return;
  pinged = true;
  const backendUrl = getBackendUrl();
  try {
    fetch(`${backendUrl}/`, { mode: "no-cors" }).catch(() => {
      // Ignore background warmup failures
    });
  } catch (e) {
    // Ignore
  }
}

