"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  email: string;
  password: string;
  active: boolean;
}

interface User {
  email: string;
  active: boolean;
  created_at: string;
  is_master: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    const masterFlag = localStorage.getItem("isMaster") === "true";

    if (!email || !masterFlag) {
      router.push("/dashboard");
      return;
    }
    setUserEmail(email);
    setIsMaster(masterFlag);

    fetchUsers(email);
  }, [router]);

  const authorizedFetch = async (
    url: string,
    options?: RequestInit,
    email?: string,
  ) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
        ...(email ? { "x-user-email": email } : {}),
      },
    });
  };

  const fetchUsers = async (email: string) => {
    try {
      setLoading(true);
      const response = await authorizedFetch("/api/users", {}, email);
      if (!response.ok) {
        throw new Error((await response.json()).error || "Erro ao listar usuários");
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error: any) {
      setMessage(error?.message || "Erro ao carregar usuários");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    const addUser = async () => {
      if (!newEmail || !newPassword) {
        setMessage("Preencha todos os campos");
        setMessageType("error");
        return;
      }

      try {
        const response = await authorizedFetch(
          "/api/users",
          {
            method: "POST",
            body: JSON.stringify({ email: newEmail, password: newPassword }),
          },
          userEmail,
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erro ao adicionar usuário");
        }

        const data = await response.json();
        saveUsers([...users, data.user]);
        setNewEmail("");
        setNewPassword("");
        setMessage("Usuário adicionado com sucesso!");
        setMessageType("success");
      } catch (error: any) {
        setMessage(error?.message || "Erro ao adicionar usuário");
        setMessageType("error");
      }
    };

    addUser();
  };

  const handleToggleActive = (email: string) => {
    const toggle = async () => {
      try {
        const user = users.find((u) => u.email === email);
        if (!user) return;

        const response = await authorizedFetch(
          `/api/users/${encodeURIComponent(email)}`,
          {
            method: "PATCH",
            body: JSON.stringify({ active: !user.active }),
          },
          userEmail,
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Erro ao atualizar usuário");
        }

        const data = await response.json();
        const updatedUsers = users.map((u) =>
          u.email === email ? data.user : u,
        );
        saveUsers(updatedUsers);
        setMessage("Status do usuário atualizado");
        setMessageType("success");
      } catch (error: any) {
        setMessage(error?.message || "Erro ao atualizar usuário");
        setMessageType("error");
      }
    };

    toggle();
  };

  const handleDeleteUser = (email: string) => {
    const remove = async () => {
      if (confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
        try {
          const response = await authorizedFetch(
            `/api/users/${encodeURIComponent(email)}`,
            { method: "DELETE" },
            userEmail,
          );

          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Erro ao excluir usuário");
          }

          const updatedUsers = users.filter((u) => u.email !== email);
          saveUsers(updatedUsers);
          setMessage("Usuário excluído com sucesso");
          setMessageType("success");
        } catch (error: any) {
          setMessage(error?.message || "Erro ao excluir usuário");
          setMessageType("error");
        }
      }
    };

    remove();
  };

  if (!isMaster) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header userEmail={userEmail} isMaster={isMaster} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gerenciar Usuários
            </h1>
            <p className="text-gray-600">
              Adicione, ative/desative e exclua usuários do sistema
            </p>
          </div>

          {message && (
            <Alert variant={messageType === "error" ? "destructive" : "default"} className="mb-6">
              {messageType === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Add User Form */}
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Adicionar Novo Usuário</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">E-mail</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="usuario@email.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleAddUser}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              </div>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Usuários Cadastrados ({users.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                Carregando usuários...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhum usuário cadastrado ainda
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.active}
                              onCheckedChange={() => handleToggleActive(user.email)}
                              disabled={user.is_master}
                            />
                            <span className={user.active ? "text-green-600" : "text-red-600"}>
                              {user.active ? "Ativo" : "Desativado"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.is_master ? (
                            <span className="text-xs uppercase text-purple-600 font-semibold">
                              Master
                            </span>
                          ) : (
                            <span className="text-xs uppercase text-gray-500">
                              Usuário
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!user.is_master && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.email)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
