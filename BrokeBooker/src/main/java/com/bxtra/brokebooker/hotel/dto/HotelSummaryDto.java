package com.bxtra.brokebooker.hotel.dto;

import com.bxtra.brokebooker.hotel.Hotel;

import java.util.List;

public record HotelSummaryDto(
        String id,
        String name,
        Double starRating,
        Double userRating,
        Integer userRatingCount,
        Integer priceInr,
        Integer originalPriceInr,
        Integer discountPct,
        String locality,
        String city,
        Double latitude,
        Double longitude,
        String thumbnailUrl,
        List<String> imageUrls,
        List<String> amenities,
        Double distanceKm,
        Boolean soldOut
) {
    public static HotelSummaryDto from(Hotel h) {
        return from(h, null, null);
    }

    public static HotelSummaryDto from(Hotel h, Double distanceKm) {
        return from(h, distanceKm, null);
    }

    public static HotelSummaryDto from(Hotel h, Double distanceKm, Boolean soldOut) {
        return new HotelSummaryDto(
                h.getId(),
                h.getName(),
                h.getStarRating(),
                h.getUserRating(),
                h.getUserRatingCount(),
                h.getPriceInr(),
                h.getOriginalPriceInr(),
                h.getDiscountPct(),
                h.getLocality(),
                h.getCity(),
                h.getLatitude(),
                h.getLongitude(),
                h.getThumbnailUrl(),
                h.getImageUrls(),
                h.getAmenities(),
                distanceKm,
                soldOut
        );
    }

    public HotelSummaryDto withSoldOut(Boolean soldOut) {
        return new HotelSummaryDto(id, name, starRating, userRating, userRatingCount,
                priceInr, originalPriceInr, discountPct, locality, city,
                latitude, longitude, thumbnailUrl, imageUrls, amenities,
                distanceKm, soldOut);
    }
}
