import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import type { Property } from "@/lib/agent-types";
import { formatPrice } from "@/lib/properties";
import { cn } from "@/lib/utils";

const statusLabel: Record<Property["status"], string> = {
  available: "Available",
  reserved: "Reserved",
  new: "New listing",
};

export function PropertyCard({
  property,
  onOpen,
}: {
  property: Property;
  onOpen: (property: Property) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(property)}
      className="group animate-rise-in overflow-hidden rounded-2xl border border-border bg-card text-left shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lifted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          loading="lazy"
          width={1024}
          height={768}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur",
            property.status === "reserved"
              ? "bg-muted/85 text-muted-foreground"
              : "bg-primary/90 text-primary-foreground",
          )}
        >
          {statusLabel[property.status]}
        </span>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-display text-lg leading-tight">{formatPrice(property.price, property.currency)}</p>
          <span className="text-xs text-muted-foreground">{property.id}</span>
        </div>
        <p className="line-clamp-1 text-sm font-medium">{property.title}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" /> {property.location}
        </p>
        <div className="flex items-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BedDouble className="size-3.5" /> {property.rooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath className="size-3.5" /> {property.baths}
          </span>
          <span className="flex items-center gap-1.5">
            <Ruler className="size-3.5" /> {property.size} m²
          </span>
        </div>
      </div>
    </button>
  );
}
