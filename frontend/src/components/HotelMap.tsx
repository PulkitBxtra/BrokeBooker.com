import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import type { HotelSummary } from "@/types";
import { formatInr } from "@/lib/utils";

// Default markers break under bundlers; use inline SVG data-url pin icons colored by state.
function pinIcon(color: string, active = false) {
  const size = active ? 44 : 36;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="${size}" height="${
    size * 1.33
  }"><path fill="${color}" stroke="white" stroke-width="1.5" d="M12 0C5.4 0 0 5.4 0 12c0 8 12 20 12 20s12-12 12-20c0-6.6-5.4-12-12-12z"/><circle cx="12" cy="12" r="4.5" fill="white"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [size, size * 1.33],
    iconAnchor: [size / 2, size * 1.33],
    popupAnchor: [0, -size * 1.2],
  });
}

const ICON_DEFAULT = pinIcon("#F47B20");
const ICON_ACTIVE = pinIcon("#0B204C", true);
const ICON_YOU = L.divIcon({
  html: `<div style="width:18px;height:18px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 3px rgba(59,130,246,0.35);"></div>`,
  className: "",
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({
  points,
  center,
  radiusKm,
}: {
  points: Array<[number, number]>;
  center?: [number, number];
  radiusKm?: number;
}) {
  const map = useMap();
  React.useEffect(() => {
    if (center && radiusKm) {
      // toBounds is math-only (no map projection needed) — unlike circle.getBounds()
      const bounds = L.latLng(center[0], center[1]).toBounds(radiusKm * 2 * 1000);
      map.fitBounds(bounds, { padding: [30, 30] });
      return;
    }
    if (points.length === 0 && center) {
      map.setView(center, 13);
      return;
    }
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }
    const bounds = L.latLngBounds(points.map((p) => L.latLng(p[0], p[1])));
    if (center) bounds.extend(L.latLng(center[0], center[1]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [map, JSON.stringify(points), JSON.stringify(center), radiusKm]);
  return null;
}

export function HotelMap({
  hotels,
  userLocation,
  searchCenter,
  searchRadiusKm,
  activeId,
  onMarkerClick,
  hotelQuery,
  className,
}: {
  hotels: HotelSummary[];
  userLocation?: { lat: number; lng: number };
  searchCenter?: { lat: number; lng: number };
  searchRadiusKm?: number;
  activeId?: string | null;
  onMarkerClick?: (id: string) => void;
  hotelQuery?: string;
  className?: string;
}) {
  const geo = hotels.filter(
    (h) => h.latitude != null && h.longitude != null
  );

  const points: Array<[number, number]> = geo.map((h) => [
    h.latitude!,
    h.longitude!,
  ]);

  const center: [number, number] =
    searchCenter
      ? [searchCenter.lat, searchCenter.lng]
      : userLocation
      ? [userLocation.lat, userLocation.lng]
      : points[0] ?? [20.5937, 78.9629]; // India fallback

  return (
    <div
      className={className ?? "h-full w-full overflow-hidden rounded-xl ring-1 ring-slate-200"}
    >
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds
          points={points}
          center={
            searchCenter
              ? [searchCenter.lat, searchCenter.lng]
              : userLocation
              ? [userLocation.lat, userLocation.lng]
              : undefined
          }
          radiusKm={searchRadiusKm}
        />

        {searchCenter && searchRadiusKm && (
          <Circle
            center={[searchCenter.lat, searchCenter.lng]}
            radius={searchRadiusKm * 1000}
            pathOptions={{
              color: "#F47B20",
              fillColor: "#F47B20",
              fillOpacity: 0.08,
              weight: 2,
              dashArray: "6 6",
            }}
          />
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={ICON_YOU}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {geo.map((h) => (
          <Marker
            key={h.id}
            position={[h.latitude!, h.longitude!]}
            icon={activeId === h.id ? ICON_ACTIVE : ICON_DEFAULT}
            eventHandlers={{
              click: () => onMarkerClick?.(h.id),
            }}
          >
            <Popup>
              <div className="w-56">
                {h.thumbnailUrl && (
                  <img
                    src={h.thumbnailUrl}
                    alt=""
                    className="mb-2 h-24 w-full rounded-md object-cover"
                  />
                )}
                <div className="flex items-start justify-between gap-1">
                  <h4 className="text-sm font-semibold leading-tight text-slate-900">
                    {h.name}
                  </h4>
                  {h.starRating != null && (
                    <span className="flex shrink-0 items-center text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span className="ml-0.5 text-xs font-medium">
                        {h.starRating.toFixed(0)}
                      </span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {[h.locality, h.city].filter(Boolean).join(", ")}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-base font-bold text-slate-900">
                      {formatInr(h.priceInr)}
                    </div>
                    <div className="text-[10px] uppercase tracking-wide text-slate-400">
                      per night
                    </div>
                  </div>
                  <Link
                    to={`/hotels/${h.id}${hotelQuery ? `?${hotelQuery}` : ""}`}
                    className="rounded-md bg-brand-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-600"
                  >
                    View
                  </Link>
                </div>
                {h.distanceKm != null && (
                  <p className="mt-1 text-[11px] text-slate-500">
                    {h.distanceKm.toFixed(1)} km away
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
