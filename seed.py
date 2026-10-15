import sys
import os
from datetime import date, datetime, timedelta
import random
from dotenv import load_dotenv

load_dotenv()

# Add backend directory to system path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.database import SessionLocal, engine, Base
from app import models
from app.auth.jwt import get_password_hash
from sqlalchemy import text, and_

def create_database_if_not_exists():
    from sqlalchemy import create_engine
    import urllib.parse
    db_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/smarthostel")
    
    # Parse URL to handle query parameters (like sslmode=require) and DB name cleanly
    parsed = urllib.parse.urlparse(db_url)
    db_name = parsed.path.lstrip("/")
    
    # Reconstruct the connection URL pointing to the default 'postgres' database
    base_url = f"{parsed.scheme}://{parsed.netloc}"
    if parsed.query:
        postgres_url = f"{base_url}/postgres?{parsed.query}"
    else:
        postgres_url = f"{base_url}/postgres"
        
    temp_engine = create_engine(postgres_url)
    try:
        with temp_engine.connect() as conn:
            conn.execution_options(isolation_level="AUTOCOMMIT")
            result = conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}'")).scalar()
            if not result:
                print(f"Database '{db_name}' does not exist. Creating database programmatically...")
                conn.execute(text(f"CREATE DATABASE {db_name}"))
                print(f"Database '{db_name}' created successfully!")
            else:
                print(f"Database '{db_name}' already exists.")
    except Exception as e:
        print(f"Warning: Could not verify/create database: {str(e)}")


