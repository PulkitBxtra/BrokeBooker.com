import * as React from "react";
import { SearchBar } from "@/components/SearchBar";
import { Compass, Hotel, Sparkles, Shield } from "lucide-react";

const HERO_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=60";

export function Home() {
  const [scrollY, setScrollY] = React.useState(0);

  React.useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        raf = 0;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div>
      <section className="relative bg-brand text-white">
        {/* Parallax background — wrapped so overflow-hidden clips only the image,
            not dropdowns / popups rendered by the search bar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div
            className="absolute inset-x-0 -top-24 bottom-0"
            style={{
              backgroundImage: `linear-gradient(rgba(11,32,76,0.88), rgba(11,32,76,0.8)), url(${HERO_IMG})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              transform: `translate3d(0, ${scrollY * 0.4}px, 0)`,
              willChange: "transform",
            }}
          />
        </div>

        <div className="relative container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur">
              <Sparkles className="h-3 w-3" /> 12,000+ hotels across India
            </div>
            <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
              Find your next stay.<br />
              <span className="text-brand-accent">Book it in a tap.</span>
            </h1>
            <p className="mt-3 max-w-xl text-white/80">
              Handpicked hotels, real-time availability, and prices that won't
              make you cry. Seriously — we're BrokeBooker.
            </p>
          </div>

          <div className="mt-8">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 py-14 md:grid-cols-3">
        <Feature
          icon={<Compass />}
          title="Geosearch with PostGIS"
          body="Type any landmark (‘Taj Mahal’) or hit ‘Near me’ — we geocode, draw a live radius slider, and return hotels sorted by real distance."
        />
        <Feature
          icon={<Hotel />}
          title="Real inventory"
          body="Availability updates the second someone books — no zombie listings, no disappointments."
        />
        <Feature
          icon={<Shield />}
          title="Fair bookings"
          body="Database-level locks guarantee only one guest wins a room. No double-bookings. Ever."
        />
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-soft text-brand-accent">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
    </div>
  );
}
