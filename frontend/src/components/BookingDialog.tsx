import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, IndianRupee, Loader2 } from "lucide-react";
import type { AxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/store/auth";
import { holdBooking } from "@/api/bookings";
import type { HotelDetail, Room } from "@/types";
import { formatInr, formatDate } from "@/lib/utils";

export function BookingDialog({
  open,
  onOpenChange,
  room,
  hotel,
  defaults,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room: Room | null;
  hotel: HotelDetail;
  defaults: { checkIn: string; checkOut: string; guests: number };
}) {
  const { push } = useToast();
  const nav = useNavigate();
  const token = useAuth((s) => s.token);
  const qc = useQueryClient();

  const [checkIn, setCheckIn] = React.useState(defaults.checkIn);
  const [checkOut, setCheckOut] = React.useState(defaults.checkOut);
  const [guests, setGuests] = React.useState(defaults.guests);

  React.useEffect(() => {
    setCheckIn(defaults.checkIn);
    setCheckOut(defaults.checkOut);
    setGuests(defaults.guests);
  }, [defaults.checkIn, defaults.checkOut, defaults.guests]);

  const nights = React.useMemo(() => {
    const a = new Date(checkIn).getTime();
    const b = new Date(checkOut).getTime();
    return Math.max(1, Math.round((b - a) / (1000 * 60 * 60 * 24)));
  }, [checkIn, checkOut]);

  const total = (room?.priceInr ?? 0) * nights;

  const mutation = useMutation({
    mutationFn: () =>
      holdBooking({ roomId: room!.id, checkIn, checkOut, guests }),
    onSuccess: (booking) => {
      qc.invalidateQueries({ queryKey: ["hotel", hotel.id] });
      onOpenChange(false);
      nav(`/checkout/${booking.id}`);
    },
    onError: (err) => {
      const status = (err as AxiosError).response?.status;
      if (status === 409) {
        push({
          title: "Someone is booking this room right now",
          description: "Try different dates or another room type.",
          variant: "destructive",
        });
      } else if (status === 401) {
        push({
          title: "Please log in to book",
          variant: "destructive",
        });
        nav("/login");
      } else {
        push({
          title: "Couldn't place hold",
          description: (err as AxiosError<{ message?: string }>).response?.data?.message ?? "Try again.",
          variant: "destructive",
        });
      }
    },
  });

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm your booking</DialogTitle>
          <DialogDescription>
            {hotel.name} · {room.roomType} room
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-xs">
                <CalendarDays className="h-3 w-3" /> Check-in
              </Label>
              <Input
                type="date"
                value={checkIn}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1 text-xs">
                <CalendarDays className="h-3 w-3" /> Check-out
              </Label>
              <Input
                type="date"
                value={checkOut}
                min={checkIn}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="flex items-center gap-1 text-xs">
              <Users className="h-3 w-3" /> Guests (max {room.capacity})
            </Label>
            <Input
              type="number"
              min={1}
              max={room.capacity}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <div className="flex justify-between py-0.5">
              <span className="text-slate-600">
                {formatInr(room.priceInr)} × {nights} {nights === 1 ? "night" : "nights"}
              </span>
              <span>{formatInr(total)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1 font-semibold">
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" /> Total
              </span>
              <span className="text-lg">{formatInr(total)}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {formatDate(checkIn)} → {formatDate(checkOut)}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={mutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            disabled={mutation.isPending || !token}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {token ? "Continue to payment" : "Log in to book"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
