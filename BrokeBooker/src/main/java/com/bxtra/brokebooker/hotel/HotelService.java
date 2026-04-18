package com.bxtra.brokebooker.hotel;

import com.bxtra.brokebooker.exception.NotFoundException;
import com.bxtra.brokebooker.hotel.dto.HotelDetailDto;
import com.bxtra.brokebooker.hotel.dto.HotelSummaryDto;
import com.bxtra.brokebooker.hotel.dto.RoomDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    public HotelService(HotelRepository hotelRepository, RoomRepository roomRepository) {
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
    }

    public Page<HotelSummaryDto> searchByCity(String city, int page, int size) {
        return hotelRepository
                .searchByCity(city, PageRequest.of(page, size))
                .map(HotelSummaryDto::from);
    }

    public Page<HotelSummaryDto> search(String q, int page, int size) {
        if (q == null || q.isBlank()) {
            return Page.empty(PageRequest.of(page, size));
        }
        String query = q.trim();
        String like = "%" + query + "%";
        String prefix = query + "%";
        return hotelRepository
                .searchByQuery(query, like, prefix, PageRequest.of(page, size))
                .map(HotelSummaryDto::from);
    }

    public List<HotelSummaryDto> suggest(String query, int limit) {
        String q = query == null ? "" : query.trim();
        if (q.length() < 2) return List.of();
        int capped = Math.min(Math.max(limit, 1), 20);
        // Reuse the exact same ranked query as /search so the dropdown's top N
        // is guaranteed to equal the first page of full results.
        return search(q, 0, capped).getContent();
    }

    public HotelDetailDto getDetail(String hotelId, LocalDate checkIn, LocalDate checkOut) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new NotFoundException("Hotel not found: " + hotelId));

        List<Room> rooms = roomRepository.findByHotelId(hotelId);

        Set<String> availableIds;
        if (checkIn != null && checkOut != null && checkOut.isAfter(checkIn)) {
            availableIds = new HashSet<>(
                    roomRepository.findAvailableRoomIdsRaw(hotelId, checkIn, checkOut));
        } else {
            availableIds = null; // availability unknown when no dates supplied
        }

        List<RoomDto> roomDtos = rooms.stream()
                .map(r -> RoomDto.from(r,
                        availableIds == null || availableIds.contains(r.getId().toString())))
                .toList();

        return HotelDetailDto.from(hotel, roomDtos);
    }
}
