package com.bxtra.brokebooker.hotel;

import com.bxtra.brokebooker.hotel.dto.GeoResolveDto;
import com.bxtra.brokebooker.hotel.dto.HotelDetailDto;
import com.bxtra.brokebooker.hotel.dto.HotelSummaryDto;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;
    private final GeoService geoService;
    private final GeocodingService geocodingService;

    public HotelController(HotelService hotelService,
                           GeoService geoService,
                           GeocodingService geocodingService) {
        this.hotelService = hotelService;
        this.geoService = geoService;
        this.geocodingService = geocodingService;
    }

    @GetMapping("/geocode")
    public GeoResolveDto geocode(@RequestParam String q) {
        return geocodingService.resolve(q);
    }

    @GetMapping("/search")
    public Page<HotelSummaryDto> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        // `city` is kept as a backwards-compatible alias for `q`.
        String query = (q != null && !q.isBlank()) ? q : city;
        return hotelService.search(query, page, Math.min(size, 50), checkIn, checkOut);
    }

    @GetMapping("/suggest")
    public List<HotelSummaryDto> suggest(
            @RequestParam String q,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return hotelService.suggest(q, limit);
    }

    @GetMapping("/nearby")
    public List<HotelSummaryDto> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radiusKm,
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        List<HotelSummaryDto> hotels = geoService.nearby(lat, lng, radiusKm, Math.min(limit, 100));
        java.util.Set<String> soldOut = hotelService.computeSoldOut(
                hotels.stream().map(HotelSummaryDto::id).toList(), checkIn, checkOut);
        if (soldOut == null) return hotels;
        return hotels.stream()
                .map(h -> h.withSoldOut(soldOut.contains(h.id())))
                .toList();
    }

    @GetMapping("/{id}")
    public HotelDetailDto detail(
            @PathVariable String id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut
    ) {
        return hotelService.getDetail(id, checkIn, checkOut);
    }
}
