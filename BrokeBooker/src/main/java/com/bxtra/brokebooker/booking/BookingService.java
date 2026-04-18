package com.bxtra.brokebooker.booking;

import com.bxtra.brokebooker.auth.User;
import com.bxtra.brokebooker.booking.dto.BookingDto;
import com.bxtra.brokebooker.booking.dto.CreateBookingRequest;
import com.bxtra.brokebooker.exception.BadRequestException;
import com.bxtra.brokebooker.exception.ConflictException;
import com.bxtra.brokebooker.exception.NotFoundException;
import com.bxtra.brokebooker.hotel.Hotel;
import com.bxtra.brokebooker.hotel.HotelRepository;
import com.bxtra.brokebooker.hotel.Room;
import com.bxtra.brokebooker.hotel.RoomRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class BookingService {

    /** Minutes the user has to complete payment once a hold is placed. */
    private static final long HOLD_TTL_SECONDS = 60L;

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;

    public BookingService(BookingRepository bookingRepository,
                          RoomRepository roomRepository,
                          HotelRepository hotelRepository) {
        this.bookingRepository = bookingRepository;
        this.roomRepository = roomRepository;
        this.hotelRepository = hotelRepository;
    }

    /**
     * Place a 60-second PENDING hold on the room. The EXCLUDE constraint in
     * Postgres guarantees no other user (or parallel request) can hold or book
     * the same room for overlapping dates.
     */
    @Transactional
    public BookingDto hold(User user, CreateBookingRequest req) {
        validate(req);
        Room room = roomRepository.findById(req.roomId())
                .orElseThrow(() -> new NotFoundException("Room not found"));
        if (req.guests() > room.getCapacity()) {
            throw new BadRequestException(
                    "Guest count %d exceeds room capacity %d"
                            .formatted(req.guests(), room.getCapacity()));
        }

        // Free up any stale PENDING rows first — without this, a PENDING row
        // whose expires_at has passed will still trip the EXCLUDE constraint.
        bookingRepository.deleteExpiredPendingHolds();

        int nights = (int) ChronoUnit.DAYS.between(req.checkIn(), req.checkOut());
        int totalInr = room.getPriceInr() * nights;

        Booking booking = Booking.builder()
                .roomId(room.getId())
                .userId(user.getId())
                .checkIn(req.checkIn())
                .checkOut(req.checkOut())
                .guests(req.guests())
                .totalInr(totalInr)
                .status("PENDING")
                .expiresAt(Instant.now().plusSeconds(HOLD_TTL_SECONDS))
                .build();

        try {
            booking = bookingRepository.saveAndFlush(booking);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException(
                    "This room is currently being booked by someone else. Please try again in a moment.");
        }

        return hydrate(booking);
    }

    /**
     * Confirm a PENDING hold before it expires. Moves status to CONFIRMED and
     * clears the expiry so the booking is permanent.
     */
    @Transactional
    public BookingDto confirm(UUID userId, UUID bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));

        if (!b.getUserId().equals(userId)) {
            throw new NotFoundException("Booking not found");
        }
        if ("CONFIRMED".equals(b.getStatus())) {
            return hydrate(b); // idempotent re-confirm
        }
        if (!"PENDING".equals(b.getStatus())) {
            throw new ConflictException("Booking is no longer pending");
        }
        if (b.getExpiresAt() != null && b.getExpiresAt().isBefore(Instant.now())) {
            // Clean up the expired hold so the room frees up.
            bookingRepository.delete(b);
            throw new ConflictException(
                    "Your hold has expired. Please start the booking again.");
        }

        b.setStatus("CONFIRMED");
        b.setExpiresAt(null);
        b = bookingRepository.saveAndFlush(b);
        return hydrate(b);
    }

    /** User cancels their own PENDING hold (or cancels a confirmed booking — demo only). */
    @Transactional
    public void cancel(UUID userId, UUID bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (!b.getUserId().equals(userId)) {
            throw new NotFoundException("Booking not found");
        }
        bookingRepository.delete(b);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> listForUser(UUID userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::hydrate).toList();
    }

    @Transactional(readOnly = true)
    public BookingDto getForUser(UUID userId, UUID bookingId) {
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found"));
        if (!b.getUserId().equals(userId)) {
            throw new NotFoundException("Booking not found");
        }
        return hydrate(b);
    }

    private void validate(CreateBookingRequest req) {
        if (!req.checkOut().isAfter(req.checkIn())) {
            throw new BadRequestException("checkOut must be after checkIn");
        }
        if (req.checkIn().isBefore(LocalDate.now())) {
            throw new BadRequestException("checkIn cannot be in the past");
        }
    }

    private BookingDto hydrate(Booking b) {
        Room room = roomRepository.findById(b.getRoomId())
                .orElseThrow(() -> new NotFoundException("Room not found"));
        Hotel hotel = hotelRepository.findById(room.getHotelId())
                .orElseThrow(() -> new NotFoundException("Hotel not found"));
        return BookingDto.from(b, hotel.getId(), hotel.getName(),
                hotel.getThumbnailUrl(), room.getRoomType());
    }
}
