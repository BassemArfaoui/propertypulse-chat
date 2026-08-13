import { useEffect, useRef, useState } from "react";
import { BedDouble, Bath, Ruler, MapPin, Building2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "./property-card";
import type { Property } from "@/lib/agent-types";
import { formatPrice } from "@/lib/properties";

const PAGE = 6;

export function PropertyGrid({ properties }: { properties: Property[] }) {
  const [visible, setVisible] = useState(PAGE);
  const [active, setActive] = useState<Property | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || visible >= properties.length) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setVisible((v) => Math.min(v + PAGE, properties.length));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible, properties.length]);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Building2 className="size-3.5" />
        {properties.length} listings
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {properties.slice(0, visible).map((property) => (
          <PropertyCard key={property.id} property={property} onOpen={setActive} />
        ))}
      </div>
      <div ref={sentinel} className="h-4" />

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-xl overflow-hidden p-0">
          {active ? (
            <div>
              <img
                src={active.image}
                alt={active.title}
                loading="lazy"
                width={1024}
                height={768}
                className="h-56 w-full object-cover"
              />
              <div className="space-y-4 p-6">
                <DialogHeader className="space-y-1 text-left">
                  <DialogTitle className="font-display text-xl">{active.title}</DialogTitle>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="size-3.5" /> {active.location} · Ref {active.id}
                  </p>
                </DialogHeader>
                <p className="font-display text-2xl text-primary">
                  {formatPrice(active.price, active.currency)}
                </p>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <Detail icon={<BedDouble className="size-4" />} label="Rooms" value={String(active.rooms)} />
                  <Detail icon={<Bath className="size-4" />} label="Baths" value={String(active.baths)} />
                  <Detail icon={<Ruler className="size-4" />} label="Surface" value={`${active.size} m²`} />
                </div>
                <div className="rounded-xl border border-dashed border-border bg-muted/50 p-3 text-xs text-muted-foreground">
                  Map view — {active.lat.toFixed(3)}, {active.lng.toFixed(3)} (interactive map coming next)
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1">Schedule a viewing</Button>
                  <Button variant="outline" className="flex-1">
                    Send to client
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
