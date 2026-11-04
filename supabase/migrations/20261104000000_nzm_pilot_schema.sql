-- =============================================================================
-- RailQuick: Hazrat Nizamuddin (NZM) Pilot Phase Migration
-- Schema upgrades for orders, passenger details, vendors, and delivery partners
-- =============================================================================

-- 1. Upgrade public.orders table with passenger, PNR, payment, and hub tracking columns
ALTER TABLE IF EXISTS public.orders
  ADD COLUMN IF NOT EXISTS passenger_name      TEXT NOT NULL DEFAULT 'Passenger',
  ADD COLUMN IF NOT EXISTS passenger_phone     TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS pnr                 TEXT,
  ADD COLUMN IF NOT EXISTS journey_date        DATE,
  ADD COLUMN IF NOT EXISTS platform_number     TEXT,
  ADD COLUMN IF NOT EXISTS expected_arrival    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_method      TEXT NOT NULL DEFAULT 'PAY_ON_DELIVERY',
  ADD COLUMN IF NOT EXISTS vendor_id           UUID,
  ADD COLUMN IF NOT EXISTS vendor_status       TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS runner_id           UUID,
  ADD COLUMN IF NOT EXISTS runner_status       TEXT NOT NULL DEFAULT 'UNASSIGNED',
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Index for NZM active order queries (runner dispatch & capacity checks)
CREATE INDEX IF NOT EXISTS orders_station_delivery_status_idx
  ON public.orders (station_code, delivery_status, created_at DESC);

-- 2. Create Vendors table for Station Hubs
CREATE TABLE IF NOT EXISTS public.vendors (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code  TEXT NOT NULL,
  name          TEXT NOT NULL,
  contact_person TEXT,
  phone         TEXT NOT NULL,
  location_note TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create Delivery Partners (Runners) table
CREATE TABLE IF NOT EXISTS public.delivery_partners (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_code     TEXT NOT NULL,
  full_name        TEXT NOT NULL,
  phone            TEXT NOT NULL,
  badge_no         TEXT,
  current_platform TEXT,
  status           TEXT NOT NULL DEFAULT 'IDLE'
                   CHECK (status IN ('IDLE', 'ASSIGNED', 'EN_ROUTE', 'OFFLINE')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed NZM Station Hub Vendor record if not present
INSERT INTO public.vendors (station_code, name, contact_person, phone, location_note, is_active)
SELECT 'NZM', 'RailQuick NZM Central Hub', 'Hub Supervisor', '9876543210', 'Platform 1 Main Concourse', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.vendors WHERE station_code = 'NZM'
);
