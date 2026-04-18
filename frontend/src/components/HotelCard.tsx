import { Link } from "react-router-dom";
import { Star, MapPin, Wifi, Coffee, Car, Dumbbell } from "lucide-react";
import type { HotelSummary } from "@/types";
import { formatInr, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  "free wifi": Wifi,
  breakfast: Coffee,
  parking: Car,
  gym: Dumbbell,
};

function placeholderImage(id: string) {
  // Use a deterministic placeholder when scraper image is missing
  const hash = Math.abs([...id].reduce((a, c) => (a << 5) - a + c.charCodeAt(0), 0));
  return `https://picsum.photos/seed/${hash}/800/500`;
}

export function HotelCard({
  hotel,
  query,
}: {
  hotel: HotelSummary;
  query?: string;
}) {
  const image =
    hotel.thumbnailUrl ||
    (hotel.imageUrls && hotel.imageUrls[0]) ||
    placeholderImage(hotel.id);

  const hasDiscount =
    hotel.discountPct != null &&
    hotel.discountPct > 0 &&
    hotel.originalPriceInr != null;

  return (
    <Link
      to={`/hotels/${hotel.id}${query ? `?${query}` : ""}`}
      className="group block"
    >
      <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-slate-300">
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={image}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = placeholderImage(hotel.id);
            }}
          />
          {hasDiscount && (
            <Badge variant="accent" className="absolute left-3 top-3 shadow">
              {hotel.discountPct}% OFF
            </Badge>
          )}
          {hotel.distanceKm != null && (
            <Badge variant="outline" className="absolute right-3 top-3 shadow">
              {hotel.distanceKm.toFixed(1)} km
            </Badge>
          )}
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 text-base font-semibold leading-snug text-slate-900">
              {hotel.name}
            </h3>
            {hotel.starRating != null && (
              <span className="flex items-center gap-0.5 text-sm font-medium text-amber-500">
                {Array.from({ length: Math.round(hotel.starRating) }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </span>
            )}
          </div>
          {(hotel.locality || hotel.city) && (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3 w-3" />
              {[hotel.locality, hotel.city].filter(Boolean).join(", ")}
            </p>
          )}

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {hotel.amenities.slice(0, 4).map((a) => {
                const key = a.toLowerCase();
                const Icon = AMENITY_ICONS[key];
                return (
                  <span
                    key={a}
                    className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600"
                  >
                    {Icon && <Icon className="h-3 w-3" />}
                    {a}
                  </span>
                );
              })}
            </div>
          )}

          <div className="flex items-end justify-between pt-2">
            <div>
              {hotel.userRating != null && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 font-semibold text-white">
                    {hotel.userRating.toFixed(1)}
                  </span>
                  <span className="text-slate-500">
                    {hotel.userRatingCount ?? "—"} reviews
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              {hasDiscount && (
                <div className="text-xs text-slate-400 line-through">
                  {formatInr(hotel.originalPriceInr)}
                </div>
              )}
              <div
                className={cn(
                  "text-lg font-bold",
                  hasDiscount ? "text-brand-accent" : "text-slate-900"
                )}
              >
                {formatInr(hotel.priceInr)}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-400">
                per night
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function HotelCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="aspect-[16/10] animate-pulse bg-slate-200" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-8 w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}
