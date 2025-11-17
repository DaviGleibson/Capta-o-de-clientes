"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, ArrowRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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

            <Button 
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Conecte-se com Negócios Locais
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Encontre e entre em contato com empresas da sua região de forma rápida e eficiente
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => window.open("https://wa.me/5581921613900", "_blank")}
              className="text-lg px-8 py-6"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar com a Orbite
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="p-6 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Busca Inteligente</h3>
            <p className="text-gray-600">
              Encontre negócios por categoria e localização usando a API do Google Maps
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Contato Direto</h3>
            <p className="text-gray-600">
              Entre em contato via WhatsApp ou e-mail com apenas um clique
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão de Contatos</h3>
            <p className="text-gray-600">
              Acompanhe seus contatos e crie listas de e-mails personalizadas
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <h3 className="text-3xl font-bold mb-4">
              Pronto para começar?
            </h3>
            <p className="text-xl mb-8 text-blue-50">
              Entre em contato com a Orbite e descubra como podemos ajudar seu negócio
            </p>
            <Button 
              size="lg"
              variant="secondary"
              onClick={() => window.open("https://wa.me/5581921613900", "_blank")}
              className="text-lg px-8 py-6"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Falar no WhatsApp
            </Button>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Orbite LocalBiz Connect. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
