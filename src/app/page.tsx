"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  ArrowRight,
  MapPin,
  FileText,
  Route,
  Target,
  Filter,
  BarChart3,
  FolderOpen,
  ClipboardList,
  Upload,
  TrendingUp,
  DollarSign,
  Award,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      bg: "bg-blue-100",
      title: "Busca Inteligente",
      description: "Encontre negócios por estado, município e categoria com o Google Maps. Ver no mapa com um clique. Analise a cidade e veja concentração por região.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-green-600" />,
      bg: "bg-green-100",
      title: "Contato Direto",
      description: "WhatsApp e e-mail em um clique. Filtro “apenas com WhatsApp”. Último contato registrado e alerta “Recomendado retornar”.",
    },
    {
      icon: <ClipboardList className="h-8 w-8 text-purple-600" />,
      bg: "bg-purple-100",
      title: "Pipeline Completo",
      description: "Novos, Visitados, Em negociação, Cliente fechado. Próxima ação (Ligar, Visitar, Enviar proposta) com data. Valor estimado do contrato nos fechados.",
    },
    {
      icon: <Target className="h-8 w-8 text-amber-600" />,
      bg: "bg-amber-100",
      title: "Inteligência Comercial",
      description: "Probabilidade de fechar % por empresa. Score de oportunidade. Potencial Alto/Médio/Baixo. TOP 5 oportunidades com um clique.",
    },
    {
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      bg: "bg-indigo-100",
      title: "Observações e Urgência",
      description: "Anote observações por empresa. Indicador “Último contato: X dias atrás”. Filtro “Oportunidade esquecida” (negociação >15 dias).",
    },
    {
      icon: <Route className="h-8 w-8 text-red-600" />,
      bg: "bg-red-100",
      title: "Rota Inteligente",
      description: "Selecione empresas e crie rota no Google Maps. Modo “Rota inteligente”: ordenada por endereço para otimizar o trajeto.",
    },
    {
      icon: <Upload className="h-8 w-8 text-emerald-600" />,
      bg: "bg-emerald-100",
      title: "Exportar e Relatório",
      description: "Exporte selecionados em CSV. Botão “Gerar relatório da região” para copiar resumo (cidade, totais, alto potencial, fechados) para apresentação.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-cyan-600" />,
      bg: "bg-cyan-100",
      title: "Resumo e Conversão",
      description: "Painel no topo: total, alto potencial, visitados, em negociação, fechados, conversão %. Indicador de saturação e potencial de mercado.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-violet-600" />,
      bg: "bg-violet-100",
      title: "Dashboard Executivo",
      description: "Aba dedicada: total prospectado, clientes fechados, conversão, receita estimada pipeline, meta mensal, cidades mais trabalhadas.",
    },
    {
      icon: <Award className="h-8 w-8 text-orange-600" />,
      bg: "bg-orange-100",
      title: "Meta e Gamificação",
      description: "Meta do dia e visitados hoje. Meta mensal. Níveis: Ouro (10 fechados), Prata (5), Bronze (1). Ranking “X esta semana”.",
    },
    {
      icon: <FolderOpen className="h-8 w-8 text-slate-600" />,
      bg: "bg-slate-100",
      title: "Minha Prospecção",
      description: "Aba com pipeline visual: Novos, Visitados, Em negociação, Cliente fechado. Tudo organizado e salvo para você.",
    },
    {
      icon: <DollarSign className="h-8 w-8 text-green-700" />,
      bg: "bg-green-100",
      title: "Receita no Pipeline",
      description: "Campo “Valor estimado do contrato” nos clientes fechados. Receita estimada pipeline no Dashboard. Visão de gestão.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                <p className="text-xs text-gray-600">Prospecção inteligente para vendedores externos</p>
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

      {/* Hero */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <p className="text-blue-600 font-semibold mb-2">Ferramenta comercial de prospecção regional</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Mini CRM de Prospecção com Inteligência
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Busca por região, pipeline (Novos → Visitados → Em negociação → Fechado), probabilidade de fechar,
            próxima ação, receita estimada, conversão e dashboard executivo. Nível ferramenta comercial de verdade.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
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

        {/* Features grid */}
        <div className="max-w-6xl mx-auto mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
            Tudo que uma ferramenta comercial precisa
          </h3>
          <p className="text-gray-600 text-center mb-10">
            Pipeline, inteligência (probabilidade, urgência, TOP 5), rota inteligente, receita pipeline, conversão e gamificação.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
                <div className={`${f.bg} rounded-full w-14 h-14 flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h4>
                <p className="text-gray-600 text-sm">{f.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Onde ficam meus dados? */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="p-8 border-2 border-amber-200 bg-amber-50/50">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Filter className="h-5 w-5 text-amber-600" />
              Onde ficam salvos meus dados?
            </h3>
            <p className="text-gray-700 mb-4">
              Hoje, <strong>todos os dados da prospecção</strong> (pipeline, próxima ação, valor do contrato,
              último contato, observações, metas) são salvos no <strong>navegador</strong> (localStorage).
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Trocar de navegador ou aparelho = prospecção não acompanha.</li>
              <li>Limpar dados do site = prospecção é perdida.</li>
              <li>Login (e-mail/senha) é por perfil no servidor; o conteúdo da prospecção ainda é local.</li>
            </ul>
            <p className="text-gray-700">
              Para salvar por perfil em qualquer dispositivo, seria preciso persistir no servidor — podemos evoluir para isso.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
            <p className="text-xl mb-8 text-blue-50">
              Faça login e use o mini CRM de prospecção com inteligência. Dúvidas? Fale com a Orbite no WhatsApp.
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
            © {new Date().getFullYear()} Orbite LocalBiz Connect. Prospecção inteligente para vendedores externos.
          </p>
        </div>
      </footer>
    </div>
  );
}
