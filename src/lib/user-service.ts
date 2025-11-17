import bcrypt from "bcryptjs";
import db from "./db";

export interface UserRecord {
  id: number;
  email: string;
  password_hash: string;
  active: boolean;
  is_master: boolean;
  created_at: Date;
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
    active: Boolean(user.active),
    is_master: Boolean(user.is_master),
    created_at: user.created_at instanceof Date 
      ? user.created_at.toISOString() 
      : String(user.created_at),
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
  await db.execute(
    `INSERT INTO ${USERS_TABLE} (email, password_hash, active, is_master) VALUES (?, ?, ?, ?)`,
    [MASTER_EMAIL.toLowerCase(), passwordHash, MASTER_ACTIVE ? 1 : 0, 1]
  );
}

export async function getUserByEmail(
  email: string,
): Promise<UserRecord | null> {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM ${USERS_TABLE} WHERE email = ? LIMIT 1`,
      [email.toLowerCase()]
    ) as [UserRecord[], any];

    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0];
    }

    return null;
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    throw new Error("Erro ao buscar usuário");
  }
}

export async function listUsers(): Promise<PublicUser[]> {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM ${USERS_TABLE} ORDER BY created_at ASC`
    ) as [UserRecord[], any];

    if (Array.isArray(rows)) {
      return rows.map(toPublicUser);
    }

    return [];
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    throw new Error("Erro ao listar usuários");
  }
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
  try {
    await db.execute(
      `INSERT INTO ${USERS_TABLE} (email, password_hash, active, is_master) VALUES (?, ?, ?, ?)`,
      [
        normalizedEmail,
        passwordHash,
        1,
        options?.isMaster ? 1 : 0,
      ]
    );

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Erro ao criar usuário");
    }

    return toPublicUser(user);
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error("Usuário já existe");
    }
    throw new Error("Erro ao criar usuário");
  }
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

  const updateFields: string[] = [];
  const updateValues: any[] = [];

  if (updates.active !== undefined) {
    updateFields.push("active = ?");
    updateValues.push(updates.active ? 1 : 0);
  }

  if (updates.is_master !== undefined) {
    updateFields.push("is_master = ?");
    updateValues.push(updates.is_master ? 1 : 0);
  }

  if (updateFields.length === 0) {
    return toPublicUser(existing);
  }

  updateValues.push(normalizedEmail);

  try {
    await db.execute(
      `UPDATE ${USERS_TABLE} SET ${updateFields.join(", ")} WHERE email = ?`,
      updateValues
    );

    const user = await getUserByEmail(normalizedEmail);
    if (!user) {
      throw new Error("Usuário não encontrado após atualização");
    }

    return toPublicUser(user);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    throw new Error("Erro ao atualizar usuário");
  }
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

  try {
    await db.execute(
      `DELETE FROM ${USERS_TABLE} WHERE email = ?`,
      [normalizedEmail]
    );
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    throw new Error("Erro ao excluir usuário");
  }
}
