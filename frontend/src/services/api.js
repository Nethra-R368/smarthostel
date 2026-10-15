// SmartHostel API client wrapper
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const getHeaders = () => {
  const token = localStorage.getItem("sh_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorDetail = "API Request failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errorDetail;
    } catch (e) {}
    throw new Error(errorDetail);
  }
  return response.json();
};

export const api = {
  // Auth
  login: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(response);
  },

  // Common
  getHostels: async () => {
    const response = await fetch(`${API_BASE_URL}/common/hostels`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getRooms: async (hostelId = null) => {
    const url = hostelId ? `${API_BASE_URL}/common/rooms?hostel_id=${hostelId}` : `${API_BASE_URL}/common/rooms`;
    const response = await fetch(url, { headers: getHeaders() });
    return handleResponse(response);
  },

  getNotices: async (role = "ALL") => {
    const response = await fetch(`${API_BASE_URL}/common/notices?role=${role}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  // Student specific
  getStudentProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/student/profile`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getRoommates: async () => {
    const response = await fetch(`${API_BASE_URL}/student/roommates`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getStudentFees: async () => {
    const response = await fetch(`${API_BASE_URL}/student/fees`, { headers: getHeaders() });
    return handleResponse(response);
  },

  payFee: async (feeId, amount, method, txnId) => {
    const response = await fetch(`${API_BASE_URL}/student/payments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ fee_id: feeId, amount, payment_method: method, transaction_id: txnId }),
    });
    return handleResponse(response);
  },

  fileComplaint: async (category, description, priority) => {
    const response = await fetch(`${API_BASE_URL}/student/complaints`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ category, description, priority }),
    });
    return handleResponse(response);
  },

  getMyComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/student/complaints`, { headers: getHeaders() });
    return handleResponse(response);
  },

  requestLeave: async (fromDate, toDate, reason, destination, emergencyContact, passType = "LEAVE") => {
    const response = await fetch(`${API_BASE_URL}/student/leaves`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        from_date: fromDate,
        to_date: toDate,
        reason,
        destination,
        emergency_contact: emergencyContact,
        pass_type: passType,
      }),
    });
    return handleResponse(response);
  },

  getMyLeaves: async () => {
    const response = await fetch(`${API_BASE_URL}/student/leaves`, { headers: getHeaders() });
    return handleResponse(response);
  },

  requestRoomChange: async (requestedRoomId, reason) => {
    const response = await fetch(`${API_BASE_URL}/student/room-change`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ requested_room_id: requestedRoomId, reason }),
    });
    return handleResponse(response);
  },

  getMyAttendance: async () => {
    const response = await fetch(`${API_BASE_URL}/student/attendance`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getMessMenu: async () => {
    const response = await fetch(`${API_BASE_URL}/student/mess-menu`, { headers: getHeaders() });
    return handleResponse(response);
  },

  submitMessFeedback: async (quality, taste, cleanliness, comments) => {
    const response = await fetch(`${API_BASE_URL}/student/mess-feedback`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ food_quality: quality, taste, cleanliness, comments }),
    });
    return handleResponse(response);
  },

  // Warden specific
  allocateRoom: async (studentId, roomId) => {
    const response = await fetch(`${API_BASE_URL}/warden/allocate-room`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ student_id: studentId, room_id: roomId }),
    });
    return handleResponse(response);
  },

  vacateRoom: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/warden/vacate-room?student_id=${studentId}`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getWardenComplaints: async () => {
    const response = await fetch(`${API_BASE_URL}/warden/complaints`, { headers: getHeaders() });
    return handleResponse(response);
  },

  updateComplaint: async (complaintId, status, resolution = null) => {
    const response = await fetch(`${API_BASE_URL}/warden/complaints/${complaintId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, resolution }),
    });
    return handleResponse(response);
  },

  getWardenLeaves: async () => {
    const response = await fetch(`${API_BASE_URL}/warden/leaves`, { headers: getHeaders() });
    return handleResponse(response);
  },

  processLeave: async (leaveId, status) => {
    const response = await fetch(`${API_BASE_URL}/warden/leaves/${leaveId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status, action_by: 0 }), // Backend resolves action_by from token
    });
    return handleResponse(response);
  },

  getRoomChangeRequests: async () => {
    const response = await fetch(`${API_BASE_URL}/warden/room-changes`, { headers: getHeaders() });
    return handleResponse(response);
  },

  processRoomChange: async (requestId, status) => {
    const response = await fetch(`${API_BASE_URL}/warden/room-changes/${requestId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  markAttendance: async (date, records) => {
    const response = await fetch(`${API_BASE_URL}/warden/attendance`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ date, records }),
    });
    return handleResponse(response);
  },

  getAttendanceByDate: async (dateStr) => {
    const response = await fetch(`${API_BASE_URL}/warden/attendance?date_val=${dateStr}`, { headers: getHeaders() });
    return handleResponse(response);
  },

  registerVisitor: async (studentId, visitorName, relationship, phone) => {
    const response = await fetch(`${API_BASE_URL}/warden/visitors`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ student_id: studentId, visitor_name: visitorName, relationship, phone }),
    });
    return handleResponse(response);
  },

  checkoutVisitor: async (visitorId) => {
    const response = await fetch(`${API_BASE_URL}/warden/visitors/${visitorId}`, {
      method: "PUT",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  getVisitors: async () => {
    const response = await fetch(`${API_BASE_URL}/warden/visitors`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createNotice: async (title, description, audience, expiryDate = null) => {
    const response = await fetch(`${API_BASE_URL}/warden/notices`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ title, description, audience, expiry_date: expiryDate }),
    });
    return handleResponse(response);
  },

  // Accountant specific
  getAllFees: async () => {
    const response = await fetch(`${API_BASE_URL}/accountant/fees`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createFeeInvoice: async (studentId, feeStructureId, dueDate) => {
    const response = await fetch(
      `${API_BASE_URL}/accountant/fees/invoice?student_id=${studentId}&fee_structure_id=${feeStructureId}&due_date=${dueDate}`,
      { method: "POST", headers: getHeaders() }
    );
    return handleResponse(response);
  },

  getDefaulters: async () => {
    const response = await fetch(`${API_BASE_URL}/accountant/defaulters`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getAllPayments: async () => {
    const response = await fetch(`${API_BASE_URL}/accountant/payments`, { headers: getHeaders() });
    return handleResponse(response);
  },

  recordManualPayment: async (feeId, amount, method, txnId) => {
    const response = await fetch(`${API_BASE_URL}/accountant/payments/record`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ fee_id: feeId, amount, payment_method: method, transaction_id: txnId }),
    });
    return handleResponse(response);
  },

  // Admin specific
  getOccupancyReport: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/occupancy`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getComplaintsReport: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/complaints`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getFinancialsReport: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/reports/financials`, { headers: getHeaders() });
    return handleResponse(response);
  },

  getAllStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/students`, { headers: getHeaders() });
    return handleResponse(response);
  },

  createStudent: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/admin/students`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  createWarden: async (wardenData) => {
    const url = `${API_BASE_URL}/admin/wardens?username=${encodeURIComponent(
      wardenData.username
    )}&password_hash_val=${encodeURIComponent(wardenData.password)}&name=${encodeURIComponent(
      wardenData.name
    )}&email=${encodeURIComponent(wardenData.email)}&phone=${encodeURIComponent(wardenData.phone || "")}`;
    const response = await fetch(url, { method: "POST", headers: getHeaders() });
    return handleResponse(response);
  },

  createHostel: async (hostelData) => {
    const response = await fetch(`${API_BASE_URL}/admin/hostels`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(hostelData),
    });
    return handleResponse(response);
  },

  createRoom: async (roomData) => {
    const response = await fetch(`${API_BASE_URL}/admin/rooms`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(roomData),
    });
    return handleResponse(response);
  },

  getInventory: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/inventory`, { headers: getHeaders() });
    return handleResponse(response);
  },

  logInventoryTransaction: async (itemId, type, quantity, remarks) => {
    const response = await fetch(`${API_BASE_URL}/admin/inventory/transaction`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ item_id: itemId, transaction_type: type, quantity, remarks }),
    });
    return handleResponse(response);
  },
};
