package com.bxtra.brokebooker.hotel;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.List;

@Entity
@Immutable
@Table(name = "\"Hotel\"")
@Getter
@Setter
@NoArgsConstructor
public class Hotel {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "\"searchId\"")
    private String searchId;

    @Column(name = "\"mmtHotelId\"")
    private String mmtHotelId;

    @Column(name = "name")
    private String name;

    @Column(name = "\"starRating\"")
    private Double starRating;

    @Column(name = "\"userRating\"")
    private Double userRating;

    @Column(name = "\"userRatingCount\"")
    private Integer userRatingCount;

    @Column(name = "\"priceInr\"")
    private Integer priceInr;

    @Column(name = "\"originalPriceInr\"")
    private Integer originalPriceInr;

    @Column(name = "\"discountPct\"")
    private Integer discountPct;

    @Column(name = "address")
    private String address;

    @Column(name = "locality")
    private String locality;

    @Column(name = "city")
    private String city;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "amenities", columnDefinition = "jsonb")
    private List<String> amenities;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "\"imageUrls\"", columnDefinition = "jsonb")
    private List<String> imageUrls;

    @Column(name = "\"thumbnailUrl\"")
    private String thumbnailUrl;

    @Column(name = "\"detailUrl\"")
    private String detailUrl;

    @Column(name = "\"scrapedAt\"")
    private Instant scrapedAt;
}