def seed_db():
    print("Checking database existence...")
    create_database_if_not_exists()
    
    print("Connecting to database and re-initializing schema...")
    
    # 1. Read and run schema.sql to clear/create everything
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    if not os.path.exists(schema_path):
        print(f"Error: schema.sql not found at {schema_path}")
        return
        
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    # Execute schema
    with engine.connect() as conn:
        conn.execution_options(isolation_level="AUTOCOMMIT")
        conn.execute(text(schema_sql))
    
    print("Database schema successfully re-initialized!")
    
    db = SessionLocal()
    try:
        print("Seeding base user profiles...")
        
        # 2. SEED USERS & ROLES
        # Create Admin
        admin_user = models.User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role="ADMIN"
        )
        db.add(admin_user)
        
        # Create Accountant
        acct_user = models.User(
            username="accountant",
            password_hash=get_password_hash("acct123"),
            role="ACCOUNTANT"
        )
        db.add(acct_user)
        db.flush()
        
        # Create Wardens (2 Wardens: Boys & Girls Hostel Wardens)
        warden_data = [
            {"username": "warden_boys", "name": "Boys Hostel Warden", "email": "boys.warden@smarthostel.edu", "phone": "+919876543210"},
            {"username": "warden_girls", "name": "Girls Hostel Warden", "email": "girls.warden@smarthostel.edu", "phone": "+919876543211"}
        ]
        
        wardens = []
        for wd in warden_data:
            w_user = models.User(
                username=wd["username"],
                password_hash=get_password_hash("warden123"),
                role="WARDEN"
            )
            db.add(w_user)
            db.flush()
            
            warden = models.Warden(
                user_id=w_user.user_id,
                name=wd["name"],
                email=wd["email"],
                phone=wd["phone"]
            )
            db.add(warden)
            db.flush()
            wardens.append(warden)
            
        # 3. SEED HOSTELS
        hostel_data = [
            {"name": "Aryabhata Hall", "type": "BOYS", "capacity": 100, "warden_id": wardens[0].warden_id},
            {"name": "Gargi Hall", "type": "GIRLS", "capacity": 100, "warden_id": wardens[1].warden_id}
        ]
        
        hostels = []
        for hd in hostel_data:
            hostel = models.Hostel(
                hostel_name=hd["name"],
                hostel_type=hd["type"],
                capacity=hd["capacity"],
                warden_id=hd["warden_id"]
            )
            db.add(hostel)
            db.flush()
            hostels.append(hostel)
            
        # 4. SEED FEE STRUCTURES
        fee_structure_data = [
            {"room_type": "SINGLE", "academic_fee": 80000, "mess_fee": 40000, "caution_deposit": 10000},
            {"room_type": "DOUBLE", "academic_fee": 50000, "mess_fee": 40000, "caution_deposit": 5000},
            {"room_type": "TRIPLE", "academic_fee": 35000, "mess_fee": 40000, "caution_deposit": 5000},
            {"room_type": "COMMON", "academic_fee": 20000, "mess_fee": 40000, "caution_deposit": 2000}
        ]
        
        fee_structures = {}
        for fd in fee_structure_data:
            fs = models.FeeStructure(
                room_type=fd["room_type"],
                academic_fee=fd["academic_fee"],
                mess_fee=fd["mess_fee"],
                caution_deposit=fd["caution_deposit"]
            )
            db.add(fs)
            db.flush()
            fee_structures[fd["room_type"]] = fs
            
        # 5. SEED ROOMS
        rooms = []
        capacities = {"SINGLE": 1, "DOUBLE": 2, "TRIPLE": 3, "COMMON": 4}
        
        for h in hostels:
            for floor in range(1, 4):
                for room_seq in range(1, 6):
                    room_number = f"{'A' if h.hostel_id==1 else 'B' if h.hostel_id==2 else 'C'}-{floor}0{room_seq}"
                    
                    if room_seq == 1:
                        rtype = "SINGLE"
                    elif room_seq in [2, 3]:
                        rtype = "DOUBLE"
                    elif room_seq == 4:
                        rtype = "TRIPLE"
                    else:
                        rtype = "COMMON"
                        
                    room = models.Room(
                        hostel_id=h.hostel_id,
                        room_number=room_number,
                        floor=floor,
                        room_type=rtype,
                        capacity=capacities[rtype],
                        occupied_count=0,
                        status="AVAILABLE"
                    )
                    db.add(room)
                    db.flush()
                    rooms.append(room)
                    
        # 6. SEED STUDENTS (Username: first name in small, Password: firstname123)
        students = []
        
        # Add Sahaana
        sahaana_user = models.User(
            username="sahaana",
            password_hash=get_password_hash("sahaana123"),
            role="STUDENT"
        )
        db.add(sahaana_user)
        db.flush()
        
        sahaana = models.Student(
            user_id=sahaana_user.user_id,
            roll_no="23CSE101",
            name="Sahaana Shri",
            email="sahaana@smarthostel.edu",
            phone="+919876543220",
            department="Computer Science",
            year=3,
            gender="Female",
            date_of_birth=date(2005, 8, 15)
        )
        db.add(sahaana)
        db.flush()
        students.append(sahaana)
        
        # 39 other unique students (to ensure zero duplicate usernames)
        departments = ["Computer Science", "Information Technology", "Electronics & Communication", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering"]
        genders = ["Male", "Female"]
        last_names = ["Sharma", "Verma", "Kumar", "Patel", "Mehta", "Singh", "Joshi", "Das", "Rao", "Gupta"]
        
        first_names_male = [
            "aarav", "rohan", "vikram", "kabir", "arjun", "aditya", "rudra", "reyansh", "sai", "pranav",
            "amit", "rahul", "abhishek", "varun", "karan", "dev", "nishant", "yash", "harsh", "vivek",
            "rohit", "manish", "anil", "sanjay", "deepak", "vijay", "ajay", "sandeep", "rakesh", "umesh"
        ]
        first_names_female = [
            "ananya", "diya", "priya", "kavya", "isha", "neha", "riya", "aishwarya", "shruti", "sanjana",
            "shreya", "aditi", "tanvi", "riddhi", "siddhi", "sneha", "pooja", "swati", "divya", "megha"
        ]
        
        random.shuffle(first_names_male)
        random.shuffle(first_names_female)
        
        for i in range(2, 41):
            gender = "Female" if i % 2 == 0 else "Male"
            fname = first_names_female.pop() if gender == "Female" else first_names_male.pop()
            
            name = fname.capitalize() + " " + random.choice(last_names)
            username = fname
            password = f"{fname}123"
            roll_no = f"23CSE1{i:02d}"
            
            s_user = models.User(
                username=username,
                password_hash=get_password_hash(password),
                role="STUDENT"
            )
            db.add(s_user)
            db.flush()
            
            student = models.Student(
                user_id=s_user.user_id,
                roll_no=roll_no,
                name=name,
                email=f"{username}@smarthostel.edu",
                phone=f"+9198765432{i:02d}",
                department=random.choice(departments),
                year=random.choice([1, 2, 3, 4]),
                gender=gender,
                date_of_birth=date(2003 + random.choice([0, 1, 2]), random.randint(1, 12), random.randint(1, 28))
            )
            db.add(student)
            db.flush()
            students.append(student)
            
        print("Allocating students to rooms via database procedure...")
        
        # 7. SEED ROOM ALLOCATIONS
        for s in students:
            eligible_rooms = []
            for r in rooms:
                if r.occupied_count >= r.capacity:
                    continue
                
                # Check hostel gender rules
                if s.gender == "Female" and r.hostel_id != 2:
                    continue
                if s.gender == "Male" and r.hostel_id != 1:
                    continue
                
                # For co-ed hostels, ensure individual rooms are strictly single-gender
                current_allocs = db.query(models.RoomAllocation).filter(
                    models.RoomAllocation.room_id == r.room_id,
                    models.RoomAllocation.status == "ACTIVE"
                ).all()
                if current_allocs:
                    existing_genders = [a.student.gender for a in current_allocs]
                    if any(g != s.gender for g in existing_genders):
                        continue
                
                eligible_rooms.append(r)
                        
            if eligible_rooms:
                selected_room = random.choice(eligible_rooms)
                stmt = text("SELECT allocate_room(:s_id, :r_id)")
                db.execute(stmt, {"s_id": s.student_id, "r_id": selected_room.room_id})
                db.commit()
                db.refresh(selected_room)
                
        # 8. SEED INVOICES AND PAYMENTS
        print("Seeding invoices and payments...")
        all_allocations = db.query(models.RoomAllocation).filter(models.RoomAllocation.status == "ACTIVE").all()
        
        for alloc in all_allocations:
            room = alloc.room
            fs = fee_structures[room.room_type]
            
            due_amount = fs.academic_fee + fs.mess_fee + fs.caution_deposit
            fee_status = random.choice(["PENDING", "PAID"])
            paid_amount = due_amount if fee_status == "PAID" else 0
            
            invoice = models.StudentFee(
                student_id=alloc.student_id,
                fee_structure_id=fs.fee_structure_id,
                amount_due=due_amount,
                amount_paid=paid_amount,
                due_date=date.today() + timedelta(days=random.randint(15, 60)),
                status=fee_status
            )
            db.add(invoice)
            db.flush()
            
            if fee_status == "PAID":
                payment = models.Payment(
                    student_id=alloc.student_id,
                    fee_id=invoice.fee_id,
                    amount=due_amount,
                    payment_method=random.choice(["UPI", "CARD", "NET_BANKING"]),
                    transaction_id="TXN" + uuid_short().upper(),
                    status="SUCCESS"
                )
                db.add(payment)
                db.flush()
        db.commit()
        
        # 9. SEED COMPLAINTS
        print("Seeding student complaints...")
        complaint_descs = {
            "ELECTRICAL": ["Fan speed regulator broken", "Tubelight flickering in study room", "Power outlet socket loose"],
            "PLUMBING": ["Water tap dripping in bathroom", "Showerhead clogged with scaling", "Drain blockage in washroom"],
            "WIFI": ["WiFi signal dropping frequently in wing A", "Slow internet bandwidth in evenings", "Cannot connect to hostel access point"],
            "CLEANING": ["Corridor dustbins overflowing", "Balcony floor needs sweeping", "Common bathroom floor slippery"],
            "FURNITURE": ["Study chair leg wobbly", "Almirah locker door latch broken", "Bunk bed frame creaking"],
            "FOOD": ["Breakfast food served cold", "Mess drinking water dispenser dirty", "Rice quality was poor today"],
            "SECURITY": ["Hostel entrance gate lock loose", "CCTV camera lens covered in dust", "Visitor logbook entries unmonitored"],
            "OTHER": ["Courier delivery packages missing from desk", "Noise from neighboring room late night"]
        }
        
        for _ in range(15):
            student_alloc = random.choice(all_allocations)
            cat = random.choice(list(complaint_descs.keys()))
            desc = random.choice(complaint_descs[cat])
            priority = random.choice(["LOW", "MEDIUM", "HIGH"])
            
            warden_id = student_alloc.room.hostel.warden_id
            status_val = random.choice(["NEW", "ASSIGNED", "IN_PROGRESS", "RESOLVED"])
            res_text = "Issue resolved successfully by maintenance team." if status_val == "RESOLVED" else None
            
            complaint = models.Complaint(
                student_id=student_alloc.student_id,
                category=cat,
                description=desc,
                priority=priority,
                status=status_val,
                assigned_to=warden_id,
                resolution=res_text
            )
            db.add(complaint)
            db.commit()
            
            if status_val == "RESOLVED":
                complaint.resolved_at = datetime.now() - timedelta(hours=random.randint(1, 48))
                db.commit()
                
        # 10. SEED LEAVES
        print("Seeding leave requests...")
        leave_reasons = ["Going home for festival", "Family emergency", "Attending cousin wedding", "Medical consultation in home town"]
        for _ in range(15):
            alloc = random.choice(all_allocations)
            from_dt = date.today() + timedelta(days=random.randint(2, 10))
            to_dt = from_dt + timedelta(days=random.randint(2, 5))
            
            status_val = random.choice(["PENDING", "APPROVED", "REJECTED"])
            warden_id = alloc.room.hostel.warden_id
            
            pass_type_val = random.choice(["LEAVE", "HOME_PASS", "OUT_PASS"])
            dest = "My Home Town" if pass_type_val != "OUT_PASS" else "Local City Mall"
            reason_text = "Weekend Outing" if pass_type_val == "OUT_PASS" else random.choice(leave_reasons)

            leave = models.LeaveRequest(
                student_id=alloc.student_id,
                pass_type=pass_type_val,
                from_date=from_dt,
                to_date=to_dt,
                reason=reason_text,
                destination=dest,
                emergency_contact=alloc.student.phone,
                status=status_val,
                action_by=warden_id if status_val != "PENDING" else None,
                action_date=datetime.now() if status_val != "PENDING" else None
            )
            db.add(leave)
            db.commit()
            
        # 11. SEED VISITORS
        print("Seeding visitor logs...")
        relations = ["Mother", "Father", "Brother", "Sister", "Friend"]
        visitor_names = ["Amit Sharma", "Karan Singh", "Sita Devi", "Ramesh Verma", "Jyoti Rao"]
        
        for _ in range(8):
            alloc = random.choice(all_allocations)
            status_val = random.choice(["APPROVED", "CHECKED_OUT"])
            
            entry = datetime.now() - timedelta(hours=random.randint(2, 10))
            exit_time = entry + timedelta(hours=random.randint(1, 3)) if status_val == "CHECKED_OUT" else None
            
            visitor = models.Visitor(
                student_id=alloc.student_id,
                visitor_name=random.choice(visitor_names),
                relationship=random.choice(relations),
                phone="+919988776655",
                visit_date=date.today(),
                entry_time=entry,
                exit_time=exit_time,
                approved_by=alloc.room.hostel.warden_id,
                status=status_val
            )
            db.add(visitor)
            db.commit()
            
        # 12. SEED ATTENDANCE
        print("Seeding attendance records for the last 5 days...")
        for day_offset in range(5):
            att_date = date.today() - timedelta(days=day_offset)
            for alloc in all_allocations:
                # Add attendance log
                att = models.Attendance(
                    student_id=alloc.student_id,
                    date=att_date,
                    status=random.choice(["PRESENT", "PRESENT", "PRESENT", "ABSENT"]),
                    marked_by=alloc.room.hostel.warden_id
                )
                db.add(att)
            db.commit()
            
        # 13. SEED NOTICES
        print("Seeding notice board postings...")
        notices_mock = [
            {"t": "Mess Rules & Food Timings", "d": "Breakfast: 7:30-9:00 AM, Lunch: 12:30-2:00 PM, Dinner: 7:30-9:00 PM. No food allowed outside mess hall.", "a": "ALL"},
            {"t": "Maintenance Shut Down Notice", "d": "Electrical power grids and water supplies will be temporarily shut down this Saturday from 10:00 AM to 1:00 PM for preventative audits.", "a": "ALL"},
            {"t": "Home Outpass Approvals Rule", "d": "Students requesting Home Passes must submit their applications at least 48 hours prior. Emergency leaves require direct parents call.", "a": "STUDENTS"},
            {"t": "Inventory Audit Scheduled", "d": "Room furniture inspections will be conducted by the warden team starting next Monday. Keep rooms clean and accessible.", "a": "ALL"}
        ]
        for n in notices_mock:
            notice = models.Notice(
                title=n["t"],
                description=n["d"],
                audience=n["a"],
                expiry_date=date.today() + timedelta(days=30),
                created_by=admin_user.user_id
            )
            db.add(notice)
        db.commit()
        
        # 14. SEED INVENTORY
        print("Seeding inventory registries...")
        inventory_items = ["Study Chair", "Wooden Table", "Bunk Bed Frame", "Wall Fan", "LED Tubelight"]
        for h in hostels:
            for item in inventory_items:
                inv = models.Inventory(
                    hostel_id=h.hostel_id,
                    item_name=item,
                    total_qty=h.capacity,
                    occupied_qty=int(h.capacity * 0.7),
                    damaged_qty=random.randint(0, 3)
                )
                db.add(inv)
        db.commit()
        
        # 15. SEED MESS MENU
        print("Seeding mess menus...")
        menu_items = {
            "Monday": {"b": "Idli + Sambar + Coconut Chutney", "l": "Rice + Sambar + Cabbage Poriyal + Curd", "d": "Chapati + Paneer Butter Masala + Dal"},
            "Tuesday": {"b": "Puri + Potato Masala", "l": "Veg Biryani + Raita + Papad + Pickle", "d": "Rice + Rasam + Egg Masala / Potato Roast"},
            "Wednesday": {"b": "Upma + Ginger Chutney", "l": "Rice + Karakuzhambu + Potato Fry + Butter Milk", "d": "Chapati + Chicken Gravy / Gobi Manchurian"},
            "Thursday": {"b": "Dosa + Tomato Sambar", "l": "Rice + Keerai Kootu + Beetroot Poriyal + Curd", "d": "Roti + Chana Masala + Dal Tadka"},
            "Friday": {"b": "Pongal + Vadai + Sambar", "l": "Rice + Sambar + Bhindi Masala + Curd", "d": "Parotta + Veg Kurma / Egg Curry"},
            "Saturday": {"b": "Bread Toast + Jam + Boiled Eggs", "l": "Lemon Rice / Curd Rice + Potato Chips", "d": "Jeera Rice + Dal Makhani + Paneer Tikka"},
            "Sunday": {"b": "Semiya Upma + Coconut Chutney", "l": "Special Chicken Biryani / Paneer Biryani + Raita", "d": "Chapati + Mix Veg Sabzi + Custard Dessert"}
        }
        
        for h in hostels:
            for day, meals in menu_items.items():
                menu = models.MessMenu(
                    hostel_id=h.hostel_id,
                    day_of_week=day,
                    breakfast=meals["b"],
                    lunch=meals["l"],
                    dinner=meals["d"]
                )
                db.add(menu)
        db.commit()

        # 16. SEED FEEDBACK
        print("Seeding mess feedbacks...")
        for alloc in all_allocations[:15]:
            feedback = models.MessFeedback(
                student_id=alloc.student_id,
                date=date.today() - timedelta(days=random.randint(1, 3)),
                food_quality=random.randint(3, 5),
                taste=random.randint(3, 5),
                cleanliness=random.randint(4, 5),
                comments="Food is tasty, but cleanliness can be improved a bit."
            )
            db.add(feedback)
        db.commit()

        print("\n========================================================")
        print("DATABASE SUCCESSFULLY SEEDED WITH 100+ INTEGRATED RECORDS!")
        print("--------------------------------------------------------")
        print("CREDENTIALS PRE-CONFIGURED FOR PRESENTATION:")
        print("  1. Admin         --> Username: admin          / Password: admin123")
        print("  2. Boys Warden   --> Username: warden_boys    / Password: warden123")
        print("  3. Girls Warden  --> Username: warden_girls   / Password: warden123")
        print("  4. Accountant    --> Username: accountant     / Password: acct123")
        print("  5. Student (Sahaana) --> Username: sahaana    / Password: sahaana123")
        print("  6. Other Students--> Username: [firstname]    / Password: [firstname]123")
        print("========================================================\n")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {str(e)}")
        raise e
    finally:
        db.close()

def uuid_short():
    return str(uuid.uuid4())[:8]

if __name__ == "__main__":
    import uuid
    seed_db()
