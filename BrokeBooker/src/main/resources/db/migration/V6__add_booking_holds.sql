-- Introduce PENDING holds: a temporary reservation that blocks other bookings
-- for up to 60 seconds while the user completes payment.
--
-- The EXCLUDE constraint is widened to include both PENDING and CONFIRMED rows
-- so Postgres itself prevents a second hold/booking from landing on the same
-- room/date-range. Expired PENDING rows are cleaned up lazily by the app
-- before each new hold attempt.

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS bookings_no_overlap;

ALTER TABLE bookings
    ADD CONSTRAINT bookings_no_overlap EXCLUDE USING gist (
        room_id WITH =,
        daterange(check_in, check_out, '[)') WITH &&
    ) WHERE (status IN ('PENDING', 'CONFIRMED'));

CREATE INDEX IF NOT EXISTS idx_bookings_pending_expiry
    ON bookings (expires_at)
    WHERE status = 'PENDING';
