package com.bxtra.brokebooker.booking;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Lazy cleanup of expired PENDING holds — called before creating a new hold
     * so the EXCLUDE constraint has the freshest view of availability.
     */
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM bookings WHERE status = 'PENDING' AND expires_at < now()",
            nativeQuery = true)
    int deleteExpiredPendingHolds();
}
