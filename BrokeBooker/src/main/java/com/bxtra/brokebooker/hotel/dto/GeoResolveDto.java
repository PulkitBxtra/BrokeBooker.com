package com.bxtra.brokebooker.hotel.dto;

public record GeoResolveDto(
        double lat,
        double lng,
        String formatted,
        String type
) {}
