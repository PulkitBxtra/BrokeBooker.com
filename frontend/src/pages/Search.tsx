import * as React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Locate,
  Loader2,
  List,
  Map as MapIcon,
  Columns2,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { HotelCard, HotelCardSkeleton } from "@/components/HotelCard";
import { HotelMap } from "@/components/HotelMap";
import { RadiusSlider } from "@/components/RadiusSlider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { searchHotels, nearbyHotels, geocode } from "@/api/hotels";
import { cn } from "@/lib/utils";
import type { HotelSummary } from "@/types";

type ViewMode = "split" | "list" | "map";
type Mode =
  | { kind: "query"; q: string }
  | {
      kind: "geo";
      center: { lat: number; lng: number };
      label: string;
      source: "near-me" | "geocoded";
    };

export function SearchPage() {
  const [params] = useSearchParams();
  // Accept both ?q= (new) and ?city= (legacy) for back-compat
  const qParam = params.get("q") ?? params.get("city") ?? "Mumbai";
  const checkIn = params.get("checkIn") ?? "";
  const checkOut = params.get("checkOut") ?? "";
  const guests = Number(params.get("guests") ?? 2);

  // Direct geo deep-link: ?lat=…&lng=…&label=…&source=near-me|geocoded
  const latParam = params.get("lat");
  const lngParam = params.get("lng");
  const labelParam = params.get("label");
  const sourceParam = params.get("source") === "near-me" ? "near-me" : "geocoded";
  const radiusParam = params.get("radiusKm");
  const forceGeo = params.get("forceGeo") === "1";

  const initialMode = React.useMemo<Mode>(() => {
    if (latParam && lngParam) {
      return {
        kind: "geo",
        center: { lat: Number(latParam), lng: Number(lngParam) },
        label: labelParam ?? "Selected location",
        source: sourceParam as "near-me" | "geocoded",
      };
    }
    return { kind: "query", q: qParam };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { push } = useToast();
  const [mode, setMode] = React.useState<Mode>(initialMode);
  const [radiusKm, setRadiusKm] = React.useState(
    radiusParam ? Math.max(1, Math.min(50, Number(radiusParam))) : 15
  );
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [view, setView] = React.useState<ViewMode>("split");
  const [nearbyLoading, setNearbyLoading] = React.useState(false);
  const [geocoding, setGeocoding] = React.useState(false);

  // Reset when the URL's q param changes — but don't clobber an active geo deep-link
  React.useEffect(() => {
    if (latParam && lngParam) return;
    setMode({ kind: "query", q: qParam });
  }, [qParam, latParam, lngParam]);

  // ?forceGeo=1 + ?q=<landmark> → skip city search entirely, geocode straight away
  const [forcedGeoDone, setForcedGeoDone] = React.useState(false);
  React.useEffect(() => {
    if (!forceGeo || forcedGeoDone || mode.kind !== "query" || !qParam) return;
    let cancelled = false;
    setGeocoding(true);
    (async () => {
      try {
        const g = await geocode(qParam);
        if (cancelled) return;
        setMode({
          kind: "geo",
          center: { lat: g.lat, lng: g.lng },
          label: g.formatted,
          source: "geocoded",
        });
      } catch {
        if (!cancelled) {
          push({
            title: `Couldn't find "${qParam}"`,
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) {
          setGeocoding(false);
          setForcedGeoDone(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceGeo, qParam]);

  const cityQuery = useQuery({
    queryKey: ["search", mode.kind === "query" ? mode.q : null, checkIn, checkOut],
    queryFn: () =>
      searchHotels({
        q: mode.kind === "query" ? mode.q : "",
        size: 30,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
      }),
    enabled: mode.kind === "query" && !forceGeo,
  });

  const geoQuery = useQuery({
    queryKey: [
      "nearby",
      mode.kind === "geo" ? mode.center.lat : null,
      mode.kind === "geo" ? mode.center.lng : null,
      radiusKm,
      checkIn,
      checkOut,
    ],
    queryFn: () =>
      mode.kind === "geo"
        ? nearbyHotels({
            lat: mode.center.lat,
            lng: mode.center.lng,
            radiusKm,
            limit: 60,
            checkIn: checkIn || undefined,
            checkOut: checkOut || undefined,
          })
        : Promise.resolve([]),
    enabled: mode.kind === "geo",
    placeholderData: (prev) => prev,
  });

  // Auto-fallback: query search returned 0 hits → geocode the query → switch to geo mode
  const cityHits = cityQuery.data?.content.length ?? null;
  const queryString = mode.kind === "query" ? mode.q : null;
  React.useEffect(() => {
    if (
      mode.kind !== "query" ||
      cityQuery.isLoading ||
      cityHits === null ||
      cityHits > 0 ||
      geocoding
    ) {
      return;
    }
    let cancelled = false;
    (async () => {
      setGeocoding(true);
      try {
        const g = await geocode(queryString!);
        if (cancelled) return;
        push({
          title: `No hotels match "${queryString}"`,
          description: `Searching within ${radiusKm} km of ${g.formatted}`,
        });
        setMode({
          kind: "geo",
          center: { lat: g.lat, lng: g.lng },
          label: g.formatted,
          source: "geocoded",
        });
      } catch {
        if (!cancelled) {
          push({
            title: `No results for "${queryString}"`,
            description: "Try a different city, hotel, or address.",
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setGeocoding(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityHits, mode.kind, queryString]);

  async function findNearMe() {
    if (!navigator.geolocation) {
      push({ title: "Geolocation not supported", variant: "destructive" });
      return;
    }
    setNearbyLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMode({
          kind: "geo",
          center: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          label: "Your location",
          source: "near-me",
        });
        setNearbyLoading(false);
      },
      () => {
        push({ title: "Location permission denied", variant: "destructive" });
        setNearbyLoading(false);
      }
    );
  }

  const results: HotelSummary[] =
    mode.kind === "query"
      ? cityQuery.data?.content ?? []
      : geoQuery.data ?? [];
  const isLoading =
    nearbyLoading ||
    geocoding ||
    (mode.kind === "query" && cityQuery.isLoading) ||
    (mode.kind === "geo" && geoQuery.isLoading);

  const query = `checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  const geoCount = results.filter(
    (h) => h.latitude != null && h.longitude != null
  ).length;

  const userLocation =
    mode.kind === "geo" && mode.source === "near-me"
      ? mode.center
      : undefined;
  const centerForMap =
    mode.kind === "geo" ? mode.center : undefined;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4">
        <SearchBar compact initial={{ city: qParam, checkIn, checkOut, guests }} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {mode.kind === "query"
              ? `Results for "${mode.q}"`
              : mode.source === "near-me"
              ? "Hotels near you"
              : `Hotels near ${mode.label.split(",")[0]}`}
          </h1>
          <p className="text-sm text-slate-500">
            {isLoading
              ? geocoding
                ? "Resolving location…"
                : "Finding stays…"
              : `${results.length} ${
                  results.length === 1 ? "property" : "properties"
                } found${geoCount !== results.length ? ` · ${geoCount} on map` : ""}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle value={view} onChange={setView} />
          <Button
            variant="outline"
            size="sm"
            onClick={findNearMe}
            disabled={nearbyLoading}
          >
            {nearbyLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Locate className="h-4 w-4" />
            )}
            Near me
          </Button>
        </div>
      </div>

      <div className="mb-4 max-w-md">
        <RadiusSlider
          value={radiusKm}
          onChange={async (v) => {
            setRadiusKm(v);
            // Dragging the filter while browsing query results? Promote to geo
            // mode by geocoding the current query, then honor the new radius.
            if (mode.kind === "query" && qParam && !geocoding) {
              setGeocoding(true);
              try {
                const g = await geocode(qParam);
                setMode({
                  kind: "geo",
                  center: { lat: g.lat, lng: g.lng },
                  label: g.formatted,
                  source: "geocoded",
                });
              } catch {
                push({
                  title: `Couldn't resolve "${qParam}" to a location`,
                  variant: "destructive",
                });
              } finally {
                setGeocoding(false);
              }
            }
          }}
          min={1}
          max={50}
        />
      </div>

      <div
        className={cn(
          "grid gap-4",
          view === "split" && "lg:grid-cols-[1fr,1fr]",
          view === "split" && "lg:h-[calc(100vh-260px)]"
        )}
      >
        <div
          className={cn(
            view === "map" && "hidden lg:hidden",
            view === "split" && "lg:overflow-y-auto lg:pr-2"
          )}
        >
          <div
            className={cn(
              "grid gap-4",
              view === "list" && "sm:grid-cols-2 lg:grid-cols-3",
              view === "split" && "sm:grid-cols-2"
            )}
          >
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <HotelCardSkeleton key={i} />)}
            {!isLoading &&
              results.map((h) => (
                <div
                  key={h.id}
                  onMouseEnter={() => setActiveId(h.id)}
                  onMouseLeave={() => setActiveId(null)}
                >
                  <HotelCard hotel={h} query={query} />
                </div>
              ))}
            {!isLoading && results.length === 0 && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                {mode.kind === "geo"
                  ? "No hotels in this radius. Try widening the search area."
                  : "No hotels match your search."}
              </div>
            )}
          </div>
        </div>

        {(view === "split" || view === "map") && (
          <div
            className={cn(
              view === "split" && "hidden lg:block lg:sticky lg:top-24 lg:h-full",
              view === "map" && "h-[calc(100vh-260px)]"
            )}
          >
            {results.length > 0 || mode.kind === "geo" ? (
              <HotelMap
                hotels={results}
                userLocation={userLocation}
                searchCenter={centerForMap}
                searchRadiusKm={mode.kind === "geo" ? radiusKm : undefined}
                activeId={activeId}
                onMarkerClick={setActiveId}
                hotelQuery={query}
              />
            ) : (
              <div className="grid h-full place-items-center rounded-xl bg-slate-100 text-sm text-slate-500">
                Map will appear here once we find hotels.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const opts: Array<{ v: ViewMode; icon: React.ReactNode; label: string }> = [
    { v: "list", icon: <List className="h-3.5 w-3.5" />, label: "List" },
    { v: "split", icon: <Columns2 className="h-3.5 w-3.5" />, label: "Split" },
    { v: "map", icon: <MapIcon className="h-3.5 w-3.5" />, label: "Map" },
  ];
  return (
    <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs">
      {opts.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-2 py-1 font-medium transition",
            value === o.v
              ? "bg-brand text-white"
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {o.icon}
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
