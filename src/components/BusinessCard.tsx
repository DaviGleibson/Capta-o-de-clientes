import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, Check, FileText, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  computeOpportunityScore,
  computeProbabilityOfClosing,
  daysSinceLastContact,
  type VisitStatus,
  type PotentialLevel,
  type PipelineStage,
  type NextActionRecord,
  type NextActionType,
} from "@/lib/prospection-storage";

export interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  rating?: number;
  userRatingsTotal?: number;
  cnpj?: string;
}

interface BusinessCardProps {
  business: Business;
  isContacted: boolean;
  onContact: (businessId: string, type: "whatsapp" | "email") => void;
  isEmailSelected?: boolean;
  onEmailSelect?: (businessId: string, email: string) => void;
  /** Visit status and potential from parent (synced with localStorage) */
  visitStatus?: VisitStatus | null;
  potential?: PotentialLevel | null;
  notes?: string;
  onVisitStatusChange?: (id: string, status: VisitStatus) => void;
  onPotentialChange?: (id: string, level: PotentialLevel | null) => void;
  onNotesChange?: (id: string, notes: string) => void;
  /** Selection for export / create route */
  isSelected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
  /** Pipeline stage (for Minha Prospecção) */
  pipelineStage?: PipelineStage | null;
  onPipelineChange?: (id: string, stage: PipelineStage) => void;
  lastContactDate?: string | null;
  nextAction?: NextActionRecord | null;
  onNextActionChange?: (id: string, action: NextActionType, due: string) => void;
  contractValue?: number | null;
  onContractValueChange?: (id: string, value: number) => void;
}

