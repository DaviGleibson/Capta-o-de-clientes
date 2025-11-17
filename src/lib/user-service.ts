import bcrypt from "bcryptjs";
import { supabaseServerClient } from "./supabase-server";

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  active: boolean;
  is_master: boolean;
  created_at: string;
}

export interface PublicUser {
  email: string;
  active: boolean;
  is_master: boolean;
  created_at: string;
}

const USERS_TABLE = "users";
const MASTER_EMAIL = process.env.MASTER_SEED_EMAIL;
const MASTER_PASSWORD = process.env.MASTER_SEED_PASSWORD;
const MASTER_ACTIVE =
  process.env.MASTER_SEED_ACTIVE === "false" ? false : true;

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    email: user.email,
    active: user.active,
    is_master: user.is_master,
    created_at: user.created_at,
  };
}

export async function ensureMasterUser() {
  if (!MASTER_EMAIL || !MASTER_PASSWORD) {
    return;
  }

  const existing = await getUserByEmail(MASTER_EMAIL);
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(MASTER_PASSWORD, 10);
  await supabaseServerClient.from(USERS_TABLE).insert({
    email: MASTER_EMAIL,
    password_hash: passwordHash,
    active: MASTER_ACTIVE,
    is_master: true,
  });
}

export async function getUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  const { data, error } = await supabaseServerClient
    .from<UserRecord>(USERS_TABLE)
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) {
    console.error("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário");
  }

  return data ?? null;
}

export async function listUsers(): Promise<PublicUser[]> {
  const { data, error } = await supabaseServerClient
    .from<UserRecord>(USERS_TABLE)
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Erro ao listar usuários:", error);
    throw new Error("Erro ao listar usuários");
  }

  return (data || []).map(toPublicUser);
}

export async function verifyMasterAccess(requesterEmail?: string) {
  if (!requesterEmail) {
    throw new Error("Usuário não autorizado");
  }
  const user = await getUserByEmail(requesterEmail);
  if (!user || !user.is_master || !user.active) {
    throw new Error("Acesso restrito ao usuário master");
  }
}

export async function validateCredentials(
  email: string,
  password: string,
): Promise<UserRecord | null> {
  await ensureMasterUser();

  const user = await getUserByEmail(email.toLowerCase());
  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return null;
  }

  if (!user.active) {
    throw new Error("Usuário desativado. Entre em contato com o administrador.");
  }

  return user;
}

export async function createUser(
  email: string,
  password: string,
  options?: { isMaster?: boolean },
): Promise<PublicUser> {
  const normalizedEmail = email.toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (existing) {
    throw new Error("Usuário já existe");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabaseServerClient
    .from<UserRecord>(USERS_TABLE)
    .insert({
      email: normalizedEmail,
      password_hash: passwordHash,
      active: true,
      is_master: options?.isMaster ?? false,
    })
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Erro ao criar usuário:", error);
    throw new Error("Erro ao criar usuário");
  }

  return toPublicUser(data);
}

export async function updateUserStatus(
  email: string,
  updates: Partial<Pick<UserRecord, "active" | "is_master">>,
): Promise<PublicUser> {
  const normalizedEmail = email.toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (!existing) {
    throw new Error("Usuário não encontrado");
  }

  if (existing.is_master && updates.active === false) {
    throw new Error("Não é possível desativar o usuário master");
  }

  const { data, error } = await supabaseServerClient
    .from<UserRecord>(USERS_TABLE)
    .update(updates)
    .eq("email", normalizedEmail)
    .select("*")
    .maybeSingle();

  if (error || !data) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }

  return toPublicUser(data);
}

export async function deleteUser(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const existing = await getUserByEmail(normalizedEmail);
  if (!existing) {
    throw new Error("Usuário não encontrado");
  }

  if (existing.is_master) {
    throw new Error("Não é possível excluir o usuário master");
  }

  const { error } = await supabaseServerClient
    .from<UserRecord>(USERS_TABLE)
    .delete()
    .eq("email", normalizedEmail);

  if (error) {
    console.error("Erro ao excluir usuário:", error);
    throw new Error("Erro ao excluir usuário");
  }
}

