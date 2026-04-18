package com.bxtra.brokebooker.hotel;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Room {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "hotel_id", nullable = false)
    private String hotelId;

    @Column(name = "room_type", nullable = false)
    private String roomType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "price_inr", nullable = false)
    private Integer priceInr;

    @Column(name = "created_at", updatable = false, insertable = false)
    private Instant createdAt;
}
