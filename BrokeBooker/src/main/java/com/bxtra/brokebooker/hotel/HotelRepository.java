package com.bxtra.brokebooker.hotel;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;


public interface HotelRepository extends JpaRepository<Hotel, String> {

    @Query("""
        SELECT h FROM Hotel h
        WHERE LOWER(h.city) = LOWER(:city)
        ORDER BY h.userRating DESC NULLS LAST, h.priceInr ASC NULLS LAST
    """)
    Page<Hotel> searchByCity(@Param("city") String city, Pageable pageable);

    /**
     * Unified search: matches city exactly (highest rank), or hotel name / city /
     * locality via trigram ILIKE (GIN-indexed). Ranking blends match-type priority
     * with pg_trgm similarity so closer matches float up.
     *
     * :q      = raw query, e.g. "taj"
     * :like   = '%taj%'     (substring)
     * :prefix = 'taj%'      (name-starts-with bonus)
     */
    @Query(value = """
        SELECT h.*
        FROM "Hotel" h
        WHERE LOWER(h.city) = LOWER(:q)
           OR h.name     ILIKE :like
           OR h.city     ILIKE :like
           OR h.locality ILIKE :like
           OR h.name     % :q
           OR h.city     % :q
           OR h.locality % :q
        ORDER BY
            CASE
                WHEN LOWER(h.city) = LOWER(:q) THEN 0
                WHEN h.name ILIKE :prefix      THEN 1
                WHEN h.name ILIKE :like        THEN 2
                ELSE 3
            END,
            GREATEST(
                similarity(LOWER(h.name),                     LOWER(:q)),
                similarity(LOWER(COALESCE(h.city,     '')),   LOWER(:q)),
                similarity(LOWER(COALESCE(h.locality, '')),   LOWER(:q))
            ) DESC,
            h."userRating" DESC NULLS LAST,
            h."priceInr"   ASC  NULLS LAST
        """,
            countQuery = """
        SELECT COUNT(*)
        FROM "Hotel" h
        WHERE LOWER(h.city) = LOWER(:q)
           OR h.name     ILIKE :like
           OR h.city     ILIKE :like
           OR h.locality ILIKE :like
           OR h.name     % :q
           OR h.city     % :q
           OR h.locality % :q
        """,
            nativeQuery = true)
    Page<Hotel> searchByQuery(@Param("q") String q,
                              @Param("like") String like,
                              @Param("prefix") String prefix,
                              Pageable pageable);

    /**
     * Given a list of hotel IDs and a date range, returns the IDs whose EVERY room
     * has at least one overlapping confirmed/pending booking — i.e. the hotel is
     * fully sold out for those dates.
     */
    @Query(value = """
        SELECT h.id
        FROM "Hotel" h
        WHERE h.id IN :hotelIds
          AND EXISTS (SELECT 1 FROM rooms r WHERE r.hotel_id = h.id)
          AND NOT EXISTS (
              SELECT 1 FROM rooms r
              WHERE r.hotel_id = h.id
                AND NOT EXISTS (
                    SELECT 1 FROM bookings b
                    WHERE b.room_id = r.id
                      AND b.status IN ('PENDING','CONFIRMED')
                      AND daterange(b.check_in, b.check_out, '[)')
                          && daterange(CAST(:checkIn AS date), CAST(:checkOut AS date), '[)')
                )
          )
        """, nativeQuery = true)
    List<String> findSoldOutHotelIds(@Param("hotelIds") List<String> hotelIds,
                                     @Param("checkIn") LocalDate checkIn,
                                     @Param("checkOut") LocalDate checkOut);


    // Native PostGIS query: hotels within radiusM metres of point, ordered by distance.
    @Query(value = """
        SELECT h.*,
               ST_Distance(h.location,
                           ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography) AS distance_m
        FROM "Hotel" h
        WHERE h.location IS NOT NULL
          AND ST_DWithin(h.location,
                         ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography,
                         :radiusM)
        ORDER BY distance_m ASC
        LIMIT :maxResults
    """, nativeQuery = true)
    List<Object[]> findNearby(@Param("lat") double lat,
                              @Param("lng") double lng,
                              @Param("radiusM") double radiusM,
                              @Param("maxResults") int maxResults);
}
