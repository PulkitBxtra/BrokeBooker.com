-- Bookings with DB-enforced concurrency:
-- EXCLUDE USING gist prevents overlapping CONFIRMED bookings for the same room.
-- This is the core primitive behind "only one user can book a room for a date range".

CREATE TABLE IF NOT EXISTS bookings (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id     UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in    DATE NOT NULL,
    check_out   DATE NOT NULL,
    guests      INT NOT NULL DEFAULT 1,
    total_inr   INT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'CONFIRMED',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT bookings_dates_valid CHECK (check_out > check_in),

    CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status = 'CONFIRMED')
);

CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings (room_id);
