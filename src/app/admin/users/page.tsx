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

export default function AdminUsersPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email || email !== "orbite@orbite.com.br") {
      router.push("/dashboard");
      return;
    }
    setUserEmail(email);

    // Load users
    const storedUsers = localStorage.getItem("users");
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, [router]);

  const saveUsers = (updatedUsers: User[]) => {
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    if (!newEmail || !newPassword) {
      setMessage("Preencha todos os campos");
      setMessageType("error");
      return;
    }

    if (newEmail === "orbite@orbite.com.br") {
      setMessage("Não é possível adicionar o usuário master");
      setMessageType("error");
      return;
    }

    if (users.find(u => u.email === newEmail)) {
      setMessage("Usuário já existe");
      setMessageType("error");
      return;
    }

    const newUser: User = {
      email: newEmail,
      password: newPassword,
      active: true
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    setNewEmail("");
    setNewPassword("");
    setMessage("Usuário adicionado com sucesso!");
    setMessageType("success");
  };

  const handleToggleActive = (email: string) => {
    const updatedUsers = users.map(u => 
      u.email === email ? { ...u, active: !u.active } : u
    );
    saveUsers(updatedUsers);
    setMessage("Status do usuário atualizado");
    setMessageType("success");
  };

  const handleDeleteUser = (email: string) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) {
      const updatedUsers = users.filter(u => u.email !== email);
      saveUsers(updatedUsers);
      setMessage("Usuário excluído com sucesso");
      setMessageType("success");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header userEmail={userEmail} />

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
            
            {users.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nenhum usuário cadastrado ainda
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Senha</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.email}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell className="font-mono text-sm">••••••••</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={user.active}
                              onCheckedChange={() => handleToggleActive(user.email)}
                            />
                            <span className={user.active ? "text-green-600" : "text-red-600"}>
                              {user.active ? "Ativo" : "Desativado"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
