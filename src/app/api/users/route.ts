import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  listUsers,
  verifyMasterAccess,
} from "@/lib/user-service";

const requesterHeader = "x-user-email";

export async function GET(request: NextRequest) {
  try {
    const requester = request.headers.get(requesterHeader) || undefined;
    await verifyMasterAccess(requester);

    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao listar usuários" },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const requester = request.headers.get(requesterHeader) || undefined;
    await verifyMasterAccess(requester);

    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const user = await createUser(email, password);
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao criar usuário" },
      { status: 400 },
    );
  }
}


