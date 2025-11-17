"use client";

import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userEmail?: string;
}

export default function Header({ userEmail }: HeaderProps) {
  const router = useRouter();
  const isMasterUser = userEmail === "orbite@orbite.com.br";

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push("/dashboard")}>
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-lg p-2">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
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