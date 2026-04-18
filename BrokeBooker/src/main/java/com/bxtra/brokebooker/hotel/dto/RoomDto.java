package com.bxtra.brokebooker.hotel.dto;

import com.bxtra.brokebooker.hotel.Room;

import java.util.UUID;

public record RoomDto(
        UUID id,
        String hotelId,
        String roomType,
        Integer capacity,
        Integer priceInr,
        boolean available
) {
    public static RoomDto from(Room r, boolean available) {
        return new RoomDto(r.getId(), r.getHotelId(), r.getRoomType(),
                r.getCapacity(), r.getPriceInr(), available);
    }
}
