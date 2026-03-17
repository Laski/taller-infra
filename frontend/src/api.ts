const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface Question {
  id: string;
  text: string;
  is_open: boolean;
  created_at: string;
}

export interface VoteSummary {
  counts: Record<string, number>; // JSON keys are strings: "1"–"5"
  total: number;
}

export async function getQuestion(): Promise<Question | null> {
  const res = await fetch(`${BASE}/question`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /question failed: ${res.status}`);
  return res.json();
}

export async function createQuestion(text: string): Promise<Question> {
  const res = await fetch(`${BASE}/question`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`POST /question failed: ${res.status}`);
  return res.json();
}

export async function closeQuestion(): Promise<Question> {
  const res = await fetch(`${BASE}/question/close`, { method: "PATCH" });
  if (!res.ok) throw new Error(`PATCH /question/close failed: ${res.status}`);
  return res.json();
}

export async function castVote(value: number): Promise<void> {
  const res = await fetch(`${BASE}/votes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ value }),
  });
  if (!res.ok) throw new Error(`POST /votes failed: ${res.status}`);
}

export async function getSummary(): Promise<VoteSummary> {
  const res = await fetch(`${BASE}/votes/summary`);
  if (!res.ok) throw new Error(`GET /votes/summary failed: ${res.status}`);
  return res.json();
}

export async function deleteQuestion(): Promise<void> {
  const res = await fetch(`${BASE}/question`, { method: "DELETE" });
  if (res.status === 404) return; // already gone — treat as success
  if (!res.ok) throw new Error(`DELETE /question failed: ${res.status}`);
}
