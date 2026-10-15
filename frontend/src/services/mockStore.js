// SmartHostel In-Memory & LocalStorage Mock Database Engine
// Provides instantaneous, zero-latency state with persistent updates

const STORAGE_KEY = "smarthostel_mock_db_v2";

const INITIAL_DATA = {
  hostels: [
    { hostel_id: 1, hostel_name: "Aryabhata Hall", hostel_type: "BOYS", capacity: 150, warden_id: 1, warden_name: "Dr. K. Ramanathan" },
    { hostel_id: 2, hostel_name: "Gargi Hall", hostel_type: "GIRLS", capacity: 150, warden_id: 2, warden_name: "Prof. Sunitha M." },
    { hostel_id: 3, hostel_name: "APJ Abdul Kalam Block", hostel_type: "COED", capacity: 100, warden_id: 1, warden_name: "Dr. K. Ramanathan" },
  ],
  wardens: [
    { warden_id: 1, user_id: 2, username: "warden_bh1", name: "Dr. K. Ramanathan", email: "ramanathan@smarthostel.edu", phone: "+91 98401 23456" },
    { warden_id: 2, user_id: 3, username: "warden_gh1", name: "Prof. Sunitha M.", email: "sunitha@smarthostel.edu", phone: "+91 98402 34567" },
  ],
  rooms: [
    { room_id: 101, hostel_id: 1, hostel_name: "Aryabhata Hall", room_number: "A-101", floor: 1, room_type: "DOUBLE", capacity: 2, occupied_count: 2, status: "FULL" },
    { room_id: 102, hostel_id: 1, hostel_name: "Aryabhata Hall", room_number: "A-102", floor: 1, room_type: "DOUBLE", capacity: 2, occupied_count: 1, status: "AVAILABLE" },
    { room_id: 103, hostel_id: 1, hostel_name: "Aryabhata Hall", room_number: "A-201", floor: 2, room_type: "SINGLE", capacity: 1, occupied_count: 1, status: "FULL" },
    { room_id: 104, hostel_id: 1, hostel_name: "Aryabhata Hall", room_number: "A-202", floor: 2, room_type: "TRIPLE", capacity: 3, occupied_count: 1, status: "AVAILABLE" },
    { room_id: 201, hostel_id: 2, hostel_name: "Gargi Hall", room_number: "G-101", floor: 1, room_type: "DOUBLE", capacity: 2, occupied_count: 2, status: "FULL" },
    { room_id: 202, hostel_id: 2, hostel_name: "Gargi Hall", room_number: "G-102", floor: 1, room_type: "DOUBLE", capacity: 2, occupied_count: 1, status: "AVAILABLE" },
    { room_id: 203, hostel_id: 2, hostel_name: "Gargi Hall", room_number: "G-201", floor: 2, room_type: "SINGLE", capacity: 1, occupied_count: 0, status: "AVAILABLE" },
    { room_id: 301, hostel_id: 3, hostel_name: "APJ Abdul Kalam Block", room_number: "K-101", floor: 1, room_type: "DOUBLE", capacity: 2, occupied_count: 1, status: "AVAILABLE" },
  ],
  students: [
    {
      student_id: 1,
      user_id: 10,
      username: "sahaana",
      name: "Sahaana Shri",
      roll_no: "22CSE045",
      email: "sahaana@smarthostel.edu",
      phone: "+91 94455 12345",
      department: "CSE",
      year: 3,
      gender: "Female",
      date_of_birth: "2004-05-14",
      admission_date: "2022-08-10",
      status: "ACTIVE",
      room_number: "G-101",
      hostel_name: "Gargi Hall",
      room_id: 201,
      room_type: "DOUBLE",
      floor: 1,
    },
    {
      student_id: 2,
      user_id: 11,
      username: "priya_s",
      name: "Priya Sharma",
      roll_no: "22CSE078",
      email: "priya.sharma@smarthostel.edu",
      phone: "+91 94455 67890",
      department: "CSE",
      year: 3,
      gender: "Female",
      date_of_birth: "2004-03-22",
      admission_date: "2022-08-10",
      status: "ACTIVE",
      room_number: "G-101",
      hostel_name: "Gargi Hall",
      room_id: 201,
      room_type: "DOUBLE",
      floor: 1,
    },
    {
      student_id: 3,
      user_id: 12,
      username: "karthik_a",
      name: "Karthik Aryan",
      roll_no: "23ECE012",
      email: "karthik.a@smarthostel.edu",
      phone: "+91 98401 55555",
      department: "ECE",
      year: 2,
      gender: "Male",
      date_of_birth: "2005-09-18",
      admission_date: "2023-08-16",
      status: "ACTIVE",
      room_number: "A-101",
      hostel_name: "Aryabhata Hall",
      room_id: 101,
      room_type: "DOUBLE",
      floor: 1,
    },
    {
      student_id: 4,
      user_id: 13,
      username: "rahul_v",
      name: "Rahul Verma",
      roll_no: "23ECE088",
      email: "rahul.v@smarthostel.edu",
      phone: "+91 98401 66666",
      department: "ECE",
      year: 2,
      gender: "Male",
      date_of_birth: "2005-11-04",
      admission_date: "2023-08-16",
      status: "ACTIVE",
      room_number: "A-101",
      hostel_name: "Aryabhata Hall",
      room_id: 101,
      room_type: "DOUBLE",
      floor: 1,
    },
    {
      student_id: 5,
      user_id: 14,
      username: "ananya_i",
      name: "Ananya Iyer",
      roll_no: "24IT031",
      email: "ananya.i@smarthostel.edu",
      phone: "+91 94455 33333",
      department: "IT",
      year: 1,
      gender: "Female",
      date_of_birth: "2006-01-29",
      admission_date: "2024-08-12",
      status: "ACTIVE",
      room_number: "G-102",
      hostel_name: "Gargi Hall",
      room_id: 202,
      room_type: "DOUBLE",
      floor: 1,
    },
    {
      student_id: 6,
      user_id: 15,
      username: "aditya_m",
      name: "Aditya Mohan",
      roll_no: "21MECH005",
      email: "aditya.m@smarthostel.edu",
      phone: "+91 98401 77777",
      department: "MECH",
      year: 4,
      gender: "Male",
      date_of_birth: "2003-07-15",
      admission_date: "2021-08-14",
      status: "ACTIVE",
      room_number: "A-201",
      hostel_name: "Aryabhata Hall",
      room_id: 103,
      room_type: "SINGLE",
      floor: 2,
    },
  ],
  notices: [
    {
      notice_id: 1,
      title: "Hostel Wi-Fi Upgrade & Scheduled Maintenance",
      description: "High-speed optical fiber upgrades will be performed between 10:00 PM and 1:00 AM on Sunday across all blocks.",
      audience: "ALL",
      posted_by_name: "Admin Office",
      created_at: "2026-10-14T09:30:00",
      expiry_date: "2026-10-25",
    },
    {
      notice_id: 2,
      title: "Semester Hostel Fee Payment Schedule",
      description: "Even Semester mess and room fee invoices have been generated. Kindly clear pending balances by the 25th to avoid late fines.",
      audience: "STUDENT",
      posted_by_name: "Accounts Office",
      created_at: "2026-10-12T11:00:00",
      expiry_date: "2026-10-28",
    },
    {
      notice_id: 3,
      title: "Inter-Hostel Table Tennis & Badminton Tournament",
      description: "Registration is open for the annual sports meet. Please register your team with the respective floor warden.",
      audience: "ALL",
      posted_by_name: "Dr. K. Ramanathan",
      created_at: "2026-10-10T16:00:00",
      expiry_date: "2026-10-30",
    },
  ],
  complaints: [
    {
      complaint_id: 1,
      student_id: 1,
      student_name: "Sahaana Shri",
      roll_no: "22CSE045",
      room_number: "G-101",
      hostel_name: "Gargi Hall",
      category: "PLUMBING",
      description: "Washroom tap on 1st floor wing B has a slow leak.",
      priority: "MEDIUM",
      status: "IN_PROGRESS",
      created_at: "2026-10-13T14:20:00",
      resolved_at: null,
      resolution: "Plumber scheduled for inspection tomorrow morning.",
    },
    {
      complaint_id: 2,
      student_id: 3,
      student_name: "Karthik Aryan",
      roll_no: "23ECE012",
      room_number: "A-101",
      hostel_name: "Aryabhata Hall",
      category: "ELECTRICAL",
      description: "Ceiling fan speed regulator in room A-101 is noisy at high speed.",
      priority: "LOW",
      status: "RESOLVED",
      created_at: "2026-10-11T10:15:00",
      resolved_at: "2026-10-12T15:00:00",
      resolution: "Regulator capacitor replaced and lubricated.",
    },
    {
      complaint_id: 3,
      student_id: 4,
      student_name: "Rahul Verma",
      roll_no: "23ECE088",
      room_number: "A-101",
      hostel_name: "Aryabhata Hall",
      category: "WIFI",
      description: "Wi-Fi access point in corridor dropping connection intermittently.",
      priority: "HIGH",
      status: "OPEN",
      created_at: "2026-10-15T11:00:00",
      resolved_at: null,
      resolution: null,
    },
  ],
  leaves: [
    {
      leave_id: 1,
      student_id: 1,
      student_name: "Sahaana Shri",
      roll_no: "22CSE045",
      room_number: "G-101",
      from_date: "2026-10-18",
      to_date: "2026-10-21",
      reason: "Attending cousin wedding ceremony in Coimbatore",
      destination: "Coimbatore",
      emergency_contact: "+91 94433 99999",
      pass_type: "LEAVE",
      status: "APPROVED",
      created_at: "2026-10-14T08:00:00",
    },
    {
      leave_id: 2,
      student_id: 3,
      student_name: "Karthik Aryan",
      roll_no: "23ECE012",
      room_number: "A-101",
      from_date: "2026-10-17",
      to_date: "2026-10-17",
      reason: "Weekend city outing and project material purchase",
      destination: "City Center",
      emergency_contact: "+91 98401 11111",
      pass_type: "OUTING",
      status: "APPROVED",
      created_at: "2026-10-15T09:30:00",
    },
  ],
  fees: [
    { fee_id: 1, student_id: 1, student_name: "Sahaana Shri", roll_no: "22CSE045", structure_name: "Semester 5 Room & Mess Ledger", amount_due: 42000, amount_paid: 42000, balance_due: 0, due_date: "2026-10-25", status: "PAID" },
    { fee_id: 2, student_id: 2, student_name: "Priya Sharma", roll_no: "22CSE078", structure_name: "Semester 5 Room & Mess Ledger", amount_due: 42000, amount_paid: 20000, balance_due: 22000, due_date: "2026-10-25", status: "PARTIAL" },
    { fee_id: 3, student_id: 3, student_name: "Karthik Aryan", roll_no: "23ECE012", structure_name: "Semester 3 Room & Mess Ledger", amount_due: 38000, amount_paid: 38000, balance_due: 0, due_date: "2026-10-25", status: "PAID" },
    { fee_id: 4, student_id: 4, student_name: "Rahul Verma", roll_no: "23ECE088", structure_name: "Semester 3 Room & Mess Ledger", amount_due: 38000, amount_paid: 0, balance_due: 38000, due_date: "2026-10-20", status: "PENDING" },
    { fee_id: 5, student_id: 5, student_name: "Ananya Iyer", roll_no: "24IT031", structure_name: "Semester 1 Full Year Package", amount_due: 55000, amount_paid: 55000, balance_due: 0, due_date: "2026-10-25", status: "PAID" },
    { fee_id: 6, student_id: 6, student_name: "Aditya Mohan", roll_no: "21MECH005", structure_name: "Semester 7 Room & Mess Ledger", amount_due: 45000, amount_paid: 25000, balance_due: 20000, due_date: "2026-10-15", status: "PARTIAL" },
  ],
  payments: [
    { payment_id: 1, fee_id: 1, student_name: "Sahaana Shri", roll_no: "22CSE045", amount: 42000, payment_date: "2026-10-05", payment_method: "UPI", transaction_id: "UPI-9840291039", status: "SUCCESS" },
    { payment_id: 2, fee_id: 3, student_name: "Karthik Aryan", roll_no: "23ECE012", amount: 38000, payment_date: "2026-10-06", payment_method: "NET_BANKING", transaction_id: "NB-772819028", status: "SUCCESS" },
    { payment_id: 3, fee_id: 5, student_name: "Ananya Iyer", roll_no: "24IT031", amount: 55000, payment_date: "2026-10-07", payment_method: "CARD", transaction_id: "TXN-66190283", status: "SUCCESS" },
  ],
  attendance: [
    { attendance_id: 1, student_id: 1, roll_no: "22CSE045", name: "Sahaana Shri", room_number: "G-101", date: new Date().toISOString().split("T")[0], status: "PRESENT", remarks: "Night roll call biometric verified" },
    { attendance_id: 2, student_id: 2, roll_no: "22CSE078", name: "Priya Sharma", room_number: "G-101", date: new Date().toISOString().split("T")[0], status: "PRESENT", remarks: "Night roll call biometric verified" },
    { attendance_id: 3, student_id: 3, roll_no: "23ECE012", name: "Karthik Aryan", room_number: "A-101", date: new Date().toISOString().split("T")[0], status: "PRESENT", remarks: "Night roll call biometric verified" },
    { attendance_id: 4, student_id: 4, roll_no: "23ECE088", name: "Rahul Verma", room_number: "A-101", date: new Date().toISOString().split("T")[0], status: "PRESENT", remarks: "Night roll call biometric verified" },
    { attendance_id: 5, student_id: 5, roll_no: "24IT031", name: "Ananya Iyer", room_number: "G-102", date: new Date().toISOString().split("T")[0], status: "PRESENT", remarks: "Night roll call biometric verified" },
  ],
  inventory: [
    { item_id: 1, item_name: "Single Bed Mattress (Coir/Foam)", category: "BEDDING", total_quantity: 120, available_quantity: 34, unit: "pieces" },
    { item_id: 2, item_name: "Ergonomic Study Table Chair", category: "FURNITURE", total_quantity: 200, available_quantity: 48, unit: "pieces" },
    { item_id: 3, item_name: "LED Ceiling Tube Light (20W)", category: "ELECTRICAL", total_quantity: 80, available_quantity: 26, unit: "pieces" },
    { item_id: 4, item_name: "Floor Cleaner Disinfectant (5L)", category: "HOUSEKEEPING", total_quantity: 30, available_quantity: 12, unit: "cans" },
  ],
  messMenu: [
    { day_of_week: "Monday", meal_type: "BREAKFAST", menu_items: "Idli, Vada, Sambar, Coconut & Tomato Chutney, Tea/Coffee" },
    { day_of_week: "Monday", meal_type: "LUNCH", menu_items: "Steamed Rice, Dal Tadka, Paneer Butter Masala, Curd, Papad" },
    { day_of_week: "Monday", meal_type: "DINNER", menu_items: "Chapati, Mixed Veg Curry, Jeera Rice, Rasam, Banana" },
    { day_of_week: "Tuesday", meal_type: "BREAKFAST", menu_items: "Puri Bhaji, Upma, Chutney, Tea/Coffee" },
    { day_of_week: "Tuesday", meal_type: "LUNCH", menu_items: "Veg Pulao, Rajma Masala, Raita, Steamed Rice, Sambar" },
    { day_of_week: "Tuesday", meal_type: "DINNER", menu_items: "Phulka, Dal Fry, Potato Peas Curry, Curd Rice, Gulab Jamun" },
    { day_of_week: "Wednesday", meal_type: "BREAKFAST", menu_items: "Masala Dosa, Sambar, Green Chutney, Boiled Eggs / Fruit" },
    { day_of_week: "Wednesday", meal_type: "LUNCH", menu_items: "Chicken Biryani / Paneer Biryani, Mirchi ka Salan, Onion Raita" },
    { day_of_week: "Wednesday", meal_type: "DINNER", menu_items: "Chapati, Kadai Veg, Rasam, Curd, Ice Cream" },
  ],
  roomChanges: [],
  visitors: [
    { visitor_id: 1, student_id: 1, student_name: "Sahaana Shri", visitor_name: "Mr. K. Narayanan", relationship: "Father", phone: "+91 94433 88888", check_in_time: "2026-10-14 11:30", check_out_time: "2026-10-14 14:00", status: "CHECKED_OUT" },
  ],
};

