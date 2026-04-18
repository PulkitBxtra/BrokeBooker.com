package com.bxtra.brokebooker.booking.dto;

import com.bxtra.brokebooker.booking.Booking;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BookingDto(
        UUID id,
        UUID roomId,
        UUID userId,
        String hotelId,
        String hotelName,
        String hotelThumbnailUrl,
        String roomType,
        LocalDate checkIn,
        LocalDate checkOut,
        int nights,
        int guests,
        int totalInr,
        String status,
        Instant expiresAt,
        Instant createdAt
) {
    public static BookingDto from(Booking b, String hotelId, String hotelName,
                                  String thumbnailUrl, String roomType) {
        int nights = (int) java.time.temporal.ChronoUnit.DAYS.between(b.getCheckIn(), b.getCheckOut());
        return new BookingDto(
                b.getId(), b.getRoomId(), b.getUserId(),
                hotelId, hotelName, thumbnailUrl, roomType,
                b.getCheckIn(), b.getCheckOut(), nights,
                b.getGuests(), b.getTotalInr(), b.getStatus(),
                b.getExpiresAt(), b.getCreatedAt()
        );
    }
}
