package com.bxtra.brokebooker.hotel;

import com.bxtra.brokebooker.hotel.dto.HotelSummaryDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GeoService {

    @PersistenceContext
    private EntityManager em;

    /**
     * PostGIS geosearch: hotels within radiusKm of (lat, lng), sorted by distance ascending.
     * Uses ST_DWithin on the GIST-indexed geography column for speed.
     */
    @SuppressWarnings("unchecked")
    public List<HotelSummaryDto> nearby(double lat, double lng, double radiusKm, int maxResults) {
        double radiusM = radiusKm * 1000.0;

        List<Tuple> rows = em.createNativeQuery("""
                SELECT h.id                           AS id,
                       h.name                         AS name,
                       h."starRating"                 AS star_rating,
                       h."userRating"                 AS user_rating,
                       h."userRatingCount"            AS user_rating_count,
                       h."priceInr"                   AS price_inr,
                       h."originalPriceInr"           AS original_price_inr,
                       h."discountPct"                AS discount_pct,
                       h.locality                     AS locality,
                       h.city                         AS city,
                       h.latitude                     AS latitude,
                       h.longitude                    AS longitude,
                       h."thumbnailUrl"               AS thumbnail_url,
                       h."imageUrls"                  AS image_urls,
                       h.amenities                    AS amenities,
                       ST_Distance(h.location,
                                   ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS distance_m
                FROM "Hotel" h
                WHERE h.location IS NOT NULL
                  AND ST_DWithin(h.location,
                                 ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                                 :radiusM)
                ORDER BY distance_m ASC
                LIMIT :maxResults
                """, Tuple.class)
                .setParameter("lat", lat)
                .setParameter("lng", lng)
                .setParameter("radiusM", radiusM)
                .setParameter("maxResults", maxResults)
                .getResultList();

        return rows.stream().map(t -> {
            Double distanceM = t.get("distance_m") == null ? null : ((Number) t.get("distance_m")).doubleValue();
            return new HotelSummaryDto(
                    (String) t.get("id"),
                    (String) t.get("name"),
                    numToDouble(t.get("star_rating")),
                    numToDouble(t.get("user_rating")),
                    numToInt(t.get("user_rating_count")),
                    numToInt(t.get("price_inr")),
                    numToInt(t.get("original_price_inr")),
                    numToInt(t.get("discount_pct")),
                    (String) t.get("locality"),
                    (String) t.get("city"),
                    numToDouble(t.get("latitude")),
                    numToDouble(t.get("longitude")),
                    (String) t.get("thumbnail_url"),
                    castJsonList(t.get("image_urls")),
                    castJsonList(t.get("amenities")),
                    distanceM == null ? null : distanceM / 1000.0
            );
        }).toList();
    }

    private static Double numToDouble(Object o) {
        return o == null ? null : ((Number) o).doubleValue();
    }

    private static Integer numToInt(Object o) {
        return o == null ? null : ((Number) o).intValue();
    }

    @SuppressWarnings("unchecked")
    private static List<String> castJsonList(Object o) {
        if (o == null) return List.of();
        if (o instanceof List<?> l) return (List<String>) l;
        return List.of();
    }
}
