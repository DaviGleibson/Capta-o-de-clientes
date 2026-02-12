/**
 * LocalStorage keys and types for prospection/CRM-like data.
 */

export type VisitStatus = "ja_visitei" | "visitar_depois" | "sem_interesse";
export type PotentialLevel = "alto" | "medio" | "baixo";
export type PipelineStage = "novos" | "visitados" | "em_negociacao" | "cliente_fechado";

export interface VisitRecord {
  status: VisitStatus;
  date?: string; // ISO date when status is "ja_visitei"
}

const KEYS = {
  VISIT_STATUS: "prospection_visitStatus",
  POTENTIAL: "prospection_potential",
  NOTES: "prospection_notes",
  PIPELINE: "prospection_pipeline",
  DAILY_GOAL: "prospection_dailyGoal",
  BUSINESSES: "prospection_businesses",
} as const;

function getJson<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export type VisitStatusMap = Record<string, VisitRecord>;
export type PotentialMap = Record<string, PotentialLevel>;
export type NotesMap = Record<string, string>;
export type PipelineMap = Record<string, PipelineStage>;

/** Minimal business data we persist for "Minha Prospecção" list */
export interface ProspectionBusiness {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  rating?: number;
  userRatingsTotal?: number;
  cnpj?: string;
}

export const prospectionStorage = {
  getVisitStatus(): VisitStatusMap {
    return getJson<VisitStatusMap>(KEYS.VISIT_STATUS, {});
  },
  setVisitStatus(id: string, record: VisitRecord) {
    const map = this.getVisitStatus();
    map[id] = record;
    setJson(KEYS.VISIT_STATUS, map);
  },
  getVisitStatusFor(id: string): VisitRecord | null {
    return this.getVisitStatus()[id] ?? null;
  },

  getPotential(): PotentialMap {
    return getJson<PotentialMap>(KEYS.POTENTIAL, {});
  },
  setPotential(id: string, level: PotentialLevel) {
    const map = this.getPotential();
    map[id] = level;
    setJson(KEYS.POTENTIAL, map);
  },
  clearPotential(id: string) {
    const map = this.getPotential();
    delete map[id];
    setJson(KEYS.POTENTIAL, map);
  },
  getPotentialFor(id: string): PotentialLevel | null {
    return this.getPotential()[id] ?? null;
  },

  getNotes(): NotesMap {
    return getJson<NotesMap>(KEYS.NOTES, {});
  },
  setNotes(id: string, text: string) {
    const map = this.getNotes();
    map[id] = text;
    setJson(KEYS.NOTES, map);
  },
  getNotesFor(id: string): string {
    return this.getNotes()[id] ?? "";
  },

  getPipeline(): PipelineMap {
    return getJson<PipelineMap>(KEYS.PIPELINE, {});
  },
  setPipeline(id: string, stage: PipelineStage) {
    const map = this.getPipeline();
    map[id] = stage;
    setJson(KEYS.PIPELINE, map);
  },
  getPipelineFor(id: string): PipelineStage | null {
    return this.getPipeline()[id] ?? null;
  },

  getDailyGoal(): number {
    const n = getJson<number>(KEYS.DAILY_GOAL, 20);
    return typeof n === "number" && n >= 0 ? n : 20;
  },
  setDailyGoal(goal: number) {
    setJson(KEYS.DAILY_GOAL, Math.max(0, Math.floor(goal)));
  },

  /** Count of businesses marked "ja_visitei" with today's date */
  getVisitadosHojeCount(): number {
    const map = this.getVisitStatus();
    const today = new Date().toISOString().slice(0, 10);
    return Object.values(map).filter(
      (r) => r.status === "ja_visitei" && r.date === today
    ).length;
  },

  getProspectionBusinesses(): ProspectionBusiness[] {
    const raw = getJson<Record<string, ProspectionBusiness>>(KEYS.BUSINESSES, {});
    return Object.values(raw);
  },
  addProspectionBusiness(b: ProspectionBusiness) {
    const map = getJson<Record<string, ProspectionBusiness>>(KEYS.BUSINESSES, {});
    map[b.id] = b;
    setJson(KEYS.BUSINESSES, map);
  },
};

/** Score 0–10: +2 WhatsApp, +1 email, +1 rating>4.3, +2 potential alto, +1 medio */
export function computeOpportunityScore(
  business: { phone?: string; email?: string; rating?: number },
  potential: PotentialLevel | null
): { score: number; max: number } {
  let score = 0;
  const max = 10;
  if (business.phone) score += 2;
  if (business.email) score += 1;
  if (business.rating != null && business.rating > 4.3) score += 1;
  if (potential === "alto") score += 2;
  else if (potential === "medio") score += 1;
  return { score: Math.min(score, max), max };
}
