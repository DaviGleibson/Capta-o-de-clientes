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
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const features = [
    {
      icon: <MapPin className="h-8 w-8 text-blue-600" />,
      bg: "bg-blue-100",
      title: "Busca Inteligente",
      description: "Encontre negócios por estado, município e categoria com a API do Google Maps. Ver no mapa com um clique.",
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-green-600" />,
      bg: "bg-green-100",
      title: "Contato Direto",
      description: "WhatsApp e e-mail em um clique. Filtro “apenas com WhatsApp” para focar em quem responde rápido.",
    },
    {
      icon: <ClipboardList className="h-8 w-8 text-purple-600" />,
      bg: "bg-purple-100",
      title: "Pipeline na Palma da Mão",
      description: "Marque: Já visitei, Visitar depois ou Não tenho interesse. Tudo salvo e organizado por você.",
    },
    {
      icon: <Target className="h-8 w-8 text-amber-600" />,
      bg: "bg-amber-100",
      title: "Potencial por Empresa",
      description: "Tag Potencial Alto, Médio ou Baixo. Filtro “mostrar apenas alto potencial” para priorizar leads.",
    },
    {
      icon: <FileText className="h-8 w-8 text-indigo-600" />,
      bg: "bg-indigo-100",
      title: "Observações por Empresa",
      description: "Anote “Falar com gerente João”, “Retornar dia 20” e outras observações. Nunca perca o contexto.",
    },
    {
      icon: <Route className="h-8 w-8 text-red-600" />,
      bg: "bg-red-100",
      title: "Rota de Visitação",
      description: "Selecione várias empresas e crie a rota no Google Maps com múltiplos destinos. Ideal para vendedor externo.",
    },
    {
      icon: <Upload className="h-8 w-8 text-emerald-600" />,
      bg: "bg-emerald-100",
      title: "Exportar Lista",
      description: "Exporte empresas selecionadas em CSV. Monte listas para e-mail ou planejamento fora do sistema.",
    },
    {
      icon: <Target className="h-8 w-8 text-cyan-600" />,
      bg: "bg-cyan-100",
      title: "Score de Oportunidade",
      description: "Cada empresa ganha um score automático (WhatsApp, e-mail, avaliação, potencial). Foque nas melhores oportunidades.",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-violet-600" />,
      bg: "bg-violet-100",
      title: "Meta do Dia",
      description: "Defina sua meta de visitas e acompanhe “Visitados hoje”. Gamificação simples para manter o ritmo.",
    },
    {
      icon: <FolderOpen className="h-8 w-8 text-orange-600" />,
      bg: "bg-orange-100",
      title: "Minha Prospecção",
      description: "Aba dedicada: Novos, Visitados, Em negociação, Cliente fechado. Controle tipo CRM, sem complicação.",
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
          <p className="text-blue-600 font-semibold mb-2">Ferramenta de Prospecção Comercial Local</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Conecte-se com Negócios Locais e Organize Suas Visitas
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Busque por categoria e região, marque status de visita, potencial e observações.
            Crie rotas, exporte listas e acompanhe sua meta do dia — tudo em um só lugar.
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
            Tudo o que você precisa para prospectar
          </h3>
          <p className="text-gray-600 text-center mb-10">
            Busca, pipeline, observações, rota e exportação — pensado para vendedor externo.
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
              Hoje, <strong>todos os dados da prospecção</strong> (status de visita, potencial, observações,
              pipeline, meta do dia e lista de empresas) são salvos no <strong>navegador do seu computador ou celular</strong> (localStorage).
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
              <li>Não são enviados ao servidor por enquanto.</li>
              <li>Se você trocar de navegador ou de aparelho, essa prospecção não aparece lá.</li>
              <li>Se limpar os dados do site no navegador, a prospecção é perdida.</li>
            </ul>
            <p className="text-gray-700">
              Ou seja: <strong>não está vinculado ao seu perfil de usuário ainda</strong>. O login (e-mail/senha) é por perfil no servidor,
              mas o conteúdo da prospecção é só local. Se no futuro quisermos que tudo fique salvo por perfil (em qualquer dispositivo),
              será preciso guardar esses dados no servidor — podemos evoluir para isso.
            </p>
          </Card>
        </div>

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <Card className="p-12 text-center bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <h3 className="text-3xl font-bold mb-4">Pronto para começar?</h3>
            <p className="text-xl mb-8 text-blue-50">
              Faça login e use a prospecção inteligente. Dúvidas? Fale com a Orbite no WhatsApp.
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
