-- Add a geography(Point) column to the scraper-owned Hotel table.
-- Nullable + populated by trigger = backwards-compatible with the scraper,
-- which never references this column.

ALTER TABLE "Hotel"
    ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

-- Backfill from existing latitude / longitude.
UPDATE "Hotel"
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND location IS NULL;

-- Keep `location` in sync whenever lat/lng change or new rows are inserted.
CREATE OR REPLACE FUNCTION hotel_sync_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    ELSE
        NEW.location := NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS hotel_sync_location_trg ON "Hotel";
CREATE TRIGGER hotel_sync_location_trg
    BEFORE INSERT OR UPDATE OF latitude, longitude
    ON "Hotel"
    FOR EACH ROW
    EXECUTE FUNCTION hotel_sync_location();

-- GIST index for fast ST_DWithin / ST_Distance queries.
CREATE INDEX IF NOT EXISTS idx_hotel_location ON "Hotel" USING GIST (location);
