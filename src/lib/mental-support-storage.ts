const ACTIVE_KEY = "rti_mental_support_active";
const DECLINED_KEY = "rti_mental_support_declined";
const ACTIVATED_AT_KEY = "rti_mental_support_activated_at";
const PROPOSAL_SHOWN_KEY = "rti_mental_proposal_shown_at";

export function isMentalSupportActive(): boolean {
  try {
    return localStorage.getItem(ACTIVE_KEY) === "true";
  } catch {
    return false;
  }
}

export function activateMentalSupport(): void {
  localStorage.setItem(ACTIVE_KEY, "true");
  localStorage.setItem(ACTIVATED_AT_KEY, new Date().toISOString());
}

export function deactivateMentalSupport(): void {
  localStorage.removeItem(ACTIVE_KEY);
  localStorage.setItem(DECLINED_KEY, new Date().toISOString());
}

export function declineMentalSupport(): void {
  localStorage.setItem(DECLINED_KEY, new Date().toISOString());
}

export function isMentalSupportDeclined(): boolean {
  try {
    const stored = localStorage.getItem(DECLINED_KEY);
    if (!stored) return false;
    const declinedDate = new Date(stored);
    const daysSince = Math.floor(
      (new Date().getTime() - declinedDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSince < 14;
  } catch {
    return false;
  }
}

export function getMentalSupportActivatedAt(): string | null {
  try {
    return localStorage.getItem(ACTIVATED_AT_KEY);
  } catch {
    return null;
  }
}

export function markMentalProposalShown(): void {
  try {
    localStorage.setItem(PROPOSAL_SHOWN_KEY, new Date().toISOString());
  } catch {
    // degrade silently
  }
}

export function wasMentalProposalRecentlyShown(): boolean {
  try {
    const iso = localStorage.getItem(PROPOSAL_SHOWN_KEY);
    if (!iso) return false;
    const shownAt = new Date(iso).getTime();
    const daysSince = Math.floor(
      (Date.now() - shownAt) / (1000 * 60 * 60 * 24),
    );
    return daysSince < 7;
  } catch {
    return false;
  }
}
