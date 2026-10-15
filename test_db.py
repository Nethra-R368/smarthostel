import sys
import os
import unittest
from sqlalchemy import text

# Add backend directory to system path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from app.database import SessionLocal, engine
from app import models

class TestSmartHostelDatabase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.db = SessionLocal()

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_views_exist(self):
        """Verify that views exist and can be queried"""
        try:
            # Query all views to ensure compilation is correct
            r1 = self.db.execute(text("SELECT * FROM available_rooms LIMIT 1")).all()
            r2 = self.db.execute(text("SELECT * FROM hostel_occupancy LIMIT 1")).all()
            r3 = self.db.execute(text("SELECT * FROM pending_fees LIMIT 1")).all()
            r4 = self.db.execute(text("SELECT * FROM complaint_summary LIMIT 1")).all()
            print("SUCCESS: Views compiled and queried successfully!")
        except Exception as e:
            self.fail(f"Views query failed: {e}")

    def test_triggers_and_procedures(self):
        """Verify stored procedures and triggers maintain occupied counts correctly"""
        # Find a room with space
        room = self.db.query(models.Room).filter(models.Room.occupied_count < models.Room.capacity, models.Room.status == "AVAILABLE").first()
        if not room:
            self.skipTest("No available room found for test")
            
        # Find an unallocated student
        allocated_student_ids = [a.student_id for a in self.db.query(models.RoomAllocation).filter(models.RoomAllocation.status == "ACTIVE").all()]
        student = self.db.query(models.Student).filter(
            models.Student.status == "ACTIVE",
            ~models.Student.student_id.in_(allocated_student_ids) if allocated_student_ids else True
        ).first()
        
        if not student:
            # Create a mock active student
            mock_user = models.User(username="test_student_trigger", password_hash="hash", role="STUDENT")
            self.db.add(mock_user)
            self.db.flush()
            student = models.Student(
                user_id=mock_user.user_id,
                roll_no="TEST_ROLL",
                name="Test Student Trg",
                email="test_trg@smarthostel.edu",
                status="ACTIVE"
            )
            self.db.add(student)
            self.db.commit()

        initial_count = room.occupied_count
        
        try:
            # Run allocate stored procedure
            stmt = text("SELECT allocate_room(:s_id, :r_id)")
            result = self.db.execute(stmt, {"s_id": student.student_id, "r_id": room.room_id}).scalar()
            self.db.commit()
            
            self.assertTrue(result, "Stored procedure allocate_room returned failure")
            
            # Fetch room count from db to verify trigger updated it
            self.db.refresh(room)
            self.assertEqual(room.occupied_count, initial_count + 1, "Trigger failed to increment occupied_count")
            print("SUCCESS: Stored Procedure & Trigger: allocate_room() successfully incremented room occupied count!")

            # Run vacate stored procedure
            stmt_vacate = text("SELECT vacate_room(:s_id)")
            result_vacate = self.db.execute(stmt_vacate, {"s_id": student.student_id}).scalar()
            self.db.commit()
            
            self.assertTrue(result_vacate, "Stored procedure vacate_room returned failure")
            
            self.db.refresh(room)
            self.assertEqual(room.occupied_count, initial_count, "Trigger failed to decrement occupied_count on vacate")
            print("SUCCESS: Stored Procedure & Trigger: vacate_room() successfully decremented room occupied count!")
            
        finally:
            # Cleanup mock student if created
            if student.roll_no == "TEST_ROLL":
                self.db.delete(student)
                user = self.db.query(models.User).filter(models.User.username == "test_student_trigger").first()
                if user:
                    self.db.delete(user)
                self.db.commit()

if __name__ == "__main__":
    unittest.main()
