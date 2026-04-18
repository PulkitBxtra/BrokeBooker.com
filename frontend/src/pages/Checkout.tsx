import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CreditCard,
  Lock,
  Timer,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
} from "lucide-react";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { cancelBooking, confirmBooking, getBooking } from "@/api/bookings";
import { formatDate, formatInr, cn } from "@/lib/utils";

export function Checkout() {
  const { id } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { push } = useToast();

  const { data: booking, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id!),
    enabled: !!id,
  });

  const expiresAt = booking?.expiresAt
    ? new Date(booking.expiresAt).getTime()
    : null;

  const [remainingMs, setRemainingMs] = React.useState<number>(() =>
    expiresAt ? Math.max(0, expiresAt - Date.now()) : 0
  );

  React.useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemainingMs(Math.max(0, expiresAt - Date.now()));
    tick();
    const h = window.setInterval(tick, 250);
    return () => window.clearInterval(h);
  }, [expiresAt]);

  const alreadyConfirmed = booking?.status === "CONFIRMED";
  const expired = !alreadyConfirmed && expiresAt != null && remainingMs <= 0;

  const confirmMutation = useMutation({
    mutationFn: () => confirmBooking(id!),
    onSuccess: (b) => {
      qc.invalidateQueries({ queryKey: ["my-bookings"] });
      qc.invalidateQueries({ queryKey: ["hotel", b.hotelId] });
      push({
        title: "Payment successful",
        description: "Your booking is confirmed.",
        variant: "success",
      });
      nav(`/bookings/${b.id}`);
    },
    onError: (err) => {
      const status = (err as AxiosError).response?.status;
      push({
        title:
          status === 409 ? "Hold expired" : "Payment failed",
        description:
          (err as AxiosError<{ message?: string }>).response?.data?.message ??
          "Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id!),
    onSuccess: () => {
      push({ title: "Hold released" });
      if (booking) nav(`/hotels/${booking.hotelId}`);
      else nav("/");
    },
  });

  if (isLoading || !booking) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (alreadyConfirmed) {
    nav(`/bookings/${booking.id}`, { replace: true });
    return null;
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const pct = expiresAt
    ? Math.max(0, Math.min(100, (remainingMs / 60000) * 100))
    : 0;
  const urgent = totalSeconds <= 15;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        {/* LEFT — payment "form" */}
        <div>
          <div
            className={cn(
              "mb-4 overflow-hidden rounded-2xl shadow-sm ring-1",
              expired
                ? "bg-red-50 ring-red-200"
                : urgent
                ? "bg-amber-50 ring-amber-200"
                : "bg-brand-soft ring-brand-accent/30"
            )}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              {expired ? (
                <XCircle className="h-6 w-6 shrink-0 text-red-600" />
              ) : (
                <Timer
                  className={cn(
                    "h-6 w-6 shrink-0",
                    urgent ? "text-amber-600" : "text-brand-accent"
                  )}
                />
              )}
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {expired
                    ? "Your hold has expired"
                    : "Complete payment within"}
                </div>
                <div
                  className={cn(
                    "font-mono text-2xl font-bold tabular-nums",
                    expired
                      ? "text-red-700"
                      : urgent
                      ? "text-amber-700"
                      : "text-brand"
                  )}
                >
                  {expired
                    ? "Expired"
                    : `${String(mins).padStart(2, "0")}:${String(secs).padStart(
                        2,
                        "0"
                      )}`}
                </div>
              </div>
              {!expired && (
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
              )}
            </div>
            {!expired && (
              <div className="h-1.5 bg-white/60">
                <div
                  className={cn(
                    "h-full transition-[width] duration-200",
                    urgent ? "bg-amber-500" : "bg-brand-accent"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>

          {expired ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <XCircle className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="mt-3 text-xl font-bold">Room hold released</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your 60-second payment window ran out. The room is now available
                for other guests.
              </p>
              <div className="mt-6 flex justify-center gap-2">
                <Button asChild variant="outline">
                  <Link to={`/hotels/${booking.hotelId}`}>Try again</Link>
                </Button>
                <Button asChild variant="accent">
                  <Link to="/">Find another stay</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                confirmMutation.mutate();
              }}
              className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <CreditCard className="h-5 w-5 text-brand-accent" />
                  Payment details
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  This is a pseudo-payment screen — no card is ever charged.
                </p>
              </div>

              <div className="space-y-1">
                <Label>Card number</Label>
                <Input
                  inputMode="numeric"
                  defaultValue="4242 4242 4242 4242"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Name on card</Label>
                  <Input defaultValue="Demo User" />
                </div>
                <div className="space-y-1">
                  <Label>CVV</Label>
                  <Input inputMode="numeric" maxLength={4} defaultValue="123" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Expiry</Label>
                  <Input defaultValue="12/29" />
                </div>
                <div className="space-y-1">
                  <Label>Postal code</Label>
                  <Input defaultValue="560001" />
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => cancelMutation.mutate()}
                  disabled={cancelMutation.isPending || confirmMutation.isPending}
                >
                  Cancel hold
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  disabled={confirmMutation.isPending}
                >
                  {confirmMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  Pay {formatInr(booking.totalInr)}
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* RIGHT — booking summary */}
        <aside>
          <div className="sticky top-24 space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              {booking.hotelThumbnailUrl ? (
                <img
                  src={booking.hotelThumbnailUrl}
                  alt=""
                  className="h-20 w-24 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="h-20 w-24 shrink-0 rounded-lg bg-slate-200" />
              )}
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-slate-900">
                  {booking.hotelName}
                </h3>
                <p className="text-xs text-slate-500">{booking.roomType} room</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  Room held for you
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 text-sm">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" />
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {booking.nights} {booking.nights === 1 ? "night" : "nights"} ·{" "}
                {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
              </div>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>
                  Room × {booking.nights} {booking.nights === 1 ? "night" : "nights"}
                </span>
                <span>{formatInr(booking.totalInr)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Taxes & fees</span>
                <span>Included</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-3">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold text-slate-900">
                {formatInr(booking.totalInr)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
