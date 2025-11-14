"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MessageCircle, Mail, ArrowLeft, Search, Copy } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Business } from "@/components/BusinessCard";
import { useToast } from "@/components/ui/use-toast";

export default function ContactsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [contactedBusinesses, setContactedBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("contactedBusinessesData");
      if (stored) {
        setContactedBusinesses(JSON.parse(stored));
      }
    }
  }, [mounted]);

  const handleRemove = (businessId: string) => {
    const updated = contactedBusinesses.filter((b) => b.id !== businessId);
    setContactedBusinesses(updated);
    localStorage.setItem("contactedBusinessesData", JSON.stringify(updated));

    // Update the contacted IDs list
    const contactedIds = localStorage.getItem("contactedBusinesses");
    if (contactedIds) {
      const ids = JSON.parse(contactedIds).filter((id: string) => id !== businessId);
      localStorage.setItem("contactedBusinesses", JSON.stringify(ids));
    }

    // Remove from selected emails if present
    const business = contactedBusinesses.find((b) => b.id === businessId);
    if (business?.email && selectedEmails.has(business.email)) {
      const newSelected = new Set(selectedEmails);
      newSelected.delete(business.email);
      setSelectedEmails(newSelected);
    }
  };

  const handleWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const handleEmailSelect = (email: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(email)) {
      newSelected.delete(email);
    } else {
      newSelected.add(email);
    }
    setSelectedEmails(newSelected);
  };

  const copyEmailList = () => {
    const emailList = Array.from(selectedEmails).join("; ");
    navigator.clipboard.writeText(emailList);
    toast({
      title: "Lista copiada!",
      description: `${selectedEmails.size} email(s) copiado(s) para a área de transferência`,
    });
  };

  const clearEmailList = () => {
    setSelectedEmails(new Set());
    toast({
      title: "Lista limpa",
      description: "Todos os emails foram removidos da lista",
    });
  };

  const selectAllEmails = () => {
    const allEmails = filteredBusinesses
      .filter((b) => b.email)
      .map((b) => b.email!);
    setSelectedEmails(new Set(allEmails));
  };

  const filteredBusinesses = contactedBusinesses.filter((business) =>
    business.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para busca
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Negócios Contatados
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerencie os negócios que você já entrou em contato
                </p>
              </div>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {contactedBusinesses.length} contato{contactedBusinesses.length !== 1 ? "s" : ""}
              </Badge>
            </div>

            {contactedBusinesses.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* Email List Panel */}
          {selectedEmails.size > 0 && (
            <Card className="p-6 shadow-lg bg-white border-blue-200 mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lista de E-mails Selecionados
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedEmails.size} email(s) selecionado(s)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={copyEmailList}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Lista
                    </Button>
                    <Button
                      onClick={clearEmailList}
                      variant="outline"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-32 overflow-y-auto">
                  <p className="text-sm text-gray-700 font-mono break-all">
                    {Array.from(selectedEmails).join("; ")}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {filteredBusinesses.length > 0 ? (
            <>
              {filteredBusinesses.some((b) => b.email) && (
                <div className="mb-4">
                  <Button
                    onClick={selectAllEmails}
                    variant="outline"
                    size="sm"
                  >
                    Selecionar todos os emails
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                {filteredBusinesses.map((business) => (
                  <Card key={business.id} className="p-6 bg-white hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {business.address}
                        </p>

                        {business.email && (
                          <div className="flex items-center gap-3 mb-3">
                            <Checkbox
                              checked={selectedEmails.has(business.email)}
                              onCheckedChange={() => handleEmailSelect(business.email!)}
                            />
                            <span className="text-sm text-gray-700">{business.email}</span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          {business.phone && (
                            <Button
                              size="sm"
                              onClick={() => handleWhatsApp(business.phone!)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              WhatsApp
                            </Button>
                          )}
                          {business.email && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEmail(business.email!)}
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              E-mail
                            </Button>
                          )}
                        </div>

                        {business.rating && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <span className="text-yellow-500">★</span>
                            <span className="font-medium">{business.rating.toFixed(1)}</span>
                            {business.userRatingsTotal && (
                              <span>({business.userRatingsTotal} avaliações)</span>
                            )}
                          </div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(business.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center bg-white">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? "Nenhum contato encontrado" : "Nenhum contato ainda"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery
                    ? "Tente buscar por outro nome"
                    : "Quando você entrar em contato com negócios, eles aparecerão aqui"}
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push("/")}>
                    Começar a buscar
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}