package com.bxtra.brokebooker.hotel;

import com.bxtra.brokebooker.exception.NotFoundException;
import com.bxtra.brokebooker.hotel.dto.GeoResolveDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;

/**
 * Forward-geocodes free-form text via geocode.maps.co (OSM / Nominatim compatible).
 * Response shape: [{ lat: "51.5", lon: "-0.1", display_name: "...", type: "city" }, ...]
 */
@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);

    private final RestClient client;
    private final String apiKey;
    private final String baseUrl;

    public GeocodingService(
            @Value("${app.geocoding.api-key}") String apiKey,
            @Value("${app.geocoding.base-url}") String baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.client = RestClient.builder().build();
    }

    public GeoResolveDto resolve(String query) {
        String url = UriComponentsBuilder.fromUriString(baseUrl)
                .queryParam("q", query)
                .queryParam("api_key", apiKey)
                .queryParam("limit", 1)
                .build()
                .toUriString();

        List<Map<String, Object>> results;
        try {
            results = client.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
        } catch (Exception ex) {
            log.warn("Geocoding call failed for query='{}': {}", query, ex.getMessage());
            throw new NotFoundException("Could not resolve location for: " + query);
        }

        if (results == null || results.isEmpty()) {
            throw new NotFoundException("No location found for: " + query);
        }

        Map<String, Object> first = results.get(0);
        double lat = parseCoord(first.get("lat"), "lat");
        double lng = parseCoord(first.get("lon"), "lon");
        String formatted = (String) first.get("display_name");
        String type = (String) first.get("type");

        return new GeoResolveDto(lat, lng, formatted, type);
    }

    private static double parseCoord(Object raw, String field) {
        if (raw == null) {
            throw new NotFoundException("Geocoding result missing " + field);
        }
        if (raw instanceof Number n) return n.doubleValue();
        return Double.parseDouble(raw.toString());
    }
}
