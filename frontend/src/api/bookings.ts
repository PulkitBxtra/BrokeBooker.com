import { api } from "./client";
import type { Booking } from "@/types";

export async function holdBooking(payload: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}) {
  const { data } = await api.post<Booking>("/api/bookings/hold", payload);
  return data;
}

export async function confirmBooking(id: string) {
  const { data } = await api.post<Booking>(`/api/bookings/${id}/confirm`);
  return data;
}

export async function cancelBooking(id: string) {
  await api.delete(`/api/bookings/${id}`);
}

export async function getMyBookings() {
  const { data } = await api.get<Booking[]>("/api/bookings/me");
  return data;
}

export async function getBooking(id: string) {
  const { data } = await api.get<Booking>(`/api/bookings/${id}`);
  return data;
}
