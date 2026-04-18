import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Locate,
  Loader2,
  Compass,
  Radius,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_PLACES: string[] = [
  "Taj Mahal, Agra",
  "Calangute Beach, Goa",
  "MG Road, Bangalore",
  "Connaught Place, Delhi",
  "Charminar, Hyderabad",
];

export function DistanceSearchPanel({ className }: { className?: string }) {
  const nav = useNavigate();
  const [location, setLocation] = React.useState("");
  const [radiusKm, setRadiusKm] = React.useState(15);
  const [locating, setLocating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const q = location.trim();
    if (!q) {
      setError("Type a landmark, neighbourhood, or address first.");
      return;
    }
    const params = new URLSearchParams({
      q,
      radiusKm: String(radiusKm),
      forceGeo: "1",
    });
    nav(`/search?${params.toString()}`);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const params = new URLSearchParams({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
          label: "Your location",
          source: "near-me",
          radiusKm: String(radiusKm),
        });
        nav(`/search?${params.toString()}`);
      },
      () => {
        setError("Location permission was blocked.");
        setLocating(false);
      },
      { timeout: 8000 }
    );
  }

  const sliderPct = ((radiusKm - 1) / (50 - 1)) * 100;

  return (
    <form
      onSubmit={submit}
      className={cn(
        "overflow-hidden rounded-2xl bg-white/95 p-5 text-slate-900 shadow-xl ring-1 ring-white/30 backdrop-blur",
        className
      )}
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand-accent">
          <Compass className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold">Explore by distance</h3>
          <p className="text-[11px] text-slate-500">
            PostGIS geo-search · live radius filter
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.3fr,1.4fr,auto]">
        {/* Location */}
        <label className="flex flex-col rounded-xl border border-slate-200 px-3 py-2">
          <span className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <MapPin className="h-3 w-3" /> Location
          </span>
          <div className="flex items-center gap-2">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Taj Mahal, Juhu Beach, Electronic City…"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              title="Use my location"
              className="inline-flex shrink-0 items-center gap-1 rounded-full border border-brand-accent/40 bg-brand-soft px-2.5 py-1 text-[11px] font-semibold text-brand-accent transition hover:bg-brand-accent hover:text-white disabled:opacity-50"
            >
              {locating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Locate className="h-3 w-3" />
              )}
              Near me
            </button>
          </div>
        </label>

        {/* Radius */}
        <div className="flex flex-col rounded-xl border border-slate-200 px-3 py-2">
          <div className="mb-0.5 flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Radius className="h-3 w-3" /> Within
            </span>
            <span className="text-sm font-bold text-brand">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={50}
            step={1}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-accent [&::-webkit-slider-thumb]:shadow [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-brand-accent"
            style={{
              background: `linear-gradient(to right, #F47B20 0%, #F47B20 ${sliderPct}%, #e2e8f0 ${sliderPct}%, #e2e8f0 100%)`,
            }}
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* CTA */}
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-accent px-5 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600 md:self-stretch"
        >
          Find within {radiusKm} km
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Quick landmarks */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Try:
        </span>
        {QUICK_PLACES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setLocation(p)}
            className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:bg-brand-soft hover:text-brand-accent"
          >
            {p}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}
