const BASE_URL_KEY = "sparq_admin_base_url";
const TOKEN_KEY = "sparq_admin_token";

export function getBaseUrl(): string {
  // Always prefer the env variable — avoids stale localStorage values with wrong /api/v1 suffix
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  // Fallback to localStorage only when env variable is not set
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(BASE_URL_KEY);
    if (stored) return stored.replace(/\/$/, "");
  }
  return "http://143.244.139.153:12500/api/v1";
}

export function setBaseUrl(url: string) {
  localStorage.setItem(BASE_URL_KEY, url.replace(/\/$/, ""));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
};

export async function api<T = any>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const msg = json?.message || json?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}
