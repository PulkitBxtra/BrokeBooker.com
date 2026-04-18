import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  CalendarDays,
  Users,
  Search,
  Building2,
  Hotel as HotelIcon,
  Star,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { suggestHotels } from "@/api/hotels";
import { useDebounce } from "@/hooks/useDebounce";
import { toIsoDate, formatInr } from "@/lib/utils";

const POPULAR_CITIES: Array<{ name: string; blurb: string }> = [
  { name: "Mumbai", blurb: "Maharashtra · Beaches & Bollywood" },
  { name: "Gurgaon", blurb: "Haryana · Corporate capital" },
  { name: "Bangalore", blurb: "Karnataka · Pubs & tech parks" },
  { name: "Goa", blurb: "Konkan · Beaches & nightlife" },
  { name: "Hyderabad", blurb: "Telangana · Biryani & heritage" },
];

export function SearchBar({
  initial,
  compact = false,
}: {
  initial?: { city?: string; checkIn?: string; checkOut?: string; guests?: number };
  compact?: boolean;
}) {
  const nav = useNavigate();
  const tomorrow = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return toIsoDate(d);
  }, []);
  const dayAfter = React.useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return toIsoDate(d);
  }, []);

  const [city, setCity] = React.useState(initial?.city ?? "Mumbai");
  const [checkIn, setCheckIn] = React.useState(initial?.checkIn ?? tomorrow);
  const [checkOut, setCheckOut] = React.useState(initial?.checkOut ?? dayAfter);
  const [guests, setGuests] = React.useState(initial?.guests ?? 2);
  const [cityOpen, setCityOpen] = React.useState(false);
  const cityFieldRef = React.useRef<HTMLLabelElement | null>(null);

  const debouncedQuery = useDebounce(city, 200);
  const query = debouncedQuery.trim();

  const hotelSuggestions = useQuery({
    queryKey: ["suggest", query],
    queryFn: () => suggestHotels(query, 6),
    enabled: cityOpen && query.length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  React.useEffect(() => {
    if (!cityOpen) return;
    function onDocClick(e: MouseEvent) {
      if (
        cityFieldRef.current &&
        !cityFieldRef.current.contains(e.target as Node)
      ) {
        setCityOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [cityOpen]);

  const filteredCities = React.useMemo(() => {
    const q = city.trim().toLowerCase();
    if (!q) return POPULAR_CITIES;
    return POPULAR_CITIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [city]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      q: city,
      checkIn,
      checkOut,
      guests: String(guests),
    });
    nav(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={submit}
      className={
        compact
          ? "relative grid gap-0 divide-x divide-slate-200 rounded-xl bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 md:grid-cols-[2fr,1fr,1fr,0.8fr,auto]"
          : "relative grid gap-0 divide-x divide-slate-200 rounded-2xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200 md:grid-cols-[2fr,1fr,1fr,0.8fr,auto]"
      }
    >
      <Field
        icon={<MapPin className="h-4 w-4" />}
        label="City or hotel"
        fieldRef={cityFieldRef}
      >
        <input
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setCityOpen(true);
          }}
          onFocus={() => setCityOpen(true)}
          placeholder="Where to, or which hotel?"
          required
          autoComplete="off"
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {cityOpen && (
          <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[70vh] min-w-[20rem] overflow-y-auto rounded-xl bg-white text-slate-900 shadow-xl ring-1 ring-slate-200">
            {/* Cities */}
            <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Popular cities
            </div>
            {filteredCities.length === 0 && (
              <div className="px-4 py-2 text-sm text-slate-500">
                No city matches
              </div>
            )}
            {filteredCities.map((c) => (
              <button
                key={c.name}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setCity(c.name);
                  setCityOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-brand-soft"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-brand-accent">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {c.name}
                  </div>
                  <div className="truncate text-[11px] text-slate-500">
                    {c.blurb}
                  </div>
                </div>
              </button>
            ))}

            {/* Hotels — only once they've typed enough */}
            {query.length >= 2 && (
              <>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 px-3 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <span>Hotels</span>
                  {hotelSuggestions.isFetching && (
                    <Loader2 className="h-3 w-3 animate-spin text-slate-400" />
                  )}
                </div>
                {!hotelSuggestions.isFetching &&
                  hotelSuggestions.data &&
                  hotelSuggestions.data.length === 0 && (
                    <div className="px-4 py-2 text-sm text-slate-500">
                      No hotels match “{query}”
                    </div>
                  )}
                {hotelSuggestions.data?.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCityOpen(false);
                      nav(
                        `/hotels/${h.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                      );
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-brand-soft"
                  >
                    {h.thumbnailUrl ? (
                      <img
                        src={h.thumbnailUrl}
                        alt=""
                        className="h-10 w-12 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="grid h-10 w-12 shrink-0 place-items-center rounded-md bg-slate-100 text-brand-accent">
                        <HotelIcon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {h.name}
                      </div>
                      <div className="flex items-center gap-1 truncate text-[11px] text-slate-500">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {[h.locality, h.city].filter(Boolean).join(", ")}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      {h.starRating != null && (
                        <div className="flex items-center justify-end gap-0.5 text-[11px] text-amber-500">
                          <Star className="h-3 w-3 fill-amber-400" />
                          {h.starRating.toFixed(0)}
                        </div>
                      )}
                      <div className="text-xs font-semibold text-slate-900">
                        {formatInr(h.priceInr)}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </Field>

      <Field icon={<CalendarDays className="h-4 w-4" />} label="Check-in">
        <input
          type="date"
          value={checkIn}
          min={toIsoDate(new Date())}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
        />
      </Field>

      <Field icon={<CalendarDays className="h-4 w-4" />} label="Check-out">
        <input
          type="date"
          value={checkOut}
          min={checkIn}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
        />
      </Field>

      <Field icon={<Users className="h-4 w-4" />} label="Guests">
        <input
          type="number"
          min={1}
          max={12}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          className="w-full bg-transparent text-sm text-slate-900 outline-none"
        />
      </Field>

      <Button
        type="submit"
        size="lg"
        variant="accent"
        className="h-auto min-h-[3.75rem] w-full rounded-none md:w-auto md:rounded-l-none md:rounded-r-2xl"
      >
        <Search className="h-4 w-4" />
        Search
      </Button>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
  fieldRef,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  fieldRef?: React.Ref<HTMLLabelElement>;
}) {
  return (
    <label
      ref={fieldRef}
      className="relative flex min-w-0 flex-col px-4 py-3 transition-colors hover:bg-slate-50"
    >
      <span className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {icon} {label}
      </span>
      {children}
    </label>
  );
}
