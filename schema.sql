-- ============================================================================
-- SmartHostel Database Schema
-- DBMS Project - 5th Semester
-- PostgreSQL dialect
-- ============================================================================

-- Drop tables if they exist (clean setup)
DROP VIEW IF EXISTS complaint_summary CASCADE;
DROP VIEW IF EXISTS pending_fees CASCADE;
DROP VIEW IF EXISTS hostel_occupancy CASCADE;
DROP VIEW IF EXISTS available_rooms CASCADE;

DROP TABLE IF EXISTS mess_feedback CASCADE;
DROP TABLE IF EXISTS mess_menu CASCADE;
DROP TABLE IF EXISTS inventory_transaction CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS notice CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS room_change_request CASCADE;
DROP TABLE IF EXISTS leave_request CASCADE;
DROP TABLE IF EXISTS visitor CASCADE;
DROP TABLE IF EXISTS complaint CASCADE;
DROP TABLE IF EXISTS payment CASCADE;
DROP TABLE IF EXISTS student_fee CASCADE;
DROP TABLE IF EXISTS fee_structure CASCADE;
DROP TABLE IF EXISTS room_allocation CASCADE;
DROP TABLE IF EXISTS student CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS hostel CASCADE;
DROP TABLE IF EXISTS warden CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE (Auth & RBAC)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'WARDEN', 'STUDENT', 'ACCOUNTANT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. WARDEN TABLE
CREATE TABLE warden (
    warden_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. HOSTEL TABLE
CREATE TABLE hostel (
    hostel_id SERIAL PRIMARY KEY,
    hostel_name VARCHAR(100) UNIQUE NOT NULL,
    hostel_type VARCHAR(20) CHECK (hostel_type IN ('BOYS', 'GIRLS', 'COED')),
    capacity INT NOT NULL,
    warden_id INT REFERENCES warden(warden_id) ON DELETE SET NULL
);

-- 4. ROOM TABLE
CREATE TABLE room (
    room_id SERIAL PRIMARY KEY,
    hostel_id INT REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    floor INT NOT NULL,
    room_type VARCHAR(30) NOT NULL CHECK (room_type IN ('SINGLE', 'DOUBLE', 'TRIPLE', 'COMMON')),
    capacity INT NOT NULL,
    occupied_count INT DEFAULT 0 CHECK (occupied_count >= 0 AND occupied_count <= capacity),
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'FULL', 'MAINTENANCE')),
    UNIQUE(hostel_id, room_number)
);

-- 5. STUDENT TABLE
CREATE TABLE student (
    student_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    roll_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15),
    department VARCHAR(100),
    year INT,
    gender VARCHAR(20),
    date_of_birth DATE,
    admission_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'GRADUATED', 'SUSPENDED', 'LEFT'))
);

-- 6. ROOM ALLOCATION TABLE
CREATE TABLE room_allocation (
    allocation_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    room_id INT REFERENCES room(room_id) ON DELETE CASCADE,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    vacated_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED'))
);

-- 7. FEE STRUCTURE TABLE
CREATE TABLE fee_structure (
    fee_structure_id SERIAL PRIMARY KEY,
    room_type VARCHAR(30) UNIQUE NOT NULL,
    academic_fee NUMERIC(10,2) NOT NULL,
    mess_fee NUMERIC(10,2) NOT NULL,
    caution_deposit NUMERIC(10,2) NOT NULL
);

-- 8. STUDENT FEE TABLE
CREATE TABLE student_fee (
    fee_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    fee_structure_id INT REFERENCES fee_structure(fee_structure_id) ON DELETE RESTRICT,
    amount_due NUMERIC(10,2) NOT NULL,
    amount_paid NUMERIC(10,2) DEFAULT 0.00,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIAL', 'PAID'))
);

-- 9. PAYMENT TABLE
CREATE TABLE payment (
    payment_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    fee_id INT REFERENCES student_fee(fee_id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('UPI', 'CARD', 'NET_BANKING', 'CASH')),
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED'))
);

