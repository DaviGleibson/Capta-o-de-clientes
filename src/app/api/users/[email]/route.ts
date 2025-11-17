import { NextRequest, NextResponse } from "next/server";
import {
  deleteUser,
  updateUserStatus,
  verifyMasterAccess,
} from "@/lib/user-service";

const requesterHeader = "x-user-email";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { email: string } },
) {
  try {
    const requester = request.headers.get(requesterHeader) || undefined;
    await verifyMasterAccess(requester);

    const email = decodeURIComponent(params.email);
    const { active } = await request.json();

    if (typeof active !== "boolean") {
      return NextResponse.json(
        { error: "Informe o status 'active' como booleano" },
        { status: 400 },
      );
    }

    const user = await updateUserStatus(email, { active });
    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao atualizar usuário" },
      { status: 400 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { email: string } },
) {
  try {
    const requester = request.headers.get(requesterHeader) || undefined;
    await verifyMasterAccess(requester);

    const email = decodeURIComponent(params.email);
    await deleteUser(email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao excluir usuário" },
      { status: 400 },
    );
  }
}


