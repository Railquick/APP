-- ==============================================================================
-- Migration: 001_add_day_offset_to_train_stops.sql
-- Description: Adds day_offset column to the train_stops table for tracking multi-day journeys.
-- Apply in: Supabase SQL Editor or Supabase CLI migration
-- ==============================================================================

-- 1. Add day_offset column if it doesn't already exist
ALTER TABLE train_stops 
ADD COLUMN IF NOT EXISTS day_offset INTEGER DEFAULT 0;

-- 2. Add documentation comment on the column
COMMENT ON COLUMN train_stops.day_offset IS 'Day offset relative to train origin departure date (0 for Day 1, 1 for Day 2, etc.)';

-- 3. Optional Index for filtering by train and day offset
CREATE INDEX IF NOT EXISTS idx_train_stops_train_day 
ON train_stops (train_no, day_offset);
