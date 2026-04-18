export type User = { id: string; name: string; email: string };

export type AuthResponse = { token: string; user: User };

export type HotelSummary = {
  id: string;
  name: string;
  starRating: number | null;
  userRating: number | null;
  userRatingCount: number | null;
  priceInr: number | null;
  originalPriceInr: number | null;
  discountPct: number | null;
  locality: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  thumbnailUrl: string | null;
  imageUrls: string[] | null;
  amenities: string[] | null;
  distanceKm: number | null;
  soldOut: boolean | null;
};

export type Room = {
  id: string;
  hotelId: string;
  roomType: string;
  capacity: number;
  priceInr: number;
  available: boolean;
};

export type HotelDetail = {
  id: string;
  name: string;
  description: string | null;
  starRating: number | null;
  userRating: number | null;
  userRatingCount: number | null;
  priceInr: number | null;
  originalPriceInr: number | null;
  discountPct: number | null;
  address: string | null;
  locality: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  imageUrls: string[] | null;
  amenities: string[] | null;
  thumbnailUrl: string | null;
  rooms: Room[];
};

export type BookingStatus = "PENDING" | "CONFIRMED";

export type Booking = {
  id: string;
  roomId: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  hotelThumbnailUrl: string | null;
  roomType: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  totalInr: number;
  status: BookingStatus | string;
  expiresAt: string | null;
  createdAt: string;
};

export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};
