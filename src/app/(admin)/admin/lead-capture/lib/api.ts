import type { LeadCaptureLog } from "./schemas";

const CONFIG_BASE = "/api/v1/internal/config";
const LOGS_BASE = "/api/v1/internal/lead-capture/logs";

export async function fetchConfig<T = unknown>(key: string): Promise<T> {
  const response = await fetch(`${CONFIG_BASE}/${key}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch config: ${key}`);
  }
  const json = await response.json();
  // Backend returns SystemConfig shape: { key, value, description, updated_at }
  // The actual config data lives in the `value` field
  return (json.value ?? json.data ?? json) as T;
}

export async function updateConfig<T = unknown>(
  key: string,
  value: T
): Promise<void> {
  const response = await fetch(`${CONFIG_BASE}/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Failed to update config: ${key}`);
  }
}

export async function fetchLogs(params: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ data: LeadCaptureLog[]; meta?: { total?: number } }> {
  const query = new URLSearchParams();
  if (params.limit) query.set("limit", String(params.limit));
  if (params.offset) query.set("offset", String(params.offset));
  if (params.status) query.set("status", params.status);

  const response = await fetch(`${LOGS_BASE}?${query.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch lead capture logs");
  }
  return response.json();
}

export async function fetchLog(id: string): Promise<LeadCaptureLog> {
  const response = await fetch(`${LOGS_BASE}/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch log: ${id}`);
  }
  const json = await response.json();
  return json.data ?? json;
}
