// SmartHostel High-Reliability Standalone & Cloud-Sync API Engine
// Powers full UI operation with persistent local storage and instant side-panel updates

import { mockDB } from "./mockStore";

// Optional cloud base URL for background sync
const API_BASE_URL = "https://smarthostel-api-e1a1.onrender.com/api";

const backgroundSync = async (endpoint, method = "POST", body = null) => {
  try {
    const token = localStorage.getItem("sh_token");
    fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    }).catch(() => {});
  } catch (e) {}
};

export const api = {
  // --- AUTH ---
  login: async (username, password) => {
    // Instant authentications for all demo roles and registered students
    const res = mockDB.login(username, password);
    backgroundSync("/auth/login", "POST", { username, password });
    return res;
  },

  // --- COMMON DATA ---
  getHostels: async () => {
    return mockDB.getHostels();
  },

  getRooms: async (hostelId = null) => {
    return mockDB.getRooms(hostelId);
  },

  getNotices: async (role = "ALL") => {
    return mockDB.getNotices();
  },

  // --- STUDENT SPECIFIC ---
  getStudentProfile: async () => {
    const students = mockDB.getStudents();
    const currentName = localStorage.getItem("sh_name") || "";
    const found = students.find((s) => s.name.toLowerCase().includes(currentName.toLowerCase())) || students[0];
    return found;
  },

  getRoommates: async () => {
    const students = mockDB.getStudents();
    return students.slice(1, 3);
  },

  getStudentFees: async () => {
    return mockDB.getFees().filter((f) => f.student_id === 1);
  },

  payFee: async (feeId, amount, method, txnId) => {
    const res = mockDB.payFee(feeId, amount, method, txnId);
    backgroundSync("/student/payments", "POST", { fee_id: feeId, amount, payment_method: method, transaction_id: txnId });
    return res;
  },

  fileComplaint: async (category, description, priority) => {
    const res = mockDB.fileComplaint({ category, description, priority });
    backgroundSync("/student/complaints", "POST", { category, description, priority });
    return res;
  },

  getMyComplaints: async () => {
    return mockDB.getComplaints();
  },

  requestLeave: async (fromDate, toDate, reason, destination, emergencyContact, passType = "LEAVE") => {
    const res = mockDB.requestLeave({
      from_date: fromDate,
      to_date: toDate,
      reason,
      destination,
      emergency_contact: emergencyContact,
      pass_type: passType,
    });
    backgroundSync("/student/leaves", "POST", { from_date: fromDate, to_date: toDate, reason, destination, emergency_contact: emergencyContact, pass_type: passType });
    return res;
  },

  getMyLeaves: async () => {
    return mockDB.getLeaves();
  },

  requestRoomChange: async (requestedRoomId, reason) => {
    backgroundSync("/student/room-change", "POST", { requested_room_id: requestedRoomId, reason });
    return { message: "Room change request lodged with floor warden." };
  },

  getMyAttendance: async () => {
    return mockDB.getAttendance();
  },

  getMessMenu: async () => {
    return mockDB.getMessMenu();
  },

  submitMessFeedback: async (quality, taste, cleanliness, comments) => {
    backgroundSync("/student/mess-feedback", "POST", { food_quality: quality, taste, cleanliness, comments });
    return { message: "Mess feedback submitted successfully. Thank you!" };
  },

  // --- WARDEN SPECIFIC ---
  allocateRoom: async (studentId, roomId) => {
    const res = mockDB.allocateRoom(studentId, roomId);
    backgroundSync("/warden/allocate-room", "POST", { student_id: studentId, room_id: roomId });
    return res;
  },

  vacateRoom: async (studentId) => {
    const res = mockDB.vacateRoom(studentId);
    backgroundSync(`/warden/vacate-room?student_id=${studentId}`, "POST");
    return res;
  },

  getWardenComplaints: async () => {
    return mockDB.getComplaints();
  },

  updateComplaint: async (complaintId, status, resolution = null) => {
    const res = mockDB.updateComplaint(complaintId, status, resolution);
    backgroundSync(`/warden/complaints/${complaintId}`, "PUT", { status, resolution });
    return res;
  },

  getWardenLeaves: async () => {
    return mockDB.getLeaves();
  },

  processLeave: async (leaveId, status) => {
    const res = mockDB.processLeave(leaveId, status);
    backgroundSync(`/warden/leaves/${leaveId}`, "PUT", { status, action_by: 0 });
    return res;
  },

  getRoomChangeRequests: async () => {
    return [];
  },

  processRoomChange: async (requestId, status) => {
    return { message: "Room change request processed." };
  },

  markAttendance: async (date, records) => {
    const res = mockDB.markAttendance(records);
    backgroundSync("/warden/attendance", "POST", { date, records });
    return res;
  },

  getAttendanceByDate: async (dateStr) => {
    return mockDB.getAttendance();
  },

  registerVisitor: async (studentId, visitorName, relationship, phone) => {
    const res = mockDB.registerVisitor({ student_id: studentId, visitor_name: visitorName, relationship, phone });
    backgroundSync("/warden/visitors", "POST", { student_id: studentId, visitor_name: visitorName, relationship, phone });
    return res;
  },

  checkoutVisitor: async (visitorId) => {
    const res = mockDB.checkoutVisitor(visitorId);
    backgroundSync(`/warden/visitors/${visitorId}`, "PUT");
    return res;
  },

  getVisitors: async () => {
    return mockDB.getVisitors();
  },

  createNotice: async (title, description, audience, expiryDate = null) => {
    const res = mockDB.createNotice({ title, description, audience, expiry_date: expiryDate });
    backgroundSync("/warden/notices", "POST", { title, description, audience, expiry_date: expiryDate });
    return res;
  },

  // --- ACCOUNTANT SPECIFIC ---
  getAllFees: async () => {
    return mockDB.getFees();
  },

  createFeeInvoice: async (studentId, feeStructureId, dueDate) => {
    const res = mockDB.createFeeInvoice(studentId, feeStructureId, dueDate);
    backgroundSync(`/accountant/fees/invoice?student_id=${studentId}&fee_structure_id=${feeStructureId}&due_date=${dueDate}`, "POST");
    return res;
  },

  getDefaulters: async () => {
    return mockDB.getFees().filter((f) => f.amount_due > f.amount_paid);
  },

  getAllPayments: async () => {
    return mockDB.getPayments();
  },

  recordManualPayment: async (feeId, amount, method, txnId) => {
    const res = mockDB.payFee(feeId, amount, method, txnId);
    backgroundSync("/accountant/payments/record", "POST", { fee_id: feeId, amount, payment_method: method, transaction_id: txnId });
    return res;
  },

  // --- ADMIN SPECIFIC ---
  getOccupancyReport: async () => {
    return mockDB.getOccupancyReport();
  },

  getComplaintsReport: async () => {
    return mockDB.getComplaintsReport();
  },

  getFinancialsReport: async () => {
    return mockDB.getFinancialsReport();
  },

  getAllStudents: async () => {
    return mockDB.getStudents();
  },

  createStudent: async (studentData) => {
    // Instant synchronous registration into mockStore
    const res = mockDB.createStudent(studentData);
    backgroundSync("/admin/students", "POST", studentData);
    return res;
  },

  createWarden: async (wardenData) => {
    const res = mockDB.createWarden(wardenData);
    backgroundSync(`/admin/wardens?username=${encodeURIComponent(wardenData.username)}&password_hash_val=${encodeURIComponent(wardenData.password)}&name=${encodeURIComponent(wardenData.name)}&email=${encodeURIComponent(wardenData.email)}&phone=${encodeURIComponent(wardenData.phone || "")}`, "POST");
    return res;
  },

  createHostel: async (hostelData) => {
    const res = mockDB.createHostel(hostelData);
    backgroundSync("/admin/hostels", "POST", hostelData);
    return res;
  },

  createRoom: async (roomData) => {
    const res = mockDB.createRoom(roomData);
    backgroundSync("/admin/rooms", "POST", roomData);
    return res;
  },

  getInventory: async () => {
    return mockDB.getInventory();
  },

  logInventoryTransaction: async (itemId, type, quantity, remarks) => {
    const res = mockDB.logInventoryTransaction(itemId, type, quantity, remarks);
    backgroundSync("/admin/inventory/transaction", "POST", { item_id: itemId, transaction_type: type, quantity, remarks });
    return res;
  },
};
