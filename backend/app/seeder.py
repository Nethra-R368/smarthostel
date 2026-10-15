import random
from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from . import models
from .auth.jwt import get_password_hash

def seed_mock_data(db: Session) -> dict:
    """Safely seeds initial database records if the database is currently empty."""
    user_count = db.query(models.User).count()
    if user_count > 0:
        return {
            "status": "skipped",
            "message": f"Database already contains {user_count} users. Seeding skipped to prevent duplicate data.",
            "user_count": user_count
        }

    try:
        # 1. Admin
        admin_user = models.User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role="ADMIN"
        )
        db.add(admin_user)

        # 2. Accountant
        acct_user = models.User(
            username="accountant",
            password_hash=get_password_hash("acct123"),
            role="ACCOUNTANT"
        )
        db.add(acct_user)
        db.flush()

        # 3. Wardens
        wardens = []
        warden_data = [
            {"username": "warden_boys", "name": "Boys Hostel Warden", "email": "boys.warden@smarthostel.edu", "phone": "+919876543210"},
            {"username": "warden_girls", "name": "Girls Hostel Warden", "email": "girls.warden@smarthostel.edu", "phone": "+919876543211"}
        ]
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

        # 4. Hostels
        hostels = []
        hostel_data = [
            {"name": "Aryabhata Hall", "type": "BOYS", "capacity": 100, "warden_id": wardens[0].warden_id},
            {"name": "Gargi Hall", "type": "GIRLS", "capacity": 100, "warden_id": wardens[1].warden_id}
        ]
        for hd in hostel_data:
            h = models.Hostel(
                hostel_name=hd["name"],
                hostel_type=hd["type"],
                capacity=hd["capacity"],
                warden_id=hd["warden_id"]
            )
            db.add(h)
            db.flush()
            hostels.append(h)

        # 5. Fee Structures
        fee_structure_data = [
            {"room_type": "SINGLE", "academic_fee": 80000, "mess_fee": 40000, "caution_deposit": 10000},
            {"room_type": "DOUBLE", "academic_fee": 50000, "mess_fee": 40000, "caution_deposit": 5000},
            {"room_type": "TRIPLE", "academic_fee": 35000, "mess_fee": 40000, "caution_deposit": 5000},
            {"room_type": "COMMON", "academic_fee": 20000, "mess_fee": 40000, "caution_deposit": 2000}
        ]
        for fd in fee_structure_data:
            fs = models.FeeStructure(
                room_type=fd["room_type"],
                academic_fee=fd["academic_fee"],
                mess_fee=fd["mess_fee"],
                caution_deposit=fd["caution_deposit"]
            )
            db.add(fs)
            db.flush()

        # 6. Rooms
        rooms = []
        capacities = {"SINGLE": 1, "DOUBLE": 2, "TRIPLE": 3, "COMMON": 4}
        for h in hostels:
            prefix = "A" if h.hostel_type == "BOYS" else "G"
            for floor in range(1, 3):
                for room_seq in range(1, 6):
                    rtype = "SINGLE" if room_seq == 1 else "DOUBLE" if room_seq in [2, 3] else "TRIPLE"
                    room = models.Room(
                        hostel_id=h.hostel_id,
                        room_number=f"{prefix}-{floor}0{room_seq}",
                        floor=floor,
                        room_type=rtype,
                        capacity=capacities[rtype],
                        occupied_count=0,
                        status="AVAILABLE"
                    )
                    db.add(room)
                    db.flush()
                    rooms.append(room)

        # 7. Students
        students = []
        s_user = models.User(
            username="sahaana",
            password_hash=get_password_hash("sahaana123"),
            role="STUDENT"
        )
        db.add(s_user)
        db.flush()
        sahaana = models.Student(
            user_id=s_user.user_id,
            roll_no="23CSE101",
            name="Sahaana Shri",
            email="sahaana@smarthostel.edu",
            phone="+919876543220",
            department="Computer Science",
            year=3,
            gender="Female",
            date_of_birth=date(2005, 8, 15),
            status="ACTIVE"
        )
        db.add(sahaana)
        db.flush()
        students.append(sahaana)

        # Additional students
        sample_students = [
            ("rahul", "Rahul Sharma", "Male", "23CSE102"),
            ("amit", "Amit Kumar", "Male", "23CSE103"),
            ("priya", "Priya Verma", "Female", "23CSE104"),
            ("ananya", "Ananya Patel", "Female", "23CSE105"),
            ("rohit", "Rohit Singh", "Male", "23CSE106"),
        ]
        for uname, sname, sgender, sroll in sample_students:
            u = models.User(
                username=uname,
                password_hash=get_password_hash(f"{uname}123"),
                role="STUDENT"
            )
            db.add(u)
            db.flush()
            st = models.Student(
                user_id=u.user_id,
                roll_no=sroll,
                name=sname,
                email=f"{uname}@smarthostel.edu",
                phone="+919876543230",
                department="Computer Science",
                year=2,
                gender=sgender,
                date_of_birth=date(2005, 5, 10),
                status="ACTIVE"
            )
            db.add(st)
            db.flush()
            students.append(st)

        # 8. Allocate Sahaana to a girls room and Rahul to a boys room
        girls_room = [r for r in rooms if r.room_number.startswith("G-")][0]
        boys_room = [r for r in rooms if r.room_number.startswith("A-")][0]

        alloc1 = models.RoomAllocation(
            student_id=sahaana.student_id,
            room_id=girls_room.room_id,
            allocation_date=date.today(),
            status="ACTIVE"
        )
        girls_room.occupied_count += 1
        db.add(alloc1)

        alloc2 = models.RoomAllocation(
            student_id=students[1].student_id,
            room_id=boys_room.room_id,
            allocation_date=date.today(),
            status="ACTIVE"
        )
        boys_room.occupied_count += 1
        db.add(alloc2)

        db.commit()

        return {
            "status": "success",
            "message": "Database seeded successfully with default users, hostels, rooms, and students!",
            "admin": "admin / admin123",
            "warden": "warden_boys / warden123",
            "student": "sahaana / sahaana123",
            "accountant": "accountant / acct123"
        }

    except Exception as e:
        db.rollback()
        return {
            "status": "error",
            "detail": str(e)
        }
