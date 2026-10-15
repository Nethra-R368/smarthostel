from sqlalchemy import text

SQL_STATEMENTS = [
    # 1. available_rooms view
    """
    CREATE OR REPLACE VIEW available_rooms AS
    SELECT r.room_id, r.room_number, r.floor, r.room_type, r.capacity, r.occupied_count, r.status, h.hostel_name
    FROM room r
    JOIN hostel h ON r.hostel_id = h.hostel_id
    WHERE r.status = 'AVAILABLE' AND r.occupied_count < r.capacity;
    """,

    # 2. hostel_occupancy view
    """
    CREATE OR REPLACE VIEW hostel_occupancy AS
    SELECT h.hostel_id, h.hostel_name, h.hostel_type,
           COALESCE(SUM(r.capacity), 0) AS total_capacity,
           COALESCE(SUM(r.occupied_count), 0) AS occupied_beds,
           COALESCE(SUM(r.capacity), 0) - COALESCE(SUM(r.occupied_count), 0) AS available_beds,
           CASE 
               WHEN COALESCE(SUM(r.capacity), 0) = 0 THEN 0.0
               ELSE ROUND((COALESCE(SUM(r.occupied_count), 0)::NUMERIC / COALESCE(SUM(r.capacity), 0)::NUMERIC) * 100, 2)
           END AS occupancy_percentage
    FROM hostel h
    LEFT JOIN room r ON h.hostel_id = r.hostel_id
    GROUP BY h.hostel_id, h.hostel_name, h.hostel_type;
    """,

    # 3. pending_fees view
    """
    CREATE OR REPLACE VIEW pending_fees AS
    SELECT s.student_id, s.roll_no, s.name, s.email, s.phone,
           sf.fee_id, sf.amount_due, sf.amount_paid,
           (sf.amount_due - sf.amount_paid) AS balance_due,
           sf.due_date, sf.status AS fee_status
    FROM student s
    JOIN student_fee sf ON s.student_id = sf.student_id
    WHERE (sf.amount_due - sf.amount_paid) > 0;
    """,

    # 4. complaint_summary view
    """
    CREATE OR REPLACE VIEW complaint_summary AS
    SELECT category, status, priority, COUNT(*) AS complaint_count
    FROM complaint
    GROUP BY category, status, priority;
    """,

    # 5. Room occupancy trigger function
    """
    CREATE OR REPLACE FUNCTION func_update_room_occupancy()
    RETURNS TRIGGER AS $$
    BEGIN
        IF (TG_OP = 'INSERT' AND NEW.status = 'ACTIVE') THEN
            UPDATE room SET occupied_count = occupied_count + 1 WHERE room_id = NEW.room_id;
        END IF;
        IF (TG_OP = 'UPDATE') THEN
            IF (OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE') THEN
                UPDATE room SET occupied_count = GREATEST(0, occupied_count - 1) WHERE room_id = OLD.room_id;
            ELSIF (OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE') THEN
                UPDATE room SET occupied_count = occupied_count + 1 WHERE room_id = NEW.room_id;
            ELSIF (OLD.room_id != NEW.room_id AND NEW.status = 'ACTIVE') THEN
                UPDATE room SET occupied_count = GREATEST(0, occupied_count - 1) WHERE room_id = OLD.room_id;
                UPDATE room SET occupied_count = occupied_count + 1 WHERE room_id = NEW.room_id;
            END IF;
        END IF;
        IF (TG_OP = 'DELETE' AND OLD.status = 'ACTIVE') THEN
            UPDATE room SET occupied_count = GREATEST(0, occupied_count - 1) WHERE room_id = OLD.room_id;
        END IF;
        UPDATE room 
        SET status = CASE WHEN occupied_count >= capacity THEN 'FULL' ELSE 'AVAILABLE' END
        WHERE room_id IN (COALESCE(NEW.room_id, OLD.room_id), COALESCE(OLD.room_id, NEW.room_id));
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,

    # 6. Room occupancy trigger
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_room_occupancy') THEN
            CREATE TRIGGER trg_update_room_occupancy
            AFTER INSERT OR UPDATE OR DELETE ON room_allocation
            FOR EACH ROW EXECUTE FUNCTION func_update_room_occupancy();
        END IF;
    END $$;
    """,

    # 7. Payment status trigger function
    """
    CREATE OR REPLACE FUNCTION func_update_payment_status()
    RETURNS TRIGGER AS $$
    DECLARE
        v_total_paid NUMERIC(10,2);
        v_due NUMERIC(10,2);
    BEGIN
        SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
        FROM payment WHERE fee_id = NEW.fee_id AND status = 'SUCCESS';

        SELECT amount_due INTO v_due
        FROM student_fee WHERE fee_id = NEW.fee_id;

        UPDATE student_fee
        SET amount_paid = v_total_paid,
            status = CASE
                WHEN v_total_paid >= v_due THEN 'PAID'
                WHEN v_total_paid > 0 THEN 'PARTIAL'
                ELSE 'PENDING'
            END
        WHERE fee_id = NEW.fee_id;

        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,

    # 8. Payment status trigger
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_payment_status') THEN
            CREATE TRIGGER trg_update_payment_status
            AFTER INSERT OR UPDATE ON payment
            FOR EACH ROW EXECUTE FUNCTION func_update_payment_status();
        END IF;
    END $$;
    """,

    # 9. Complaint resolution trigger function
    """
    CREATE OR REPLACE FUNCTION func_complaint_resolution()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
            NEW.resolved_at := CURRENT_TIMESTAMP;
        ELSIF NEW.status != 'RESOLVED' THEN
            NEW.resolved_at := NULL;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    """,

    # 10. Complaint resolution trigger
    """
    DO $$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_complaint_resolution') THEN
            CREATE TRIGGER trg_complaint_resolution
            BEFORE UPDATE ON complaint
            FOR EACH ROW EXECUTE FUNCTION func_complaint_resolution();
        END IF;
    END $$;
    """
]

def init_views_and_triggers(engine):
    """Executes database view and trigger DDL statements safely."""
    with engine.begin() as conn:
        for stmt in SQL_STATEMENTS:
            try:
                conn.execute(text(stmt))
            except Exception as e:
                print(f"Notice executing SQL view/trigger statement: {e}")
