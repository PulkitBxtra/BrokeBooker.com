package com.bxtra.brokebooker.hotel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {

    List<Room> findByHotelId(String hotelId);

    /**
     * Returns the IDs of rooms in the given hotel that have NO overlapping CONFIRMED booking
     * for the given date range. Uses the EXCLUDE-constraint-friendly daterange overlap check.
     */
    @Query(value = """
        SELECT r.id::text
        FROM rooms r
        WHERE r.hotel_id = :hotelId
          AND NOT EXISTS (
              SELECT 1 FROM bookings b
              WHERE b.room_id = r.id
                AND b.status = 'CONFIRMED'
                AND daterange(b.check_in, b.check_out, '[)')
                    && daterange(CAST(:checkIn AS date), CAST(:checkOut AS date), '[)')
          )
    """, nativeQuery = true)
    List<String> findAvailableRoomIdsRaw(@Param("hotelId") String hotelId,
                                         @Param("checkIn") LocalDate checkIn,
                                         @Param("checkOut") LocalDate checkOut);
}
