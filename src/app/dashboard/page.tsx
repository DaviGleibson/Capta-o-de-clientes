"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Filter, Loader2, AlertCircle, Copy } from "lucide-react";
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
import {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useToast } from "@/components/ui/use-toast";
import { brazilStates, stateCities } from "@/lib/brazil-locations";

declare global {
  interface Window {
    google: any;
  }
}

export default function DashboardPage() {
  const PAGE_SIZE = 9;
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
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
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [visiblePage, setVisiblePage] = useState(1);

  const { toast } = useToast();

  // Check authentication
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      router.push("/login");
    } else {
      setUserEmail(email);
      setMounted(true);
    }
  }, [router]);

  // Load contacted businesses from localStorage
  useEffect(() => {
    if (mounted) {
      const stored = localStorage.getItem("contactedBusinesses");
      if (stored) {
        setContactedBusinesses(new Set(JSON.parse(stored)));
      }
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

  // Apply filters
  useEffect(() => {
    let filtered = [...businesses];

    if (filterPhone) {
      filtered = filtered.filter((b) => b.phone);
    }

    if (filterEmail) {
      filtered = filtered.filter((b) => b.email);
    }

    setFilteredBusinesses(filtered);
  }, [businesses, filterPhone, filterEmail]);

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery.trim()) {
      setError("Por favor, digite uma categoria de negócio.");
      return;
    }

    if (!selectedState || !selectedCity) {
      setError("Por favor, selecione o estado e município.");
      return;
    }

    if (!mapsLoaded || !window.google) {
      setError("Aguardando carregamento do Google Maps...");
      return;
    }

    setLoading(true);
    setError("");
    if (page === 1) {
      setHasSearched(true);
      setAllBusinesses([]);
      setBusinesses([]);
    }

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

        const updatedBusinesses = page === 1 ? detailedBusinesses : [...allBusinesses, ...detailedBusinesses];
        setAllBusinesses(updatedBusinesses);
        setBusinesses(updatedBusinesses);
        setHasMoreResults(places.length === 20);
        setCurrentPage(page);
      } else {
        if (page === 1) {
          setBusinesses([]);
          setAllBusinesses([]);
        }
        setHasMoreResults(false);
      }
      setLoading(false);
    } catch (err) {
      setError("Erro ao buscar negócios. Por favor, tente novamente.");
      console.error(err);
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    handleSearch(currentPage + 1);
  };

  const handleContact = (businessId: string, type: "whatsapp" | "email") => {
    const newContacted = new Set(contactedBusinesses);
    newContacted.add(businessId);
    setContactedBusinesses(newContacted);
    localStorage.setItem("contactedBusinesses", JSON.stringify([...newContacted]));

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(1);
    }
  };

  const availableCities = selectedState ? stateCities[selectedState] || [] : [];
  const totalPages = Math.ceil(filteredBusinesses.length / PAGE_SIZE);
  const paginatedBusinesses = useMemo(() => {
    const startIndex = (visiblePage - 1) * PAGE_SIZE;
    return filteredBusinesses.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredBusinesses, visiblePage]);

  useEffect(() => {
    setVisiblePage(1);
  }, [filteredBusinesses.length]);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header userEmail={userEmail} />

      <main className="container mx-auto px-4 py-8">
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
                    disabled={!selectedState}
                  >
                    <SelectTrigger id="city" className="h-12">
                      <SelectValue placeholder={selectedState ? "Selecione o município" : "Selecione o estado primeiro"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    Apenas com telefone
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
              </div>
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
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {filteredBusinesses.length} negócio{filteredBusinesses.length !== 1 ? "s" : ""} encontrado{filteredBusinesses.length !== 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Clique nos botões para entrar em contato ou marque os emails para criar uma lista
                  </p>
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
                          if (visiblePage > 1) {
                            setVisiblePage((prev) => prev - 1);
                          }
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
                        onClick={(event) => {
                          event.preventDefault();
                          if (visiblePage < totalPages) {
                            setVisiblePage((prev) => prev + 1);
                          }
                        }}
                        className={visiblePage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationContent>
                  </Pagination>
                )}

                {hasMoreResults && !loading && (
                  <div className="mt-8 text-center">
                    <Button
                      onClick={handleLoadMore}
                      variant="outline"
                      size="lg"
                      className="px-8"
                    >
                      Carregar mais resultados
                    </Button>
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

        {loading && currentPage > 1 && (
          <div className="max-w-7xl mx-auto mt-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600" />
            <p className="text-sm text-gray-600 mt-2">Carregando mais resultados...</p>
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
      </main>
    </div>
  );
}
