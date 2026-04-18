-- Rooms belong to existing scraper-owned Hotel rows.
-- Hotel.id is text/uuid in the scraper schema; we use TEXT here to match exactly.

CREATE TABLE IF NOT EXISTS rooms (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    TEXT NOT NULL REFERENCES "Hotel"(id) ON DELETE CASCADE,
    room_type   TEXT NOT NULL,
    capacity    INT NOT NULL DEFAULT 2,
    price_inr   INT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms (hotel_id);

-- Seed 3 room types per existing Hotel using priceInr as the base Standard rate.
-- Deluxe = 1.4x, Suite = 2.0x. Hotels without a price get a 3000 INR default.
INSERT INTO rooms (hotel_id, room_type, capacity, price_inr)
SELECT h.id, 'Standard', 2, COALESCE(h."priceInr", 3000)
FROM "Hotel" h
WHERE NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Standard'
);

INSERT INTO rooms (hotel_id, room_type, capacity, price_inr)
SELECT h.id, 'Deluxe', 3, ROUND(COALESCE(h."priceInr", 3000) * 1.4)::INT
FROM "Hotel" h
WHERE NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Deluxe'
);

INSERT INTO rooms (hotel_id, room_type, capacity, price_inr)
SELECT h.id, 'Suite', 4, ROUND(COALESCE(h."priceInr", 3000) * 2.0)::INT
FROM "Hotel" h
WHERE NOT EXISTS (
    SELECT 1 FROM rooms r WHERE r.hotel_id = h.id AND r.room_type = 'Suite'
);
