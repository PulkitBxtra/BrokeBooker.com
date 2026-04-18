import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyBookings } from "@/api/bookings";
import { formatDate, formatInr } from "@/lib/utils";

export function MyBookings() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: getMyBookings,
  });

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My bookings</h1>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && bookings && bookings.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-slate-500">No bookings yet.</p>
          <Button asChild variant="accent" className="mt-4">
            <Link to="/">Find a hotel</Link>
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {bookings?.map((b) => (
          <Link
            key={b.id}
            to={`/bookings/${b.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
          >
            {b.hotelThumbnailUrl ? (
              <img
                src={b.hotelThumbnailUrl}
                alt=""
                className="h-20 w-24 rounded-lg object-cover"
              />
            ) : (
              <div className="h-20 w-24 rounded-lg bg-slate-200" />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{b.hotelName}</h3>
              <p className="text-sm text-slate-500">{b.roomType}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                <CalendarDays className="h-3 w-3" />
                {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {b.nights} nights
              </p>
            </div>
            <div className="text-right">
              <Badge variant="success">{b.status}</Badge>
              <p className="mt-2 font-bold">{formatInr(b.totalInr)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
