import { api } from "./client";
import type { HotelDetail, HotelSummary, Page } from "@/types";

export async function searchHotels(params: {
  q: string;
  page?: number;
  size?: number;
  checkIn?: string;
  checkOut?: string;
}) {
  const { data } = await api.get<Page<HotelSummary>>("/api/hotels/search", {
    params,
  });
  return data;
}

export async function suggestHotels(q: string, limit = 8) {
  const { data } = await api.get<HotelSummary[]>("/api/hotels/suggest", {
    params: { q, limit },
  });
  return data;
}

export async function nearbyHotels(params: {
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
  checkIn?: string;
  checkOut?: string;
}) {
  const { data } = await api.get<HotelSummary[]>("/api/hotels/nearby", {
    params,
  });
  return data;
}

export type GeoResolve = {
  lat: number;
  lng: number;
  formatted: string;
  type: string | null;
};

export async function geocode(q: string) {
  const { data } = await api.get<GeoResolve>("/api/hotels/geocode", {
    params: { q },
  });
  return data;
}

export async function getHotel(
  id: string,
  dates?: { checkIn?: string; checkOut?: string }
) {
  const { data } = await api.get<HotelDetail>(`/api/hotels/${id}`, {
    params: dates,
  });
  return data;
}
