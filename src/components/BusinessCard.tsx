import { MapPin, Phone, Mail, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface Business {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  rating?: number;
  userRatingsTotal?: number;
}

interface BusinessCardProps {
  business: Business;
  isContacted: boolean;
  onContact: (businessId: string, type: "whatsapp" | "email") => void;
  isEmailSelected?: boolean;
  onEmailSelect?: (businessId: string, email: string) => void;
}

export default function BusinessCard({
  business,
  isContacted,
  onContact,
  isEmailSelected = false,
  onEmailSelect,
}: BusinessCardProps) {
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

  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 bg-white">
      {isContacted && (
        <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1.5 shadow-md">
          <Check className="h-4 w-4" />
        </div>
      )}
      <CardContent className="p-5">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-1 pr-8">
              {business.name}
            </h3>
            {business.rating && (
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  ⭐ {business.rating.toFixed(1)}
                </Badge>
                {business.userRatingsTotal && (
                  <span className="text-gray-500 text-xs">
                    ({business.userRatingsTotal} avaliações)
                  </span>
                )}
              </div>
            )}
          </div>

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