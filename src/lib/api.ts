import type { PlanRequest, PlanResponse } from "@/types/plan";
import type { NutritionPlanResponse } from "@/types/nutrition";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function generatePlan(
  requestBody: PlanRequest,
): Promise<PlanResponse> {
  const res = await fetch(`${API_BASE}/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

export async function getJournalReflection(
  prompt: string,
  entryText: string,
  tags: string[],
): Promise<string> {
  const res = await fetch(`${API_BASE}/journal/reflect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, entry_text: entryText, tags }),
  });

  if (!res.ok) {
    throw new Error("Failed to get reflection");
  }

  const data = await res.json();
  return data.reflection;
}

export async function generateNutritionPlan(
  requestBody: Record<string, unknown>,
): Promise<NutritionPlanResponse> {
  const res = await fetch(`${API_BASE}/nutrition-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}
