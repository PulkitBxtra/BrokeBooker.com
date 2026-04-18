import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CalendarDays, BedDouble, IndianRupee, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBooking } from "@/api/bookings";
import { formatDate, formatInr } from "@/lib/utils";

export function Confirmation() {
  const { id } = useParams();
  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id!),
    enabled: !!id,
  });

  if (isLoading || !booking) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-center text-white">
          <CheckCircle2 className="mx-auto h-14 w-14" />
          <h1 className="mt-3 text-3xl font-bold">Booking confirmed!</h1>
          <p className="mt-1 text-sm opacity-90">
            Reference #{booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4">
            {booking.hotelThumbnailUrl && (
              <img
                src={booking.hotelThumbnailUrl}
                alt={booking.hotelName}
                className="h-20 w-24 rounded-lg object-cover"
              />
            )}
            <div>
              <h2 className="font-semibold text-slate-900">{booking.hotelName}</h2>
              <p className="text-sm text-slate-500">{booking.roomType} room</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <Info
              icon={<CalendarDays className="h-4 w-4" />}
              label="Check-in"
              value={formatDate(booking.checkIn)}
            />
            <Info
              icon={<CalendarDays className="h-4 w-4" />}
              label="Check-out"
              value={formatDate(booking.checkOut)}
            />
            <Info
              icon={<BedDouble className="h-4 w-4" />}
              label="Nights"
              value={String(booking.nights)}
            />
            <Info
              icon={<Users className="h-4 w-4" />}
              label="Guests"
              value={String(booking.guests)}
            />
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 font-semibold">
                <IndianRupee className="h-4 w-4" /> Total paid
              </span>
              <span className="text-xl font-bold text-slate-900">
                {formatInr(booking.totalInr)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to="/my-bookings">My bookings</Link>
            </Button>
            <Button asChild variant="accent" className="flex-1">
              <Link to="/">Plan another trip</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-slate-500">
        {icon} {label}
      </div>
      <div className="mt-1 font-semibold text-slate-900">{value}</div>
    </div>
  );
}