-- 10. COMPLAINT TABLE
CREATE TABLE complaint (
    complaint_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    category VARCHAR(30) NOT NULL CHECK (category IN ('ELECTRICAL', 'PLUMBING', 'WIFI', 'CLEANING', 'FURNITURE', 'FOOD', 'SECURITY', 'OTHER')),
    description TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_to INT REFERENCES warden(warden_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED')),
    resolved_at TIMESTAMP,
    resolution TEXT
);

-- 11. VISITOR TABLE
CREATE TABLE visitor (
    visitor_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    visitor_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    visit_date DATE DEFAULT CURRENT_DATE,
    entry_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP,
    approved_by INT REFERENCES warden(warden_id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'APPROVED' CHECK (status IN ('APPROVED', 'CHECKED_OUT', 'DENIED'))
);

-- 12. LEAVE REQUEST TABLE
CREATE TABLE leave_request (
    leave_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    pass_type VARCHAR(20) DEFAULT 'LEAVE' CHECK (pass_type IN ('LEAVE', 'HOME_PASS', 'OUT_PASS')),
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    destination TEXT NOT NULL,
    emergency_contact VARCHAR(15) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    action_by INT REFERENCES warden(warden_id) ON DELETE SET NULL,
    action_date TIMESTAMP
);

-- 13. ROOM CHANGE REQUEST TABLE
CREATE TABLE room_change_request (
    request_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    current_room_id INT REFERENCES room(room_id) ON DELETE CASCADE,
    requested_room_id INT REFERENCES room(room_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    action_by INT REFERENCES warden(warden_id) ON DELETE SET NULL,
    action_date TIMESTAMP
);

-- 14. ATTENDANCE TABLE
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LEAVE')),
    marked_by INT REFERENCES warden(warden_id) ON DELETE SET NULL,
    UNIQUE(student_id, date)
);

-- 15. NOTICE BOARD TABLE
CREATE TABLE notice (
    notice_id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    audience VARCHAR(30) DEFAULT 'ALL' CHECK (audience IN ('ALL', 'STUDENTS', 'WARDENS', 'STAFF')),
    expiry_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT REFERENCES users(user_id) ON DELETE SET NULL
);

-- 16. INVENTORY TABLE
CREATE TABLE inventory (
    item_id SERIAL PRIMARY KEY,
    hostel_id INT REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    item_name VARCHAR(100) NOT NULL,
    total_qty INT NOT NULL CHECK (total_qty >= 0),
    occupied_qty INT DEFAULT 0 CHECK (occupied_qty >= 0 AND occupied_qty <= total_qty),
    damaged_qty INT DEFAULT 0 CHECK (damaged_qty >= 0 AND damaged_qty <= total_qty)
);

-- 17. INVENTORY TRANSACTION TABLE
CREATE TABLE inventory_transaction (
    transaction_id SERIAL PRIMARY KEY,
    item_id INT REFERENCES inventory(item_id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('ADD', 'REMOVE', 'DAMAGE_REPORT', 'REPAIR_REPORT')),
    quantity INT NOT NULL CHECK (quantity > 0),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 18. MESS MENU TABLE
CREATE TABLE mess_menu (
    menu_id SERIAL PRIMARY KEY,
    hostel_id INT REFERENCES hostel(hostel_id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    breakfast TEXT NOT NULL,
    lunch TEXT NOT NULL,
    dinner TEXT NOT NULL,
    UNIQUE(hostel_id, day_of_week)
);

-- 19. MESS FEEDBACK TABLE
CREATE TABLE mess_feedback (
    feedback_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES student(student_id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    food_quality INT NOT NULL CHECK (food_quality >= 1 AND food_quality <= 5),
    taste INT NOT NULL CHECK (taste >= 1 AND taste <= 5),
    cleanliness INT NOT NULL CHECK (cleanliness >= 1 AND cleanliness <= 5),
    comments TEXT
);


-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_student_rollno ON student(roll_no);
CREATE INDEX idx_room_hostel ON room(hostel_id);
CREATE INDEX idx_room_status ON room(status);
CREATE INDEX idx_allocation_student ON room_allocation(student_id) WHERE status = 'ACTIVE';
CREATE INDEX idx_payment_student ON payment(student_id);
CREATE INDEX idx_complaint_status ON complaint(status);
CREATE INDEX idx_attendance_date ON attendance(date);


-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for Available Rooms
CREATE OR REPLACE VIEW available_rooms AS
SELECT r.room_id, r.room_number, r.floor, r.room_type, r.capacity, r.occupied_count, r.status, h.hostel_name
FROM room r
JOIN hostel h ON r.hostel_id = h.hostel_id
WHERE r.status = 'AVAILABLE' AND r.occupied_count < r.capacity;

-- View for Hostel Occupancy Calculations
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

-- View for Defaulters/Pending Fees
CREATE OR REPLACE VIEW pending_fees AS
SELECT s.student_id, s.roll_no, s.name, s.email, s.phone,
       sf.fee_id, sf.amount_due, sf.amount_paid,
       (sf.amount_due - sf.amount_paid) AS balance_due,
       sf.due_date, sf.status AS fee_status
FROM student s
JOIN student_fee sf ON s.student_id = sf.student_id
WHERE (sf.amount_due - sf.amount_paid) > 0;

-- View for Complaint Summaries
CREATE OR REPLACE VIEW complaint_summary AS
SELECT category, status, priority, COUNT(*) AS complaint_count
FROM complaint
GROUP BY category, status, priority;


-- ============================================================================
-- DATABASE PROCEDURES & TRIGGERS
-- ============================================================================

-- Trigger Function: Update Room Occupancy and Status on Allocations
CREATE OR REPLACE FUNCTION func_update_room_occupancy()
RETURNS TRIGGER AS $$
BEGIN
    -- Increment occupancy when a new active allocation is inserted
    IF (TG_OP = 'INSERT' AND NEW.status = 'ACTIVE') THEN
        UPDATE room 
        SET occupied_count = occupied_count + 1
        WHERE room_id = NEW.room_id;
    END IF;

    -- Adjust occupancy when an allocation status is changed
    IF (TG_OP = 'UPDATE') THEN
        -- If transitioned from ACTIVE to something else (vacated)
        IF (OLD.status = 'ACTIVE' AND NEW.status != 'ACTIVE') THEN
            UPDATE room 
            SET occupied_count = GREATEST(0, occupied_count - 1)
            WHERE room_id = OLD.room_id;
        -- If transitioned from something else to ACTIVE
        ELSIF (OLD.status != 'ACTIVE' AND NEW.status = 'ACTIVE') THEN
            UPDATE room 
            SET occupied_count = occupied_count + 1
            WHERE room_id = NEW.room_id;
        -- If the student was moved to a different room while active
        ELSIF (OLD.room_id != NEW.room_id AND NEW.status = 'ACTIVE') THEN
            UPDATE room 
            SET occupied_count = GREATEST(0, occupied_count - 1)
            WHERE room_id = OLD.room_id;
            
            UPDATE room 
            SET occupied_count = occupied_count + 1
            WHERE room_id = NEW.room_id;
        END IF;
    END IF;

    -- Decrement occupancy when an active allocation is deleted
    IF (TG_OP = 'DELETE' AND OLD.status = 'ACTIVE') THEN
        UPDATE room 
        SET occupied_count = GREATEST(0, occupied_count - 1)
        WHERE room_id = OLD.room_id;
    END IF;

    -- Trigger helper to update room statuses based on capacity limits
    -- Full vs Available
    UPDATE room 
    SET status = CASE 
        WHEN occupied_count >= capacity THEN 'FULL'
        ELSE 'AVAILABLE'
    END
    WHERE room_id IN (COALESCE(NEW.room_id, OLD.room_id), COALESCE(OLD.room_id, NEW.room_id));

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_room_occupancy
AFTER INSERT OR UPDATE OR DELETE ON room_allocation
FOR EACH ROW EXECUTE FUNCTION func_update_room_occupancy();


-- Trigger Function: Update Student Fee status when a Payment occurs
CREATE OR REPLACE FUNCTION func_update_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid NUMERIC(10,2);
    v_due NUMERIC(10,2);
BEGIN
    -- Query the total successful payments made for this fee item
    SELECT COALESCE(SUM(amount), 0.00) INTO v_total_paid
    FROM payment
    WHERE fee_id = NEW.fee_id AND status = 'SUCCESS';

    -- Query the total due amount
    SELECT amount_due INTO v_due
    FROM student_fee
    WHERE fee_id = NEW.fee_id;

    -- Update the student fee ledger
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

CREATE TRIGGER trg_update_payment_status
AFTER INSERT OR UPDATE ON payment
FOR EACH ROW EXECUTE FUNCTION func_update_payment_status();


-- Trigger Function: Automatically handle Resolution timestamp on Complaints
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

CREATE TRIGGER trg_complaint_resolution
BEFORE UPDATE ON complaint
FOR EACH ROW EXECUTE FUNCTION func_complaint_resolution();


-- ============================================================================
-- STORED PROCEDURES / TRANSACTION LOGIC
-- ============================================================================

-- Function: Allocate Room safely inside a database transaction
CREATE OR REPLACE FUNCTION allocate_room(p_student_id INT, p_room_id INT)
RETURNS BOOLEAN AS $$
DECLARE
    v_capacity INT;
    v_occupied INT;
    v_room_status VARCHAR(20);
    v_student_status VARCHAR(20);
    v_existing_alloc INT;
BEGIN
    -- 1. Check if student is active
    SELECT status INTO v_student_status FROM student WHERE student_id = p_student_id;
    IF v_student_status != 'ACTIVE' THEN
        RAISE EXCEPTION 'Student is not ACTIVE, cannot allocate room.';
    END IF;

    -- 2. Check if student already has an active allocation
    SELECT COUNT(*) INTO v_existing_alloc 
    FROM room_allocation 
    WHERE student_id = p_student_id AND status = 'ACTIVE';
    
    IF v_existing_alloc > 0 THEN
        RAISE EXCEPTION 'Student already has an active room allocation. Vacate current room first.';
    END IF;

    -- 3. Check room availability
    SELECT capacity, occupied_count, status INTO v_capacity, v_occupied, v_room_status
    FROM room
    WHERE room_id = p_room_id;

    IF v_room_status = 'MAINTENANCE' THEN
        RAISE EXCEPTION 'Room is under maintenance.';
    END IF;

    IF v_occupied >= v_capacity THEN
        RAISE EXCEPTION 'Room is fully occupied.';
    END IF;

    -- 4. Perform room allocation (Trigger will automatically handle room occupied counts)
    INSERT INTO room_allocation (student_id, room_id, allocation_date, status)
    VALUES (p_student_id, p_room_id, CURRENT_DATE, 'ACTIVE');

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Room allocation failed: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;


-- Function: Vacate Room safely inside a database transaction
CREATE OR REPLACE FUNCTION vacate_room(p_student_id INT)
RETURNS BOOLEAN AS $$
DECLARE
    v_allocation_id INT;
BEGIN
    -- Find active allocation
    SELECT allocation_id INTO v_allocation_id
    FROM room_allocation
    WHERE student_id = p_student_id AND status = 'ACTIVE';

    IF v_allocation_id IS NULL THEN
        RAISE EXCEPTION 'No active room allocation found for this student.';
    END IF;

    -- De-allocate (Trigger will automatically decrement room occupied count)
    UPDATE room_allocation
    SET status = 'COMPLETED',
        vacated_date = CURRENT_DATE
    WHERE allocation_id = v_allocation_id;

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Vacating room failed: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
