import * as React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, Users, ShieldCheck, Wifi, Coffee, Car, Dumbbell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingDialog } from "@/components/BookingDialog";
import { getHotel } from "@/api/hotels";
import { formatInr, formatDate, defaultCheckIn, defaultCheckOut } from "@/lib/utils";
import type { Room } from "@/types";

const AMENITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  wifi: Wifi,
  "free wifi": Wifi,
  breakfast: Coffee,
  parking: Car,
  gym: Dumbbell,
};

export function HotelDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const checkIn = params.get("checkIn") || defaultCheckIn();
  const checkOut = params.get("checkOut") || defaultCheckOut();
  const guests = Number(params.get("guests") ?? 2);

  const { data: hotel, isLoading } = useQuery({
    queryKey: ["hotel", id, checkIn, checkOut],
    queryFn: () => getHotel(id!, { checkIn, checkOut }),
    enabled: !!id,
  });

  const [active, setActive] = React.useState(0);
  const [bookingRoom, setBookingRoom] = React.useState<Room | null>(null);

  if (isLoading || !hotel) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full rounded-2xl" />
        <Skeleton className="mt-4 h-8 w-2/3" />
      </div>
    );
  }

  const images =
    hotel.imageUrls && hotel.imageUrls.length > 0
      ? hotel.imageUrls
      : hotel.thumbnailUrl
      ? [hotel.thumbnailUrl]
      : [`https://picsum.photos/seed/${hotel.id}/1200/700`];

  const hasDiscount =
    hotel.discountPct != null &&
    hotel.discountPct > 0 &&
    hotel.originalPriceInr != null;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Gallery */}
      <div className="grid gap-2 md:grid-cols-4 md:grid-rows-2 md:h-[420px]">
        <div className="relative col-span-4 row-span-2 overflow-hidden rounded-2xl bg-slate-100 md:col-span-2">
          <img
            src={images[active]}
            alt={hotel.name}
            className="h-full w-full object-cover"
          />
        </div>
        {images.slice(1, 5).map((src, idx) => (
          <button
            key={idx}
            onClick={() => setActive(idx + 1)}
            className="relative hidden overflow-hidden rounded-2xl bg-slate-100 md:block"
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">{hotel.name}</h1>
              {hotel.starRating && (
                <span className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: Math.round(hotel.starRating) }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400" />
                  ))}
                </span>
              )}
              {hotel.userRating != null && (
                <Badge variant="success">
                  {hotel.userRating.toFixed(1)} / 5 · {hotel.userRatingCount ?? 0} reviews
                </Badge>
              )}
            </div>
            <p className="mt-2 flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              {[hotel.address, hotel.locality, hotel.city].filter(Boolean).join(", ")}
            </p>
          </div>

          {hotel.description && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">About this property</h2>
              <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                {hotel.description}
              </p>
            </section>
          )}

          {hotel.amenities && hotel.amenities.length > 0 && (
            <section>
              <h2 className="mb-2 text-lg font-semibold">Amenities</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {hotel.amenities.map((a) => {
                  const Icon = AMENITY_ICONS[a.toLowerCase()];
                  return (
                    <div
                      key={a}
                      className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200"
                    >
                      {Icon ? <Icon className="h-4 w-4 text-brand-accent" /> : <ShieldCheck className="h-4 w-4 text-brand-accent" />}
                      {a}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rooms available</h2>
              <p className="text-xs text-slate-500">
                {formatDate(checkIn)} → {formatDate(checkOut)}
              </p>
            </div>
            <div className="space-y-3">
              {hotel.rooms.length === 0 && (
                <p className="text-sm text-slate-500">No rooms listed for this hotel.</p>
              )}
              {hotel.rooms.map((room) => (
                <RoomRow
                  key={room.id}
                  room={room}
                  onBook={() => setBookingRoom(room)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Sticky price rail */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-3 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-200">
            {hasDiscount && (
              <Badge variant="accent" className="mb-2">
                {hotel.discountPct}% off · limited-time
              </Badge>
            )}
            <div>
              {hasDiscount && (
                <span className="mr-2 text-sm text-slate-400 line-through">
                  {formatInr(hotel.originalPriceInr)}
                </span>
              )}
              <span className="text-3xl font-bold text-slate-900">
                {formatInr(hotel.priceInr)}
              </span>
              <span className="ml-1 text-xs text-slate-500">/ night</span>
            </div>
            <p className="text-xs text-slate-500">
              Taxes and fees included. Availability in real-time.
            </p>
            <Button
              variant="accent"
              size="lg"
              className="w-full"
              onClick={() => {
                const first = hotel.rooms.find((r) => r.available) ?? hotel.rooms[0];
                if (first) setBookingRoom(first);
              }}
              disabled={hotel.rooms.length === 0}
            >
              Reserve now
            </Button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Instant confirmation · No credit card for demo
            </div>
          </div>
        </aside>
      </div>

      <BookingDialog
        open={!!bookingRoom}
        onOpenChange={(o) => !o && setBookingRoom(null)}
        room={bookingRoom}
        hotel={hotel}
        defaults={{ checkIn, checkOut, guests }}
      />
    </div>
  );
}

function RoomRow({ room, onBook }: { room: Room; onBook: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 ring-1 ring-slate-200">
      <div>
        <h3 className="font-semibold">{room.roomType}</h3>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <Users className="h-3 w-3" /> Up to {room.capacity} guests
        </p>
        {!room.available && (
          <Badge variant="outline" className="mt-1 text-[11px]">
            Booked for these dates
          </Badge>
        )}
      </div>
      <div className="text-right">
        <div className="text-lg font-bold">{formatInr(room.priceInr)}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">
          per night
        </div>
        <Button
          size="sm"
          variant={room.available ? "accent" : "outline"}
          disabled={!room.available}
          onClick={onBook}
          className="mt-2"
        >
          {room.available ? "Book now" : "Unavailable"}
        </Button>
      </div>
    </div>
  );
}

