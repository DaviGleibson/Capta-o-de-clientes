"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userEmail?: string;
  isMaster?: boolean;
}

export default function Header({ userEmail, isMaster }: HeaderProps) {
  const router = useRouter();
  const isMasterUser = Boolean(isMaster);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("isMaster");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              <Image
                src="/images/logo.png"
                alt="Orbite LocalBiz Connect"
                fill
                className="object-contain"
                sizes="40px"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Orbite LocalBiz Connect</h1>
              <p className="text-xs text-gray-600">Encontre negócios locais</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isMasterUser && (
              <Button
                variant="outline"
                onClick={() => router.push("/admin/users")}
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Gerenciar Usuários
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => router.push("/contatos")}
              className="flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Meus Contatos
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}