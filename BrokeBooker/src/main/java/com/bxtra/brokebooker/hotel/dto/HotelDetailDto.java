package com.bxtra.brokebooker.hotel.dto;

import com.bxtra.brokebooker.hotel.Hotel;

import java.util.List;

public record HotelDetailDto(
        String id,
        String name,
        String description,
        Double starRating,
        Double userRating,
        Integer userRatingCount,
        Integer priceInr,
        Integer originalPriceInr,
        Integer discountPct,
        String address,
        String locality,
        String city,
        Double latitude,
        Double longitude,
        List<String> imageUrls,
        List<String> amenities,
        String thumbnailUrl,
        List<RoomDto> rooms
) {
    public static HotelDetailDto from(Hotel h, List<RoomDto> rooms) {
        return new HotelDetailDto(
                h.getId(), h.getName(), h.getDescription(),
                h.getStarRating(), h.getUserRating(), h.getUserRatingCount(),
                h.getPriceInr(), h.getOriginalPriceInr(), h.getDiscountPct(),
                h.getAddress(), h.getLocality(), h.getCity(),
                h.getLatitude(), h.getLongitude(),
                h.getImageUrls(), h.getAmenities(), h.getThumbnailUrl(),
                rooms
        );
    }
}
