import { NextRequest, NextResponse } from "next/server";
import { toPublicUser, validateCredentials } from "@/lib/user-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios" },
        { status: 400 },
      );
    }

    const user = await validateCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha incorretos" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      user: toPublicUser(user),
    });
  } catch (error: any) {
    const message =
      error?.message || "Não foi possível processar o login no momento.";
    const status = message.includes("desativado") ? 403 : 500;
    console.error("Erro em /api/auth/login:", error);
    return NextResponse.json({ error: message }, { status });
  }
}


