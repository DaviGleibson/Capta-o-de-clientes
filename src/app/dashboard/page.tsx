"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Search, MapPin, Filter, Loader2, AlertCircle, Copy, Upload, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BusinessCard, { Business } from "@/components/BusinessCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { brazilStates, stateCities } from "@/lib/brazil-locations";
import {
  prospectionStorage,
  type VisitStatusMap,
  type VisitRecord,
  type PotentialMap,
  type PotentialLevel,
  type NotesMap,
  type PipelineMap,
  type PipelineStage,
} from "@/lib/prospection-storage";

declare global {
  interface Window {
    google: any;
  }
}

export default function DashboardPage() {
  const PAGE_SIZE = 9;
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [isMaster, setIsMaster] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contactedBusinesses, setContactedBusinesses] = useState<Set<string>>(new Set());
  const [filterPhone, setFilterPhone] = useState(false);
  const [filterEmail, setFilterEmail] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [visiblePage, setVisiblePage] = useState(1);
  const [googlePage, setGooglePage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState("");
  const cityCache = useRef<Record<string, string[]>>({});

  // Prospection / CRM state (persisted in localStorage)
  const [visitStatusMap, setVisitStatusMap] = useState<VisitStatusMap>({});
  const [potentialMap, setPotentialMap] = useState<PotentialMap>({});
  const [notesMap, setNotesMap] = useState<NotesMap>({});
  const [pipelineMap, setPipelineMap] = useState<PipelineMap>({});
  const [dailyGoal, setDailyGoal] = useState(20);
  const [selectedBusinessIds, setSelectedBusinessIds] = useState<Set<string>>(new Set());
  const [filterPotentialAlto, setFilterPotentialAlto] = useState(false);
  const [activeTab, setActiveTab] = useState<"busca" | "prospeccao">("busca");

  const { toast } = useToast();
  const visitadosHoje = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return Object.values(visitStatusMap).filter(
      (r) => r.status === "ja_visitei" && r.date === today
    ).length;
  }, [visitStatusMap]);

  // Check authentication
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

  // Load contacted businesses from localStorage
  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("contactedBusinesses");
      if (stored) {
        const contactedArray: string[] = JSON.parse(stored);
        setContactedBusinesses(new Set<string>(contactedArray));
      }
    }
  }, [mounted]);

  // Load prospection state from localStorage
  useEffect(() => {
    if (mounted) {
      setVisitStatusMap(prospectionStorage.getVisitStatus());
      setPotentialMap(prospectionStorage.getPotential());
      setNotesMap(prospectionStorage.getNotes());
      setPipelineMap(prospectionStorage.getPipeline());
      setDailyGoal(prospectionStorage.getDailyGoal());
    }
  }, [mounted]);

  // Load Google Maps script
  useEffect(() => {
    if (mounted && !window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapsLoaded(true);
      document.head.appendChild(script);
    } else if (window.google) {
      setMapsLoaded(true);
    }
  }, [mounted]);

  // Load municipalities dynamically using IBGE API (fallback to local list)
  useEffect(() => {
    if (!selectedState) {
      setAvailableCities([]);
      setCitiesError("");
      return;
    }

    if (cityCache.current[selectedState]) {
      setAvailableCities(cityCache.current[selectedState]);
      setCitiesError("");
      return;
    }

    const fetchCities = async () => {
      setCitiesLoading(true);
      setCitiesError("");
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`,
        );
        if (!response.ok) {
          throw new Error("Erro ao buscar municípios");
        }
        const data = await response.json();
        const cityNames = data
          .map((item: { nome: string }) => item.nome)
          .sort((a: string, b: string) => a.localeCompare(b));
        cityCache.current[selectedState] = cityNames;
        setAvailableCities(cityNames);
      } catch (err) {
        console.error("Erro ao carregar municípios:", err);
        const fallbackCities = stateCities[selectedState] || [];
        setAvailableCities(fallbackCities);
        setCitiesError("Não foi possível carregar todos os municípios. Exibindo lista reduzida.");
      } finally {
        setCitiesLoading(false);
      }
    };

    fetchCities();
  }, [selectedState]);

  // Apply filters
  useEffect(() => {
    let filtered = [...businesses];

    if (filterPhone) {
      filtered = filtered.filter((b) => b.phone);
    }

    if (filterEmail) {
      filtered = filtered.filter((b) => b.email);
    }

    if (filterPotentialAlto) {
      filtered = filtered.filter((b) => potentialMap[b.id] === "alto");
    }

    setFilteredBusinesses(filtered);
  }, [businesses, filterPhone, filterEmail, filterPotentialAlto, potentialMap]);

  useEffect(() => {
    setVisiblePage(1);
  }, [filterPhone, filterEmail, filterPotentialAlto]);

  useEffect(() => {
    if (selectedCity && !availableCities.includes(selectedCity)) {
      setSelectedCity("");
    }
  }, [availableCities, selectedCity]);

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      setError("Por favor, digite uma categoria de negócio.");
      return false;
    }

    if (!selectedState || !selectedCity) {
      setError("Por favor, selecione o estado e município.");
      return false;
    }

    if (!mapsLoaded || !window.google) {
      setError("Aguardando carregamento do Google Maps...");
      return false;
    }

    if (page === 1) {
      setLoading(true);
      setHasSearched(true);
      setAllBusinesses([]);
      setBusinesses([]);
      setVisiblePage(1);
      setGooglePage(1);
    } else {
      setIsFetchingMore(true);
    }
    setError("");

    try {
      const { Place } = await window.google.maps.importLibrary("places");
      const geocoder = new window.google.maps.Geocoder();

      const geocodeResult = await geocoder.geocode({
        address: `${selectedCity}, ${selectedState}, Brasil`,
      });

      if (!geocodeResult.results || geocodeResult.results.length === 0) {
        setError("Não foi possível localizar o município selecionado.");
        setLoading(false);
        return;
      }

      const cityLocation = geocodeResult.results[0].geometry.location;
      const cityBounds = geocodeResult.results[0].geometry.bounds;

      const request = {
        textQuery: `${searchQuery} em ${selectedCity}, ${selectedState}, Brasil`,
        fields: ["displayName", "formattedAddress", "internationalPhoneNumber", "nationalPhoneNumber", "rating", "userRatingCount", "websiteURI", "id", "location"],
        locationBias: cityBounds || {
          center: { lat: cityLocation.lat(), lng: cityLocation.lng() },
          radius: 50000,
        },
        maxResultCount: 20,
      };

      const { places } = await Place.searchByText(request);

      if (places && places.length > 0) {
        const detailedBusinesses: Business[] = places.map((place: any) => {
          let email = undefined;
          if (place.websiteURI) {
            try {
              const domain = new URL(place.websiteURI).hostname.replace("www.", "");
              email = `contato@${domain}`;
            } catch (e) {
              // Invalid URL
            }
          }

          return {
            id: place.id,
            name: place.displayName,
            address: place.formattedAddress,
            phone: place.internationalPhoneNumber || place.nationalPhoneNumber,
            email: email,
            rating: place.rating,
            userRatingsTotal: place.userRatingCount,
          };
        });

        setAllBusinesses((prev) => {
          const updatedBusinesses = page === 1 ? detailedBusinesses : [...prev, ...detailedBusinesses];
          setBusinesses(updatedBusinesses);
          return updatedBusinesses;
        });
        setHasMoreResults(places.length === 20);
        setGooglePage(page);
      } else {
        if (page === 1) {
          setBusinesses([]);
          setAllBusinesses([]);
        }
        setHasMoreResults(false);
      }
      return true;
    } catch (err) {
      setError("Erro ao buscar negócios. Por favor, tente novamente.");
      console.error(err);
      return false;
    } finally {
      if (page === 1) {
        setLoading(false);
      } else {
        setIsFetchingMore(false);
      }
    }
  };

  const handleContact = (businessId: string, type: "whatsapp" | "email") => {
    const newContacted = new Set(contactedBusinesses);
    newContacted.add(businessId);
    setContactedBusinesses(newContacted);
    localStorage.setItem("contactedBusinesses", JSON.stringify(Array.from(newContacted)));

    const business = businesses.find((b) => b.id === businessId);
    if (business) {
      const stored = localStorage.getItem("contactedBusinessesData");
      const contactedData: Business[] = stored ? JSON.parse(stored) : [];
      
      if (!contactedData.find((b) => b.id === businessId)) {
        contactedData.push(business);
        localStorage.setItem("contactedBusinessesData", JSON.stringify(contactedData));
      }
    }
  };

  const handleEmailSelect = (businessId: string, email: string) => {
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

  const getBusinessById = (id: string): Business | undefined =>
    filteredBusinesses.find((b) => b.id === id) || allBusinesses.find((b) => b.id === id);

  const ensureInProspeccao = (id: string) => {
    const b = getBusinessById(id);
    if (b) prospectionStorage.addProspectionBusiness(b);
  };

  const handleVisitStatusChange = (id: string, status: "ja_visitei" | "visitar_depois" | "sem_interesse") => {
    const record: VisitRecord = {
      status,
      date: status === "ja_visitei" ? new Date().toISOString().slice(0, 10) : undefined,
    };
    prospectionStorage.setVisitStatus(id, record);
    setVisitStatusMap((prev) => ({ ...prev, [id]: record }));
    if (status === "ja_visitei") {
      setPipelineMap((prev) => ({ ...prev, [id]: "visitados" }));
      prospectionStorage.setPipeline(id, "visitados");
    }
    ensureInProspeccao(id);
  };

  const handlePotentialChange = (id: string, level: PotentialLevel | null) => {
    if (level === null) {
      prospectionStorage.clearPotential(id);
      setPotentialMap((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      prospectionStorage.setPotential(id, level);
      setPotentialMap((prev) => ({ ...prev, [id]: level }));
    }
    ensureInProspeccao(id);
  };

  const handleNotesChange = (id: string, text: string) => {
    prospectionStorage.setNotes(id, text);
    setNotesMap((prev) => ({ ...prev, [id]: text }));
    ensureInProspeccao(id);
  };

  const handleSelectChange = (id: string, selected: boolean) => {
    setSelectedBusinessIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleExportCSV = () => {
    const selected = filteredBusinesses.filter((b) => selectedBusinessIds.has(b.id));
    if (selected.length === 0) {
      toast({ title: "Nenhuma empresa selecionada", description: "Marque os cards para exportar.", variant: "destructive" });
      return;
    }
    const headers = ["Nome", "Endereço", "Telefone", "E-mail", "Potencial", "Status", "Observação"];
    const rows = selected.map((b) => [
      b.name,
      b.address,
      b.phone ?? "",
      b.email ?? "",
      potentialMap[b.id] ?? "",
      visitStatusMap[b.id]?.status ?? "",
      notesMap[b.id] ?? "",
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `empresas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exportado!", description: `${selected.length} empresa(s) em CSV` });
  };

  const handleCreateRoute = () => {
    const selected = filteredBusinesses.filter((b) => selectedBusinessIds.has(b.id));
    if (selected.length === 0) {
      toast({ title: "Nenhuma empresa selecionada", description: "Marque os cards para criar a rota.", variant: "destructive" });
      return;
    }
    const addresses = selected.map((b) => encodeURIComponent(b.address));
    const url = `https://www.google.com/maps/dir/${addresses.join("/")}`;
    window.open(url, "_blank");
    toast({ title: "Rota aberta", description: `${selected.length} destino(s) no Google Maps` });
  };

  const handlePipelineChange = (id: string, stage: PipelineStage) => {
    prospectionStorage.setPipeline(id, stage);
    setPipelineMap((prev) => ({ ...prev, [id]: stage }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  const totalPages = Math.ceil(filteredBusinesses.length / PAGE_SIZE);
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (visiblePage - 1) * PAGE_SIZE;
    return filteredBusinesses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBusinesses, visiblePage]);

  const handlePreviousPage = () => {
    if (visiblePage > 1) {
      setVisiblePage((prev) => prev - 1);
    }
  };

  const handleNextPage = async () => {
    if (visiblePage < totalPages) {
      setVisiblePage((prev) => prev + 1);
      return;
    }

    if (hasMoreResults && !isFetchingMore && !loading) {
      const success = await handleSearch(googlePage + 1);
      if (success) {
        setVisiblePage((prev) => prev + 1);
      }
    }
  };

  if (!mounted) {
    return null;
  }

  const prospeccaoBusinesses = useMemo(
    () => prospectionStorage.getProspectionBusinesses(),
    [visitStatusMap, potentialMap, pipelineMap]
  );
  const prospeccaoByStage = useMemo(() => {
    const m: Record<PipelineStage, Business[]> = {
      novos: [],
      visitados: [],
      em_negociacao: [],
      cliente_fechado: [],
    };
    prospeccaoBusinesses.forEach((b) => {
      const stage = pipelineMap[b.id] ?? "novos";
      m[stage].push(b as Business);
    });
    return m;
  }, [prospeccaoBusinesses, pipelineMap]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header userEmail={userEmail} isMaster={isMaster} />

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "busca" | "prospeccao")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="busca">🔍 Busca</TabsTrigger>
            <TabsTrigger value="prospeccao">📂 Minha Prospecção</TabsTrigger>
          </TabsList>

          <TabsContent value="busca" className="mt-0">
        {/* Search Section */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card className="p-6 shadow-lg bg-white">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Encontre Negócios Locais
                </h2>
                <p className="text-gray-600">
                  Selecione o estado e município, depois busque por categoria
                </p>
              </div>

              {/* Location Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Select value={selectedState} onValueChange={(value) => {
                    setSelectedState(value);
                    setSelectedCity("");
                  }}>
                    <SelectTrigger id="state" className="h-12">
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {brazilStates.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Município</Label>
                  <Select 
                    value={selectedCity} 
                    onValueChange={setSelectedCity}
                    disabled={!selectedState || availableCities.length === 0}
                  >
                    <SelectTrigger id="city" className="h-12">
                      <SelectValue
                        placeholder={
                          !selectedState
                            ? "Selecione o estado primeiro"
                            : citiesLoading
                              ? "Carregando municípios..."
                              : availableCities.length === 0
                                ? "Nenhum município disponível"
                                : "Selecione o município"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {citiesError && (
                    <p className="text-xs text-red-600">{citiesError}</p>
                  )}
                </div>
              </div>

              {selectedState && selectedCity && (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
                  <MapPin className="h-4 w-4" />
                  <span>Buscando em: {selectedCity} - {selectedState}</span>
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Ex: supermercado, farmácia, restaurante..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                <Button
                  onClick={() => handleSearch(1)}
                  disabled={loading || !selectedState || !selectedCity || !mapsLoaded}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-6 pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filtros:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="phone"
                    checked={filterPhone}
                    onCheckedChange={(checked) => setFilterPhone(checked as boolean)}
                  />
                  <Label htmlFor="phone" className="text-sm cursor-pointer">
                    ✔ Apenas com WhatsApp
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email"
                    checked={filterEmail}
                    onCheckedChange={(checked) => setFilterEmail(checked as boolean)}
                  />
                  <Label htmlFor="email" className="text-sm cursor-pointer">
                    Apenas com e-mail
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="potential"
                    checked={filterPotentialAlto}
                    onCheckedChange={(checked) => setFilterPotentialAlto(checked as boolean)}
                  />
                  <Label htmlFor="potential" className="text-sm cursor-pointer">
                    Mostrar apenas alto potencial
                  </Label>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Daily progress */}
        <div className="max-w-4xl mx-auto mb-6">
          <Card className="p-4 bg-white">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">📊 Meta do dia:</span>
              <Input
                type="number"
                min={0}
                value={dailyGoal}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 0) {
                    setDailyGoal(v);
                    prospectionStorage.setDailyGoal(v);
                  }
                }}
                className="w-20 h-9"
              />
              <span className="text-sm text-gray-600">
                Visitados hoje: <strong>{visitadosHoje}</strong>
              </span>
            </div>
          </Card>
        </div>

        {/* Email List Panel */}
        {selectedEmails.size > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card className="p-6 shadow-lg bg-white border-blue-200">
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
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Results Section */}
        {hasSearched && !loading && (
          <div className="max-w-7xl mx-auto">
            {filteredBusinesses.length > 0 ? (
              <>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {filteredBusinesses.length} negócio{filteredBusinesses.length !== 1 ? "s" : ""} encontrado{filteredBusinesses.length !== 1 ? "s" : ""}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Clique nos botões para entrar em contato ou marque os emails para criar uma lista
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportCSV}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Exportar selecionados (CSV)
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCreateRoute}
                      className="gap-2"
                    >
                      <Route className="h-4 w-4" />
                      Criar rota
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedBusinesses.map((business) => (
                    <BusinessCard
                      key={business.id}
                      business={business}
                      isContacted={contactedBusinesses.has(business.id)}
                      onContact={handleContact}
                      isEmailSelected={business.email ? selectedEmails.has(business.email) : false}
                      onEmailSelect={handleEmailSelect}
                      visitStatus={visitStatusMap[business.id]?.status ?? null}
                      potential={potentialMap[business.id] ?? null}
                      notes={notesMap[business.id] ?? ""}
                      onVisitStatusChange={handleVisitStatusChange}
                      onPotentialChange={handlePotentialChange}
                      onNotesChange={handleNotesChange}
                      isSelected={selectedBusinessIds.has(business.id)}
                      onSelectChange={handleSelectChange}
                      pipelineStage={pipelineMap[business.id] ?? null}
                      onPipelineChange={handlePipelineChange}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      <PaginationPrevious
                        href="#"
                        onClick={(event) => {
                          event.preventDefault();
                          handlePreviousPage();
                        }}
                        className={visiblePage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                        <PaginationLink
                          key={page}
                          href="#"
                          isActive={page === visiblePage}
                          onClick={(event) => {
                            event.preventDefault();
                            setVisiblePage(page);
                          }}
                        >
                          {page}
                        </PaginationLink>
                      ))}
                      <PaginationNext
                        href="#"
                        onClick={async (event) => {
                          event.preventDefault();
                          await handleNextPage();
                        }}
                        className={
                          visiblePage === totalPages && !hasMoreResults
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationContent>
                  </Pagination>
                )}

                {isFetchingMore && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando mais resultados...
                  </div>
                )}

              </>
            ) : (
              <Card className="p-12 text-center bg-white">
                <div className="max-w-md mx-auto">
                  <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum negócio encontrado
                  </h3>
                  <p className="text-gray-600">
                    Tente buscar por outra categoria ou ajuste os filtros
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {!hasSearched && !loading && (
          <div className="max-w-2xl mx-auto">
            <Card className="p-12 text-center bg-white">
              <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Comece sua busca
              </h3>
              <p className="text-gray-600 mb-6">
                Selecione o estado e município, depois digite uma categoria de negócio para encontrar empresas locais
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["Supermercado", "Farmácia", "Restaurante", "Padaria", "Pet Shop"].map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(cat)}
                    className="text-sm"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </Card>
          </div>
        )}
          </TabsContent>

          <TabsContent value="prospeccao" className="mt-0">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Minha Prospecção</h2>
              <p className="text-sm text-gray-600 mb-6">
                Empresas organizadas por estágio do pipeline. Altere o estágio no card.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {(["novos", "visitados", "em_negociacao", "cliente_fechado"] as const).map((stage) => (
                  <div key={stage} className="space-y-3">
                    <h3 className="font-medium text-gray-800 capitalize flex items-center gap-2">
                      {stage === "novos" && "🆕 Novos"}
                      {stage === "visitados" && "✅ Visitados"}
                      {stage === "em_negociacao" && "📋 Em negociação"}
                      {stage === "cliente_fechado" && "🎉 Cliente fechado"}
                      <span className="text-xs text-gray-500">({prospeccaoByStage[stage].length})</span>
                    </h3>
                    <div className="space-y-4">
                      {prospeccaoByStage[stage].map((business) => (
                        <BusinessCard
                          key={business.id}
                          business={business}
                          isContacted={contactedBusinesses.has(business.id)}
                          onContact={handleContact}
                          isEmailSelected={business.email ? selectedEmails.has(business.email) : false}
                          onEmailSelect={handleEmailSelect}
                          visitStatus={visitStatusMap[business.id]?.status ?? null}
                          potential={potentialMap[business.id] ?? null}
                          notes={notesMap[business.id] ?? ""}
                          onVisitStatusChange={handleVisitStatusChange}
                          onPotentialChange={handlePotentialChange}
                          onNotesChange={handleNotesChange}
                          pipelineStage={pipelineMap[business.id] ?? "novos"}
                          onPipelineChange={handlePipelineChange}
                          isSelected={selectedBusinessIds.has(business.id)}
                          onSelectChange={handleSelectChange}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {prospeccaoBusinesses.length === 0 && (
                <Card className="p-8 text-center text-gray-500">
                  Nenhuma empresa na prospecção ainda. Faça uma busca e marque status/potencial nas empresas para vê-las aqui.
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
