-- PostGIS for geography(Point, 4326) + ST_DWithin queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- btree_gist allows mixing equality (uuid =) with range (daterange &&)
-- in a single EXCLUDE constraint, used by the bookings table.
CREATE EXTENSION IF NOT EXISTS btree_gist;
