const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(response.status, formatApiError(data));
  return data as T;
}

export function body(data: unknown): RequestInit {
  return { body: JSON.stringify(data) };
}

function formatApiError(data: unknown) {
  if (!data || typeof data !== "object") return "Request failed";
  const message = "message" in data && typeof data.message === "string" ? data.message : "Request failed";
  const issues = "issues" in data && Array.isArray(data.issues) ? data.issues : [];
  const issueMessages = issues
    .map((issue) => {
      if (!issue || typeof issue !== "object") return "";
      const path = "path" in issue && Array.isArray(issue.path) ? issue.path.join(".") : "";
      const detail = "message" in issue && typeof issue.message === "string" ? issue.message : "";
      return [path, detail].filter(Boolean).join(": ");
    })
    .filter(Boolean);
  return issueMessages.length ? `${message}: ${issueMessages.join("; ")}` : message;
}