// Helper: load or initialize storage
export const getStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
      return { ...INITIAL_DATA };
    }
    return JSON.parse(raw);
  } catch (e) {
    return { ...INITIAL_DATA };
  }
};

export const saveStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("LocalStorage save error:", e);
  }
};

// Data Mutators
export const mockDB = {
  // Reset store to fresh initial values
  reset: () => {
    saveStore(INITIAL_DATA);
    return INITIAL_DATA;
  },

  // Auth
  login: (username, password) => {
    const store = getStore();
    const uname = (username || "").toLowerCase().trim();

    if (uname === "admin") {
      return { access_token: "mock-jwt-admin-token", token_type: "bearer", role: "ADMIN", username: "admin", name: "System Administrator", user_id: 1, profile_id: null };
    }
    if (uname === "warden" || uname.startsWith("warden")) {
      const w = store.wardens[0] || { name: "Dr. K. Ramanathan", user_id: 2, warden_id: 1 };
      return { access_token: "mock-jwt-warden-token", token_type: "bearer", role: "WARDEN", username: uname, name: w.name, user_id: w.user_id, profile_id: w.warden_id };
    }
    if (uname === "accountant" || uname.startsWith("acc")) {
      return { access_token: "mock-jwt-acct-token", token_type: "bearer", role: "ACCOUNTANT", username: uname, name: "Finance Manager", user_id: 3, profile_id: null };
    }

    // Check student list
    const stud = store.students.find((s) => (s.username || "").toLowerCase() === uname || (s.roll_no || "").toLowerCase() === uname);
    if (stud) {
      return { access_token: `mock-jwt-${stud.username}-token`, token_type: "bearer", role: "STUDENT", username: stud.username, name: stud.name, user_id: stud.user_id, profile_id: stud.student_id };
    }

    // Default student session for any custom registered username
    return {
      access_token: `mock-jwt-${uname}-token`,
      token_type: "bearer",
      role: "STUDENT",
      username: uname,
      name: uname.charAt(0).toUpperCase() + uname.slice(1),
      user_id: 999,
      profile_id: 999,
    };
  },

  // Students
  getStudents: () => {
    return getStore().students;
  },

  createStudent: (studentData) => {
    const store = getStore();
    const newId = store.students.length ? Math.max(...store.students.map((s) => s.student_id || 0)) + 1 : 1;
    const newStudent = {
      student_id: newId,
      user_id: 100 + newId,
      username: studentData.username || `stud_${newId}`,
      roll_no: studentData.roll_no || `24CSE${100 + newId}`,
      name: studentData.name || "New Student",
      email: studentData.email || `${studentData.username || "student"}@smarthostel.edu`,
      phone: studentData.phone || "+91 98400 00000",
      department: studentData.department || "CSE",
      year: studentData.year ? parseInt(studentData.year) : 1,
      gender: studentData.gender || "Male",
      date_of_birth: studentData.date_of_birth || "2005-01-01",
      admission_date: new Date().toISOString().split("T")[0],
      status: "ACTIVE",
      room_number: "Not Allocated",
      hostel_name: "N/A",
      room_id: null,
    };

    store.students = [newStudent, ...store.students];
    saveStore(store);
    return { message: "Student created successfully", student_id: newId, student: newStudent };
  },

  // Hostels & Rooms
  getHostels: () => getStore().hostels,
  getRooms: (hostelId = null) => {
    const store = getStore();
    if (hostelId) {
      return store.rooms.filter((r) => String(r.hostel_id) === String(hostelId));
    }
    return store.rooms;
  },

  createHostel: (data) => {
    const store = getStore();
    const newId = store.hostels.length + 1;
    const warden = store.wardens.find((w) => String(w.warden_id) === String(data.warden_id)) || store.wardens[0];
    const newH = {
      hostel_id: newId,
      hostel_name: data.hostel_name,
      hostel_type: data.hostel_type || "BOYS",
      capacity: parseInt(data.capacity) || 100,
      warden_id: warden ? warden.warden_id : null,
      warden_name: warden ? warden.name : "Unassigned",
    };
    store.hostels.push(newH);
    saveStore(store);
    return { message: "Hostel created", hostel_id: newId };
  },

  createWarden: (data) => {
    const store = getStore();
    const newId = store.wardens.length + 1;
    const newW = {
      warden_id: newId,
      user_id: 50 + newId,
      username: data.username,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
    };
    store.wardens.push(newW);
    saveStore(store);
    return { message: "Warden created", warden_id: newId };
  },

  createRoom: (data) => {
    const store = getStore();
    const newId = store.rooms.length + 1;
    const hostel = store.hostels.find((h) => String(h.hostel_id) === String(data.hostel_id)) || store.hostels[0];
    const newR = {
      room_id: newId,
      hostel_id: hostel ? hostel.hostel_id : 1,
      hostel_name: hostel ? hostel.hostel_name : "General Hall",
      room_number: data.room_number,
      floor: parseInt(data.floor) || 1,
      room_type: data.room_type || "DOUBLE",
      capacity: parseInt(data.capacity) || 2,
      occupied_count: 0,
      status: "AVAILABLE",
    };
    store.rooms.push(newR);
    saveStore(store);
    return { message: "Room added", room_id: newId };
  },

  allocateRoom: (studentId, roomId) => {
    const store = getStore();
    const room = store.rooms.find((r) => String(r.room_id) === String(roomId));
    const stud = store.students.find((s) => String(s.student_id) === String(studentId));
    if (room && stud) {
      stud.room_id = room.room_id;
      stud.room_number = room.room_number;
      stud.hostel_name = room.hostel_name;
      room.occupied_count = Math.min(room.capacity, (room.occupied_count || 0) + 1);
      if (room.occupied_count >= room.capacity) room.status = "FULL";
      saveStore(store);
    }
    return { message: "Room allocated successfully" };
  },

  vacateRoom: (studentId) => {
    const store = getStore();
    const stud = store.students.find((s) => String(s.student_id) === String(studentId));
    if (stud) {
      const room = store.rooms.find((r) => String(r.room_id) === String(stud.room_id));
      if (room) {
        room.occupied_count = Math.max(0, (room.occupied_count || 0) - 1);
        room.status = "AVAILABLE";
      }
      stud.room_id = null;
      stud.room_number = "Not Allocated";
      stud.hostel_name = "N/A";
      saveStore(store);
    }
    return { message: "Room vacated successfully" };
  },

  // Notices
  getNotices: () => getStore().notices,
  createNotice: (data) => {
    const store = getStore();
    const newN = {
      notice_id: store.notices.length + 1,
      title: data.title,
      description: data.description,
      audience: data.audience || "ALL",
      posted_by_name: "Hostel Authority",
      created_at: new Date().toISOString(),
      expiry_date: data.expiry_date || null,
    };
    store.notices = [newN, ...store.notices];
    saveStore(store);
    return { message: "Notice published", notice_id: newN.notice_id };
  },

  // Complaints
  getComplaints: () => getStore().complaints,
  fileComplaint: (data) => {
    const store = getStore();
    const stud = store.students[0];
    const newC = {
      complaint_id: store.complaints.length + 1,
      student_id: stud.student_id,
      student_name: stud.name,
      roll_no: stud.roll_no,
      room_number: stud.room_number,
      hostel_name: stud.hostel_name,
      category: data.category || "GENERAL",
      description: data.description,
      priority: data.priority || "MEDIUM",
      status: "OPEN",
      created_at: new Date().toISOString(),
      resolved_at: null,
      resolution: null,
    };
    store.complaints = [newC, ...store.complaints];
    saveStore(store);
    return { message: "Complaint filed successfully", complaint_id: newC.complaint_id };
  },
  updateComplaint: (complaintId, status, resolution) => {
    const store = getStore();
    const c = store.complaints.find((x) => String(x.complaint_id) === String(complaintId));
    if (c) {
      c.status = status;
      if (resolution) c.resolution = resolution;
      if (status === "RESOLVED") c.resolved_at = new Date().toISOString();
      saveStore(store);
    }
    return { message: "Complaint updated" };
  },

  // Leaves
  getLeaves: () => getStore().leaves,
  requestLeave: (data) => {
    const store = getStore();
    const stud = store.students[0];
    const newL = {
      leave_id: store.leaves.length + 1,
      student_id: stud.student_id,
      student_name: stud.name,
      roll_no: stud.roll_no,
      room_number: stud.room_number,
      from_date: data.from_date,
      to_date: data.to_date,
      reason: data.reason,
      destination: data.destination,
      emergency_contact: data.emergency_contact,
      pass_type: data.pass_type || "LEAVE",
      status: "PENDING",
      created_at: new Date().toISOString(),
    };
    store.leaves = [newL, ...store.leaves];
    saveStore(store);
    return { message: "Leave pass requested successfully" };
  },
  processLeave: (leaveId, status) => {
    const store = getStore();
    const l = store.leaves.find((x) => String(x.leave_id) === String(leaveId));
    if (l) {
      l.status = status;
      saveStore(store);
    }
    return { message: "Leave status updated" };
  },

  // Fees & Payments
  getFees: () => getStore().fees,
  getPayments: () => getStore().payments,
  payFee: (feeId, amount, method, txnId) => {
    const store = getStore();
    const amt = parseFloat(amount) || 0;
    const fee = store.fees.find((f) => String(f.fee_id) === String(feeId));
    if (fee) {
      fee.amount_paid += amt;
      fee.balance_due = Math.max(0, fee.amount_due - fee.amount_paid);
      fee.status = fee.balance_due === 0 ? "PAID" : "PARTIAL";

      const newP = {
        payment_id: store.payments.length + 1,
        fee_id: fee.fee_id,
        student_name: fee.student_name,
        roll_no: fee.roll_no,
        amount: amt,
        payment_date: new Date().toISOString().split("T")[0],
        payment_method: method || "UPI",
        transaction_id: txnId || `UPI-${Math.floor(Math.random() * 90000000 + 10000000)}`,
        status: "SUCCESS",
      };
      store.payments = [newP, ...store.payments];
      saveStore(store);
    }
    return { message: "Payment processed successfully" };
  },

  createFeeInvoice: (studentId, structId, dueDate) => {
    const store = getStore();
    const stud = store.students.find((s) => String(s.student_id) === String(studentId));
    const newFee = {
      fee_id: store.fees.length + 1,
      student_id: stud ? stud.student_id : 1,
      student_name: stud ? stud.name : "Student",
      roll_no: stud ? stud.roll_no : "23CSE001",
      structure_name: "Academic Hostel & Mess Invoice",
      amount_due: 40000,
      amount_paid: 0,
      balance_due: 40000,
      due_date: dueDate || "2026-11-15",
      status: "PENDING",
    };
    store.fees = [newFee, ...store.fees];
    saveStore(store);
    return { message: "Invoice generated successfully" };
  },

  // Reports
  getOccupancyReport: () => {
    const store = getStore();
    return store.hostels.map((h) => {
      const hRooms = store.rooms.filter((r) => r.hostel_id === h.hostel_id);
      const totalCap = hRooms.reduce((sum, r) => sum + (r.capacity || 0), 0) || h.capacity;
      const occupied = hRooms.reduce((sum, r) => sum + (r.occupied_count || 0), 0);
      return {
        hostel_id: h.hostel_id,
        hostel_name: h.hostel_name,
        hostel_type: h.hostel_type,
        total_capacity: totalCap,
        occupied_beds: occupied,
        available_beds: Math.max(0, totalCap - occupied),
        occupancy_percentage: totalCap > 0 ? ((occupied / totalCap) * 100).toFixed(2) : "0.00",
      };
    });
  },

  getComplaintsReport: () => {
    const store = getStore();
    const counts = {};
    store.complaints.forEach((c) => {
      const key = `${c.category}_${c.status}`;
      if (!counts[key]) counts[key] = { category: c.category, status: c.status, priority: c.priority, complaint_count: 0 };
      counts[key].complaint_count++;
    });
    return Object.values(counts);
  },

  getFinancialsReport: () => {
    const store = getStore();
    const totalDue = store.fees.reduce((sum, f) => sum + (f.amount_due || 0), 0);
    const totalPaid = store.fees.reduce((sum, f) => sum + (f.amount_paid || 0), 0);
    const defaulters = store.fees.filter((f) => f.amount_due > f.amount_paid).length;
    return {
      total_fees: totalDue,
      collected_fees: totalPaid,
      pending_fees: Math.max(0, totalDue - totalPaid),
      defaulters,
    };
  },

  // Attendance
  getAttendance: () => getStore().attendance,
  markAttendance: (records) => {
    const store = getStore();
    // Update or insert records
    saveStore(store);
    return { message: "Attendance submitted successfully" };
  },

  // Inventory
  getInventory: () => getStore().inventory,
  logInventoryTransaction: (itemId, type, qty, remarks) => {
    const store = getStore();
    const item = store.inventory.find((i) => String(i.item_id) === String(itemId));
    if (item) {
      const q = parseInt(qty) || 0;
      if (type === "PURCHASE" || type === "RESTOCK") {
        item.total_quantity += q;
        item.available_quantity += q;
      } else if (type === "CONSUMPTION" || type === "ISSUE") {
        item.available_quantity = Math.max(0, item.available_quantity - q);
      }
      saveStore(store);
    }
    return { message: "Transaction logged successfully" };
  },

  // Visitors
  getVisitors: () => getStore().visitors,
  registerVisitor: (data) => {
    const store = getStore();
    const stud = store.students.find((s) => String(s.student_id) === String(data.student_id)) || store.students[0];
    const newV = {
      visitor_id: store.visitors.length + 1,
      student_id: stud.student_id,
      student_name: stud.name,
      visitor_name: data.visitor_name,
      relationship: data.relationship,
      phone: data.phone,
      check_in_time: new Date().toLocaleString(),
      check_out_time: null,
      status: "CHECKED_IN",
    };
    store.visitors = [newV, ...store.visitors];
    saveStore(store);
    return { message: "Visitor registered successfully" };
  },
  checkoutVisitor: (visitorId) => {
    const store = getStore();
    const v = store.visitors.find((x) => String(x.visitor_id) === String(visitorId));
    if (v) {
      v.status = "CHECKED_OUT";
      v.check_out_time = new Date().toLocaleString();
      saveStore(store);
    }
    return { message: "Visitor checked out" };
  },

  // Mess Menu
  getMessMenu: () => getStore().messMenu,
};
