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
  MONTHLY_GOAL: "prospection_monthlyGoal",
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

export type NextActionType = "ligar" | "visitar" | "enviar_proposta" | "aguardar_retorno";
export interface NextActionRecord {
  action: NextActionType;
  due: string; // ISO date
}
export type NextActionMap = Record<string, NextActionRecord>;
export type LastContactMap = Record<string, string>; // id -> ISO date
export type ContractValueMap = Record<string, number>; // id -> value in BRL
export type NegociationStartMap = Record<string, string>; // id -> ISO date when entered em_negociacao

const KEYS_EXTRA = {
  LAST_CONTACT: "prospection_lastContact",
  NEXT_ACTION: "prospection_nextAction",
  CONTRACT_VALUE: "prospection_contractValue",
  NEGOCIATION_START: "prospection_negociationStart",
} as const;

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
  city?: string; // for "cidades mais trabalhadas"
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

  getLastContact(): LastContactMap {
    return getJson<LastContactMap>(KEYS_EXTRA.LAST_CONTACT, {});
  },
  setLastContact(id: string, dateStr: string) {
    const map = this.getLastContact();
    map[id] = dateStr;
    setJson(KEYS_EXTRA.LAST_CONTACT, map);
  },
  getLastContactFor(id: string): string | null {
    return this.getLastContact()[id] ?? null;
  },

  getNextAction(): NextActionMap {
    return getJson<NextActionMap>(KEYS_EXTRA.NEXT_ACTION, {});
  },
  setNextAction(id: string, record: NextActionRecord) {
    const map = this.getNextAction();
    map[id] = record;
    setJson(KEYS_EXTRA.NEXT_ACTION, map);
  },
  getNextActionFor(id: string): NextActionRecord | null {
    return this.getNextAction()[id] ?? null;
  },

  getContractValue(): ContractValueMap {
    return getJson<ContractValueMap>(KEYS_EXTRA.CONTRACT_VALUE, {});
  },
  setContractValue(id: string, value: number) {
    const map = this.getContractValue();
    map[id] = value;
    setJson(KEYS_EXTRA.CONTRACT_VALUE, map);
  },
  getContractValueFor(id: string): number | null {
    const v = this.getContractValue()[id];
    return v != null && v >= 0 ? v : null;
  },

  getNegociationStart(): NegociationStartMap {
    return getJson<NegociationStartMap>(KEYS_EXTRA.NEGOCIATION_START, {});
  },
  setNegociationStart(id: string, dateStr: string) {
    const map = this.getNegociationStart();
    map[id] = dateStr;
    setJson(KEYS_EXTRA.NEGOCIATION_START, map);
  },
  getNegociationStartFor(id: string): string | null {
    return this.getNegociationStart()[id] ?? null;
  },

  getDailyGoal(): number {
    const n = getJson<number>(KEYS.DAILY_GOAL, 20);
    return typeof n === "number" && n >= 0 ? n : 20;
  },
  setDailyGoal(goal: number) {
    setJson(KEYS.DAILY_GOAL, Math.max(0, Math.floor(goal)));
  },

  getMonthlyGoal(): number {
    const n = getJson<number>(KEYS.MONTHLY_GOAL, 200);
    return typeof n === "number" && n >= 0 ? n : 200;
  },
  setMonthlyGoal(goal: number) {
    setJson(KEYS.MONTHLY_GOAL, Math.max(0, Math.floor(goal)));
  },

  /** Count of businesses marked "ja_visitei" with today's date */
  getVisitadosHojeCount(): number {
    const map = this.getVisitStatus();
    const today = new Date().toISOString().slice(0, 10);
    return Object.values(map).filter(
      (r) => r.status === "ja_visitei" && r.date === today
    ).length;
  },

  /** Count of businesses marked "ja_visitei" with date in current week (Mon–Sun) */
  getVisitadosEstaSemanaCount(): number {
    const map = this.getVisitStatus();
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    const startStr = monday.toISOString().slice(0, 10);
    const endStr = sunday.toISOString().slice(0, 10);
    return Object.values(map).filter(
      (r) =>
        r.status === "ja_visitei" &&
        r.date &&
        r.date >= startStr &&
        r.date <= endStr
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

/** Probabilidade de fechar 0–100%: baseado em potencial, pipeline, visita, nota, score */
export function computeProbabilityOfClosing(
  potential: PotentialLevel | null,
  pipeline: PipelineStage | null,
  visitStatus: VisitStatus | null,
  rating: number | undefined,
  opportunityScore: number
): number {
  let p = 10; // base
  if (potential === "alto") p += 25;
  else if (potential === "medio") p += 15;
  else if (potential === "baixo") p += 5;
  if (pipeline === "em_negociacao") p += 20;
  if (pipeline === "cliente_fechado") return 100;
  if (visitStatus === "ja_visitei") p += 15;
  if (rating != null && rating > 4.3) p += 10;
  p += Math.round((opportunityScore / 10) * 15); // score 0–10 vira até +15
  return Math.min(100, Math.max(0, p));
}

/** Dias desde último contato (lastContactDate ISO); null se nunca */
export function daysSinceLastContact(lastContactIso: string | null): number | null {
  if (!lastContactIso) return null;
  const last = new Date(lastContactIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

/** Nível gamificação por total de clientes fechados */
export function getGamificationLevel(fechadosCount: number): { label: string; emoji: string } {
  if (fechadosCount >= 10) return { label: "Nível Ouro", emoji: "🏅" };
  if (fechadosCount >= 5) return { label: "Nível Prata", emoji: "🥈" };
  if (fechadosCount >= 1) return { label: "Nível Bronze", emoji: "🥉" };
  return { label: "Iniciante", emoji: "🌱" };
}
