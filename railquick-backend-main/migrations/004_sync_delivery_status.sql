-- Migration: 004_sync_delivery_status.sql
-- Description: Synchronize delivery_assignments status to railquick_train_requests and orders.
-- Automatically updates matching order status and timestamps when a vendor or delivery agent updates an assignment.

-- 1. Ensure all journey and PNR interoperability columns exist in railquick_train_requests
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS pnr TEXT;
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS coach TEXT;
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS seat TEXT;
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS station_code TEXT;
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS arrival_time TEXT;
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE railquick_train_requests ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;

-- 2. Create the status synchronization trigger function
CREATE OR REPLACE FUNCTION sync_delivery_status_to_train_requests()
RETURNS TRIGGER AS $$
DECLARE
    v_mapped_status TEXT;
    v_order_status TEXT;
    v_runner_status TEXT;
    v_now TIMESTAMPTZ := NOW();
BEGIN
    -- Normalize and map delivery_assignments.delivery_status to matching status values
    CASE LOWER(TRIM(COALESCE(NEW.delivery_status, '')))
        WHEN 'assigned' THEN
            v_mapped_status := 'assigned';
            v_order_status := 'CONFIRMED';
            v_runner_status := 'ASSIGNED';
        WHEN 'accepted' THEN
            v_mapped_status := 'accepted';
            v_order_status := 'CONFIRMED';
            v_runner_status := 'ASSIGNED';
        WHEN 'picked_up' THEN
            v_mapped_status := 'out_for_delivery';
            v_order_status := 'OUT_FOR_DELIVERY';
            v_runner_status := 'ON_WAY';
        WHEN 'out_for_delivery' THEN
            v_mapped_status := 'out_for_delivery';
            v_order_status := 'OUT_FOR_DELIVERY';
            v_runner_status := 'ON_WAY';
        WHEN 'sprinting' THEN
            v_mapped_status := 'out_for_delivery';
            v_order_status := 'OUT_FOR_DELIVERY';
            v_runner_status := 'ON_WAY';
        WHEN 'delivered' THEN
            v_mapped_status := 'delivered';
            v_order_status := 'DELIVERED';
            v_runner_status := 'DELIVERED';
        WHEN 'completed' THEN
            v_mapped_status := 'delivered';
            v_order_status := 'DELIVERED';
            v_runner_status := 'DELIVERED';
        WHEN 'cancelled' THEN
            v_mapped_status := 'cancelled';
            v_order_status := 'CANCELLED';
            v_runner_status := 'CANCELLED';
        ELSE
            v_mapped_status := LOWER(TRIM(NEW.delivery_status));
            v_order_status := UPPER(TRIM(NEW.delivery_status));
            v_runner_status := UPPER(TRIM(NEW.delivery_status));
    END CASE;

    -- Update railquick_train_requests row matching request_id
    UPDATE railquick_train_requests
    SET 
        status = v_mapped_status,
        updated_at = COALESCE(NEW.updated_at, v_now),
        delivered_at = CASE 
            WHEN LOWER(TRIM(NEW.delivery_status)) IN ('delivered', 'completed') 
                THEN COALESCE(NEW.delivered_at, v_now) 
            ELSE delivered_at 
        END,
        arrival_last_updated_at = v_now
    WHERE id = NEW.request_id;

    -- Also synchronize orders table row matching request_id (1:1 with order ID)
    UPDATE orders
    SET 
        delivery_status = v_order_status,
        runner_status = v_runner_status,
        runner_id = COALESCE(NEW.agent_id, runner_id),
        rider_id = COALESCE(NEW.agent_id, rider_id)
    WHERE id = NEW.request_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger on delivery_assignments
DROP TRIGGER IF EXISTS trg_sync_delivery_status ON delivery_assignments;

CREATE TRIGGER trg_sync_delivery_status
AFTER INSERT OR UPDATE OF delivery_status, accepted_at, picked_up_at, delivered_at, updated_at
ON delivery_assignments
FOR EACH ROW
EXECUTE FUNCTION sync_delivery_status_to_train_requests();
