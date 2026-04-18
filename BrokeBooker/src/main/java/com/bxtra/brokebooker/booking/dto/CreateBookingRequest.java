package com.bxtra.brokebooker.booking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

public record CreateBookingRequest(
        @NotNull UUID roomId,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,
        @Min(1) int guests
) {}
