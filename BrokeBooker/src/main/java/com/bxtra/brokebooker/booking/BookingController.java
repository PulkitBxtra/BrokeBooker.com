package com.bxtra.brokebooker.booking;

import com.bxtra.brokebooker.auth.User;
import com.bxtra.brokebooker.booking.dto.BookingDto;
import com.bxtra.brokebooker.booking.dto.CreateBookingRequest;
import com.bxtra.brokebooker.exception.UnauthorizedException;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /** Place a 60-second hold on the room/dates. Returns a PENDING booking. */
    @PostMapping("/hold")
    public ResponseEntity<BookingDto> hold(Authentication auth,
                                           @Valid @RequestBody CreateBookingRequest req) {
        User user = currentUser(auth);
        return ResponseEntity.ok(bookingService.hold(user, req));
    }

    /** Confirm (pay) a PENDING hold within its TTL. */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<BookingDto> confirm(Authentication auth, @PathVariable UUID id) {
        return ResponseEntity.ok(bookingService.confirm(currentUser(auth).getId(), id));
    }

    /** Cancel a hold (or drop a booking — demo only). */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(Authentication auth, @PathVariable UUID id) {
        bookingService.cancel(currentUser(auth).getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public List<BookingDto> myBookings(Authentication auth) {
        return bookingService.listForUser(currentUser(auth).getId());
    }

    @GetMapping("/{id}")
    public BookingDto get(Authentication auth, @PathVariable UUID id) {
        return bookingService.getForUser(currentUser(auth).getId(), id);
    }

    private User currentUser(Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof User u)) {
            throw new UnauthorizedException("Not authenticated");
        }
        return u;
    }
}
