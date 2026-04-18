-- pg_trgm enables fast fuzzy substring search on Hotel.name / city / locality.
-- The GIN indexes with gin_trgm_ops let ILIKE '%…%' hit an index (no seq scan).

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_hotel_name_trgm
    ON "Hotel" USING gin (name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hotel_city_trgm
    ON "Hotel" USING gin (city gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_hotel_locality_trgm
    ON "Hotel" USING gin (locality gin_trgm_ops);