export default function BusinessCard({
  business,
  isContacted,
  onContact,
  isEmailSelected = false,
  onEmailSelect,
  visitStatus = null,
  potential = null,
  notes = "",
  onVisitStatusChange,
  onPotentialChange,
  onNotesChange,
  isSelected = false,
  onSelectChange,
  pipelineStage = null,
  onPipelineChange,
  lastContactDate = null,
  nextAction = null,
  onNextActionChange,
  contractValue = null,
  onContractValueChange,
}: BusinessCardProps) {
  const { toast } = useToast();
  const [notesOpen, setNotesOpen] = useState(!!notes);
  const [localNotes, setLocalNotes] = useState(notes);
  const [localContractValue, setLocalContractValue] = useState(String(contractValue ?? ""));
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);
  useEffect(() => {
    setLocalContractValue(String(contractValue ?? ""));
  }, [contractValue]);

  const handleWhatsApp = () => {
    if (business.phone) {
      const cleanPhone = business.phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
      onContact(business.id, "whatsapp");
    }
  };

  const handleEmail = () => {
    if (business.email) {
      window.open(`mailto:${business.email}`, "_blank");
      onContact(business.id, "email");
    }
  };

  const handleEmailCheckbox = () => {
    if (business.email && onEmailSelect) {
      onEmailSelect(business.id, business.email);
    }
  };

  const handleVerNoMapa = () => {
    const query = encodeURIComponent(business.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handleCopyCnpj = () => {
    if (business.cnpj) {
      const onlyDigits = business.cnpj.replace(/\D/g, "");
      navigator.clipboard.writeText(onlyDigits);
      toast({ title: "CNPJ copiado!", description: onlyDigits });
    }
  };

  const handleSaveNotes = () => {
    onNotesChange?.(business.id, localNotes);
    if (!localNotes.trim()) setNotesOpen(false);
  };

  const { score, max } = computeOpportunityScore(business, potential);
  const probability = computeProbabilityOfClosing(
    potential,
    pipelineStage ?? null,
    visitStatus ?? null,
    business.rating,
    score
  );
  const daysSince = daysSinceLastContact(lastContactDate ?? null);
  const nextActionOverdue = nextAction?.due
    ? new Date(nextAction.due) < new Date() && new Date(nextAction.due).toISOString().slice(0, 10) !== new Date().toISOString().slice(0, 10)
    : false;

  return (
    <Card className={`relative overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white ${isSelected ? "ring-2 ring-blue-500" : ""}`}>
      {isContacted && (
        <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-md">
          <Check className="h-4 w-4" />
        </div>
      )}
      <CardContent className="p-5">
        <div className="space-y-3">
          {onSelectChange && (
            <div className="absolute top-3 left-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(c) => onSelectChange(business.id, c === true)}
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1 pr-8">
              {business.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {business.rating != null && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  ⭐ {business.rating.toFixed(1)}
                </Badge>
              )}
              {business.userRatingsTotal != null && (
                <span className="text-gray-500 text-xs">
                  ({business.userRatingsTotal} avaliações)
                </span>
              )}
              <Badge variant="outline" className="text-xs">
                🎯 Score: {score}/{max}
              </Badge>
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                📊 Fechar: {probability}%
              </Badge>
            </div>
          </div>

          {daysSince != null && daysSince > 0 && (
            <div className={`text-xs px-2 py-1.5 rounded-md ${daysSince > 12 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"}`}>
              🕒 Último contato: {daysSince} dia{daysSince !== 1 ? "s" : ""} atrás
              {daysSince > 12 && " • ⚠ Recomendado retornar"}
            </div>
          )}

          {onNextActionChange && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">📅 Próxima ação</p>
              <div className="flex flex-wrap gap-2 items-center">
                <Select
                  value={nextAction?.action ?? "none"}
                  onValueChange={(v) => {
                    if (v !== "none")
                      onNextActionChange(business.id, v as NextActionType, nextAction?.due ?? new Date().toISOString().slice(0, 10));
                  }}
                >
                  <SelectTrigger className="h-8 text-xs w-[140px]">
                    <SelectValue placeholder="Ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    <SelectItem value="ligar">Ligar</SelectItem>
                    <SelectItem value="visitar">Visitar</SelectItem>
                    <SelectItem value="enviar_proposta">Enviar proposta</SelectItem>
                    <SelectItem value="aguardar_retorno">Aguardar retorno</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  className="h-8 w-[130px] text-xs"
                  value={nextAction?.due ?? ""}
                  onChange={(e) => {
                    const due = e.target.value;
                    if (due)
                      onNextActionChange(business.id, nextAction?.action ?? "ligar", due);
                  }}
                />
                {nextActionOverdue && (
                  <span className="text-xs text-amber-600 font-medium">Vencida</span>
                )}
              </div>
            </div>
          )}

          {pipelineStage === "cliente_fechado" && onContractValueChange && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">💵 Valor estimado do contrato (R$)</p>
              <Input
                type="number"
                min={0}
                step={100}
                placeholder="0"
                className="h-8 text-sm"
                value={localContractValue}
                onChange={(e) => setLocalContractValue(e.target.value)}
                onBlur={() => {
                  const n = parseInt(localContractValue.replace(/\D/g, ""), 10);
                  if (!isNaN(n) && n >= 0) onContractValueChange(business.id, n);
                }}
              />
            </div>
          )}

          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
            <p className="line-clamp-2">{business.address}</p>
          </div>

          {business.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <p>{business.phone}</p>
            </div>
          )}

          {business.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <p className="truncate flex-1">{business.email}</p>
                {onEmailSelect && (
                  <Checkbox
                    checked={isEmailSelected}
                    onCheckedChange={handleEmailCheckbox}
                    className="flex-shrink-0"
                  />
                )}
              </div>
            </div>
          )}

          {business.cnpj && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-500">CNPJ:</span>
              <p className="font-mono text-xs">{business.cnpj}</p>
              <Button variant="ghost" size="sm" className="h-7 px-2" onClick={handleCopyCnpj}>
                <Copy className="h-3 w-3 mr-1" />
                Copiar CNPJ
              </Button>
            </div>
          )}

          {/* Visit status */}
          {onVisitStatusChange && (
            <div className="space-y-1.5 pt-1 border-t">
              <p className="text-xs font-medium text-gray-600">Status da visita</p>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant={visitStatus === "ja_visitei" ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => onVisitStatusChange(business.id, "ja_visitei")}
                >
                  ☑️ Já visitei
                </Button>
                <Button
                  size="sm"
                  variant={visitStatus === "visitar_depois" ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => onVisitStatusChange(business.id, "visitar_depois")}
                >
                  ⏳ Visitar depois
                </Button>
                <Button
                  size="sm"
                  variant={visitStatus === "sem_interesse" ? "default" : "outline"}
                  className="text-xs h-8"
                  onClick={() => onVisitStatusChange(business.id, "sem_interesse")}
                >
                  ❌ Não tenho interesse
                </Button>
              </div>
            </div>
          )}

          {/* Potential */}
          {onPotentialChange && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Potencial</p>
              <Select
                value={potential ?? "none"}
                onValueChange={(v) => onPotentialChange(business.id, v === "none" ? null : (v as PotentialLevel))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Marcar potencial" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—</SelectItem>
                  <SelectItem value="alto">🔥 Potencial Alto</SelectItem>
                  <SelectItem value="medio">🟡 Potencial Médio</SelectItem>
                  <SelectItem value="baixo">🔴 Baixo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Pipeline stage (Minha Prospecção) */}
          {onPipelineChange && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-600">Pipeline</p>
              <Select
                value={pipelineStage ?? "novos"}
                onValueChange={(v) => onPipelineChange(business.id, v as PipelineStage)}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novos">Novos</SelectItem>
                  <SelectItem value="visitados">Visitados</SelectItem>
                  <SelectItem value="em_negociacao">Em negociação</SelectItem>
                  <SelectItem value="cliente_fechado">Cliente fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Notes */}
          {onNotesChange && (
            <div className="space-y-1.5">
              {!notesOpen ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-gray-600"
                  onClick={() => setNotesOpen(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  📝 Adicionar observação
                </Button>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Observação</p>
                  <Textarea
                    placeholder="Ex: Falar com gerente João, Retornar dia 20..."
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleSaveNotes}
                    className="min-h-[60px] text-sm"
                  />
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setNotesOpen(false)}>
                      Fechar
                    </Button>
                    <Button size="sm" onClick={handleSaveNotes}>
                      Salvar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={handleVerNoMapa}
              variant="outline"
              className="w-full gap-2"
              size="sm"
            >
              <MapPin className="h-4 w-4" />
              Ver no mapa
            </Button>
            <div className="flex gap-2">
              <Button
                onClick={handleWhatsApp}
                disabled={!business.phone}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                size="sm"
              >
                <Phone className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                onClick={handleEmail}
                disabled={!business.email}
                variant="outline"
                className="flex-1 gap-2"
                size="sm"
              >
                <Mail className="h-4 w-4" />
                E-mail
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}