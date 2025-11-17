"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BusinessCard, { Business } from "@/components/BusinessCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Trash2 } from "lucide-react";

export default function ContatosPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [contactedBusinesses, setContactedBusinesses] = useState<Business[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      router.push("/login");
    } else {
      setUserEmail(email);
      setIsMaster(localStorage.getItem("isMaster") === "true");
      setMounted(true);
    }
  }, [router]);

  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("contactedBusinessesData");
      if (stored) {
        setContactedBusinesses(JSON.parse(stored));
      }
    }
  }, [mounted]);

  const handleClearAll = () => {
    if (confirm("Tem certeza que deseja limpar todos os contatos?")) {
      localStorage.removeItem("contactedBusinessesData");
      localStorage.removeItem("contactedBusinesses");
      setContactedBusinesses([]);
    }
  };

  const handleRemove = (businessId: string) => {
    const updated = contactedBusinesses.filter(b => b.id !== businessId);
    setContactedBusinesses(updated);
    localStorage.setItem("contactedBusinessesData", JSON.stringify(updated));
    
    // Update contacted set
    const contactedSet = new Set(JSON.parse(localStorage.getItem("contactedBusinesses") || "[]"));
    contactedSet.delete(businessId);
    localStorage.setItem("contactedBusinesses", JSON.stringify([...contactedSet]));
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header userEmail={userEmail} isMaster={isMaster} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Meus Contatos
              </h1>
              <p className="text-gray-600">
                Negócios que você já entrou em contato
              </p>
            </div>
            {contactedBusinesses.length > 0 && (
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Todos
              </Button>
            )}
          </div>

          {contactedBusinesses.length > 0 ? (
            <>
              <div className="mb-6">
                <p className="text-lg font-semibold text-gray-900">
                  {contactedBusinesses.length} contato{contactedBusinesses.length !== 1 ? "s" : ""} salvo{contactedBusinesses.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contactedBusinesses.map((business) => (
                  <div key={business.id} className="relative">
                    <BusinessCard
                      business={business}
                      isContacted={true}
                      onContact={() => {}}
                      isEmailSelected={false}
                      onEmailSelect={() => {}}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(business.id)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Card className="p-12 text-center bg-white">
              <div className="max-w-md mx-auto">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Nenhum contato ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  Quando você entrar em contato com negócios, eles aparecerão aqui
                </p>
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Buscar Negócios
                </Button>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}