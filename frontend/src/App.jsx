import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  DoorOpen,
  IndianRupee,
  FileWarning,
  ClipboardList,
  LogOut,
  User,
  Menu,
  Bell,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Plus,
  RefreshCw,
  Star,
  Info,
  Package,
  Megaphone,
  Check,
  X,
  Sparkles
} from "lucide-react";
import { api } from "./services/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("sh_token") || null);
  const [userRole, setUserRole] = useState(localStorage.getItem("sh_role") || null);
  const [userName, setUserName] = useState(localStorage.getItem("sh_name") || "");
  const [profileId, setProfileId] = useState(localStorage.getItem("sh_profile_id") || null);
  
  const [currentTab, setTab] = useState("dashboard");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // App-wide data caches
  const [hostels, setHostels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({ total_fees: 0, collected_fees: 0, pending_fees: 0, defaulters: 0 });
  const [occupancyReport, setOccupancyReport] = useState([]);
  const [complaintReport, setComplaintReport] = useState([]);
  
  // Student caches
  const [studentProfile, setStudentProfile] = useState(null);
  const [roommates, setRoommates] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [studentComplaints, setStudentComplaints] = useState([]);
  const [studentLeaves, setStudentLeaves] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [messMenu, setMessMenu] = useState([]);
  
  // Warden caches
  const [wardenComplaints, setWardenComplaints] = useState([]);
  const [wardenLeaves, setWardenLeaves] = useState([]);
  const [wardenRoomChanges, setWardenRoomChanges] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [attendanceSheet, setAttendanceSheet] = useState([]);
  const [wardenStudents, setWardenStudents] = useState([]);
  
  // Accountant caches
  const [allFees, setAllFees] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  
  // Admin caches
  const [adminStudents, setAdminStudents] = useState([]);
  const [inventory, setInventory] = useState([]);
  
  // Form States
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  
  // Load initial configurations
  useEffect(() => {
    if (token) {
      loadCommonData();
      loadRoleData();
    }
  }, [token, userRole]);

  // Flash alerts auto-clear
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const loadCommonData = async () => {
    try {
      const hData = await api.getHostels();
      setHostels(hData);
      const rData = await api.getRooms();
      setRooms(rData);
      const nData = await api.getNotices(userRole);
      setNotices(nData);
    } catch (err) {
      console.error("Error fetching common database registries: ", err);
    }
  };

  const loadRoleData = async () => {
    try {
      if (userRole === "STUDENT") {
        const prof = await api.getStudentProfile();
        setStudentProfile(prof);
        const rmates = await api.getRoommates();
        setRoommates(rmates);
        const fees = await api.getStudentFees();
        setStudentFees(fees);
        const comps = await api.getMyComplaints();
        setStudentComplaints(comps);
        const lvs = await api.getMyLeaves();
        setStudentLeaves(lvs);
        const att = await api.getMyAttendance();
        setStudentAttendance(att);
        const menu = await api.getMessMenu();
        setMessMenu(menu);
      } else if (userRole === "WARDEN") {
        const comps = await api.getWardenComplaints();
        setWardenComplaints(comps);
        const lvs = await api.getWardenLeaves();
        setWardenLeaves(lvs);
        const rc = await api.getRoomChangeRequests();
        setWardenRoomChanges(rc);
        const vsts = await api.getVisitors();
        setVisitors(vsts);
        const studs = await api.getAllStudents(); // Shared warden view
        setWardenStudents(studs);
        const attToday = await api.getAttendanceByDate(new Date().toISOString().split('T')[0]);
        setAttendanceSheet(attToday);
        const inv = await api.getInventory();
        setInventory(inv);
        const menu = await api.getMessMenu();
        setMessMenu(menu);
      } else if (userRole === "ACCOUNTANT") {
        const fees = await api.getAllFees();
        setAllFees(fees);
        const pays = await api.getAllPayments();
        setAllPayments(pays);
        const defs = await api.getDefaulters();
        setDefaulters(defs);
        const fStats = await api.getFinancialsReport();
        setStats(fStats);
      } else if (userRole === "ADMIN") {
        const oRep = await api.getOccupancyReport();
        setOccupancyReport(oRep);
        const cRep = await api.getComplaintsReport();
        setComplaintReport(cRep);
        const fStats = await api.getFinancialsReport();
        setStats(fStats);
        const studs = await api.getAllStudents();
        setAdminStudents(studs);
        const inv = await api.getInventory();
        setInventory(inv);
      }
    } catch (err) {
      setErrorMsg("Failed to sync backend role-specific datasets: " + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.login(loginForm.username, loginForm.password);
      localStorage.setItem("sh_token", response.access_token);
      localStorage.setItem("sh_role", response.role);
      localStorage.setItem("sh_name", response.name);
      localStorage.setItem("sh_profile_id", response.profile_id || "");
      
      setToken(response.access_token);
      setUserRole(response.role);
      setUserName(response.name);
      setProfileId(response.profile_id);
      
      setTab("dashboard");
      setSuccessMsg(`Welcome back, ${response.name}!`);
    } catch (err) {
      setErrorMsg("Login failed: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sh_token");
    localStorage.removeItem("sh_role");
    localStorage.removeItem("sh_name");
    localStorage.removeItem("sh_profile_id");
    setToken(null);
    setUserRole(null);
    setUserName("");
    setProfileId(null);
    setTab("dashboard");
  };

  const quickLogin = async (username, password) => {
    try {
      const response = await api.login(username, password);
      localStorage.setItem("sh_token", response.access_token);
      localStorage.setItem("sh_role", response.role);
      localStorage.setItem("sh_name", response.name);
      localStorage.setItem("sh_profile_id", response.profile_id || "");
      
      setToken(response.access_token);
      setUserRole(response.role);
      setUserName(response.name);
      setProfileId(response.profile_id);
      
      setTab("dashboard");
      setSuccessMsg(`Demo Session: Logged in as ${response.role}`);
    } catch (err) {
      setErrorMsg("Demo Login failed: " + err.message);
    }
  };

  // --- SUBMISSION CALLS ---
  // Student Actions
  const submitPayment = async (feeId, amount) => {
    try {
      const method = "UPI";
      const txnId = "UPI-" + Math.floor(Math.random() * 90000000 + 10000000);
      await api.payFee(feeId, amount, method, txnId);
      setSuccessMsg("Payment processed successfully! Triggers updated database.");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Payment failed: " + err.message);
    }
  };

  const submitComplaint = async (category, desc, priority) => {
    try {
      await api.fileComplaint(category, desc, priority);
      setSuccessMsg("Complaint filed successfully! Assigned to Warden.");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to file complaint: " + err.message);
    }
  };

  const submitLeave = async (from, to, reason, dest, contact, passType = "LEAVE") => {
    try {
      await api.requestLeave(from, to, reason, dest, contact, passType);
      setSuccessMsg("Leave/Pass request submitted! Awaiting warden approval.");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to submit leave/pass: " + err.message);
    }
  };

  const submitRoomChange = async (roomId, reason) => {
    try {
      await api.requestRoomChange(roomId, reason);
      setSuccessMsg("Room change request filed! Undergoing transaction reviews.");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to apply: " + err.message);
    }
  };

  const submitFeedback = async (q, t, c, comment) => {
    try {
      await api.submitMessFeedback(q, t, c, comment);
      setSuccessMsg("Mess rating logged! Thank you.");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Feedback failed: " + err.message);
    }
  };

  // Warden Actions
  const processWardenLeave = async (leaveId, status) => {
    try {
      await api.processLeave(leaveId, status);
      setSuccessMsg(`Leave request ${status.toLowerCase()}!`);
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to process leave: " + err.message);
    }
  };

  const processWardenRoomChange = async (reqId, status) => {
    try {
      await api.processRoomChange(reqId, status);
      setSuccessMsg(`Room Change Request ${status.toLowerCase()}! Transaction commited.`);
      loadRoleData();
      loadCommonData();
    } catch (err) {
      setErrorMsg("Failed to process request: " + err.message);
    }
  };

  const processWardenComplaint = async (compId, status, resolution = "") => {
    try {
      await api.updateComplaint(compId, status, resolution);
      setSuccessMsg(`Complaint status updated to ${status}!`);
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to update complaint: " + err.message);
    }
  };

  const handleVisitorCheckin = async (studentId, name, rel, phone) => {
    try {
      await api.registerVisitor(studentId, name, rel, phone);
      setSuccessMsg("Visitor checked-in successfully!");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Visitor register failed: " + err.message);
    }
  };

  const handleVisitorCheckout = async (visitorId) => {
    try {
      await api.checkoutVisitor(visitorId);
      setSuccessMsg("Visitor checked-out!");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Checkout failed: " + err.message);
    }
  };

  const handleMarkAttendance = async (studentId, status) => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await api.markAttendance(todayStr, [{ student_id: studentId, status }]);
      setSuccessMsg("Attendance log written!");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Mark attendance failed: " + err.message);
    }
  };

  const handleWardenNotice = async (title, desc, aud, exp) => {
    try {
      await api.createNotice(title, desc, aud, exp || null);
      setSuccessMsg("Notice board announcement added!");
      loadCommonData();
    } catch (err) {
      setErrorMsg("Warden notice failed: " + err.message);
    }
  };

  // Accountant Actions
  const handleCreateInvoice = async (studId, structId, due) => {
    try {
      await api.createFeeInvoice(studId, structId, due);
      setSuccessMsg("Fee structures invoiced to student ledger!");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to generate invoice: " + err.message);
    }
  };

  // Admin Actions
  const handleCreateStudent = async (studForm) => {
    try {
      await api.createStudent(studForm);
      setSuccessMsg("Student created and user account registered!");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to create student: " + err.message);
    }
  };

  const handleCreateWarden = async (wardForm) => {
    try {
      await api.createWarden(wardForm);
      setSuccessMsg("Warden registered successfully!");
      loadCommonData();
    } catch (err) {
      setErrorMsg("Failed to create warden: " + err.message);
    }
  };

  const handleCreateHostel = async (hForm) => {
    try {
      await api.createHostel(hForm);
      setSuccessMsg("Hostel registry added!");
      loadCommonData();
    } catch (err) {
      setErrorMsg("Failed to create hostel: " + err.message);
    }
  };

  const handleCreateRoom = async (rForm) => {
    try {
      await api.createRoom(rForm);
      setSuccessMsg("Room successfully added to hostel!");
      loadCommonData();
    } catch (err) {
      setErrorMsg("Failed to create room: " + err.message);
    }
  };

  const handleInventoryTx = async (itemId, type, qty, rem) => {
    try {
      await api.logInventoryTransaction(itemId, type, qty, rem);
      setSuccessMsg("Inventory balance adjusted!");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Inventory update failed: " + err.message);
    }
  };

  // --- RENDERS ---
  if (!token) {
    return (
      <LoginScreen
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        onSubmit={handleLogin}
        errorMsg={errorMsg}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-light-bg text-light-textMain">
      {/* 1. Sidebar Nav */}
      <Sidebar role={userRole} currentTab={currentTab} setTab={setTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* 2. Top Header */}
        <Header userName={userName} role={userRole} onLogout={handleLogout} onRefresh={loadRoleData} />

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red flex items-center gap-2">
            <XCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-4 rounded-lg bg-brand-green/10 border border-brand-green/20 text-brand-green flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        {/* 3. Render Tab Contents */}
        <main className="flex-1 p-6">
          {currentTab === "dashboard" && (
            <DashboardPanel
              role={userRole}
              stats={stats}
              occupancy={occupancyReport}
              complaints={complaintReport}
              profile={studentProfile}
              notices={notices}
              studentFees={studentFees}
              studentComplaints={studentComplaints}
            />
          )}

          {currentTab === "rooms" && (
            <RoomsPanel
              role={userRole}
              rooms={rooms}
              hostels={hostels}
              roommates={roommates}
              students={userRole === "WARDEN" ? wardenStudents : adminStudents}
              onAllocate={allocateRoom_API}
              onVacate={vacateRoom_API}
            />
          )}

          {currentTab === "fees" && (
            <FeesPanel
              role={userRole}
              fees={studentFees}
              allFees={allFees}
              payments={allPayments}
              defaulters={defaulters}
              students={adminStudents}
              onPay={submitPayment}
              onCreateInvoice={handleCreateInvoice}
              onRecordManual={recordManualPayment_API}
            />
          )}

          {currentTab === "complaints" && (
            <ComplaintsPanel
              role={userRole}
              studentComplaints={studentComplaints}
              wardenComplaints={wardenComplaints}
              onSubmit={submitComplaint}
              onResolve={processWardenComplaint}
            />
          )}

          {currentTab === "leaves" && (
            <LeavesPanel
              role={userRole}
              leaves={studentLeaves}
              wardenLeaves={wardenLeaves}
              onSubmit={submitLeave}
              onProcess={processWardenLeave}
            />
          )}

          {currentTab === "visitors" && (
            <VisitorsPanel
              role={userRole}
              visitors={visitors}
              students={userRole === "WARDEN" ? wardenStudents : adminStudents}
              onSubmit={handleVisitorCheckin}
              onCheckout={handleVisitorCheckout}
            />
          )}

          {currentTab === "attendance" && (
            <AttendancePanel
              role={userRole}
              records={studentAttendance}
              students={userRole === "WARDEN" ? wardenStudents : adminStudents}
              onMark={handleMarkAttendance}
            />
          )}

          {currentTab === "mess" && (
            <MessPanel
              role={userRole}
              menu={messMenu}
              hostels={hostels}
              onSubmitFeedback={submitFeedback}
              studentProfile={studentProfile}
            />
          )}

          {currentTab === "inventory" && (
            <InventoryPanel
              role={userRole}
              inventory={inventory}
              hostels={hostels}
              onTx={handleInventoryTx}
            />
          )}

          {currentTab === "notices" && (
            <NoticesPanel
              role={userRole}
              notices={notices}
              onSubmit={handleWardenNotice}
            />
          )}

          {currentTab === "students" && (
            <StudentsPanel
              role={userRole}
              students={adminStudents}
              onSubmit={handleCreateStudent}
            />
          )}

          {currentTab === "hostels" && (
            <HostelsPanel
              role={userRole}
              hostels={hostels}
              wardens={wardens}
              onCreateHostel={handleCreateHostel}
              onCreateWarden={handleCreateWarden}
              onCreateRoom={handleCreateRoom}
            />
          )}
        </main>
      </div>
    </div>
  );

  // Helper bindings for APIs that bypass local cache directly
  async function allocateRoom_API(studId, rmId) {
    try {
      await api.allocateRoom(studId, rmId);
      setSuccessMsg("Room successfully allocated via database stored procedure!");
      loadCommonData();
      loadRoleData();
    } catch (err) {
      setErrorMsg("Allocation failed: " + err.message);
    }
  }

  async function vacateRoom_API(studId) {
    try {
      await api.vacateRoom(studId);
      setSuccessMsg("Student vacated via transaction rollback function!");
      loadCommonData();
      loadRoleData();
    } catch (err) {
      setErrorMsg("Vacate room failed: " + err.message);
    }
  }

  async function recordManualPayment_API(feeId, amount, method, txnId) {
    try {
      await api.recordManualPayment(feeId, amount, method, txnId);
      setSuccessMsg("Manual payment ledger record inserted! Triggers executed.");
      loadRoleData();
    } catch (err) {
      setErrorMsg("Failed to write transaction: " + err.message);
    }
  }
}

// ============================================================================
// LOGIN SCREEN COMPONENT
// ============================================================================
function LoginScreen({ loginForm, setLoginForm, onSubmit, errorMsg }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white via-light-bg to-light-bg p-6 relative overflow-hidden">
      {/* Soft warm-tan glowing decorative elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-brand-brown/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-tan/5 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md theme-card p-8 rounded-2xl relative z-10">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-brand-brown flex items-center justify-center text-white font-extrabold shadow-sm">
            H
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-light-textMain">
              SmartHostel
            </h1>
            <p className="text-xs text-brand-brown tracking-wider font-semibold uppercase">Cloud Management Hub</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1.5 tracking-wider">Username</label>
            <input
              type="text"
              required
              className="w-full theme-input"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1.5 tracking-wider">Password</label>
            <input
              type="password"
              required
              className="w-full theme-input"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full theme-btn-primary py-3 flex items-center justify-center gap-2 mt-2">
            Sign In Securely
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR NAV COMPONENT
// ============================================================================
function Sidebar({ role, currentTab, setTab }) {
  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["STUDENT", "WARDEN", "ACCOUNTANT", "ADMIN"] },
    { id: "students", label: "Students", icon: Users, roles: ["ADMIN"] },
    { id: "hostels", label: "Hostels & Wardens", icon: Megaphone, roles: ["ADMIN"] }, // Using Megaphone as placeholder or similar
    { id: "rooms", label: "Rooms & Allocation", icon: DoorOpen, roles: ["STUDENT", "WARDEN", "ADMIN"] },
    { id: "fees", label: "Fee Ledgers", icon: IndianRupee, roles: ["STUDENT", "ACCOUNTANT", "ADMIN"] },
    { id: "complaints", label: "Complaints", icon: FileWarning, roles: ["STUDENT", "WARDEN", "ADMIN"] },
    { id: "attendance", label: "Attendance", icon: ClipboardList, roles: ["STUDENT", "WARDEN"] },
    { id: "visitors", label: "Visitors", icon: Users, roles: ["WARDEN"] },
    { id: "leaves", label: "Leave Logs", icon: Calendar, roles: ["STUDENT", "WARDEN"] },
    { id: "inventory", label: "Asset Inventory", icon: Package, roles: ["WARDEN", "ADMIN"] },
    { id: "mess", label: "Mess Hall", icon: Star, roles: ["STUDENT", "WARDEN"] },
    { id: "notices", label: "Notice Board", icon: Megaphone, roles: ["STUDENT", "WARDEN"] },
  ];

  const filteredTabs = tabs.filter((t) => t.roles.includes(role));

  return (
    <aside className="w-64 bg-light-card border-r border-light-border/80 flex flex-col shrink-0">
      <div className="p-6 border-b border-light-border/80 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-brand-brown flex items-center justify-center text-dark-bg font-extrabold shadow-sm text-sm">
          S
        </div>
        <div>
          <span className="font-extrabold text-lg text-light-textMain tracking-wide block leading-none">SmartHostel</span>
          <span className="text-[10px] text-brand-brown uppercase font-bold tracking-wider">DBMS Cloud V1</span>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredTabs.map((t) => {
          const Icon = t.icon;
          const isActive = currentTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold tracking-wide transition-all ${
                isActive
                  ? "bg-gradient-to-r from-brand-brown/20 to-brand-tan/10 border-l-2 border-brand-brown text-light-textMain shadow-sm/5"
                  : "text-light-textMuted hover:text-light-textMain hover:bg-dark-border/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-brand-brown" : ""}`} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================
function Header({ userName, role, onLogout, onRefresh }) {
  return (
    <header className="h-16 border-b border-light-border/80 bg-light-card/40 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2.5 py-1 rounded-full font-extrabold bg-dark-border border border-light-border text-brand-brown uppercase tracking-wider">
          {role}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-dark-border/40 rounded-lg text-light-textMuted hover:text-light-textMain transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4 animate-spin-hover" />
        </button>

        <div className="flex items-center gap-3 border-l border-light-border/80 pl-4">
          <div className="text-right">
            <span className="block text-sm font-bold text-light-textMain">{userName}</span>
            <span className="text-[10px] text-light-textMuted block font-semibold uppercase tracking-wider">{role.toLowerCase()}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-dark-border border border-light-border flex items-center justify-center text-brand-brown font-bold">
            {userName[0]}
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 hover:bg-brand-red/10 border border-transparent hover:border-brand-red/20 rounded-lg text-light-textMuted hover:text-brand-red transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

// ============================================================================
// TAB PANELS IMPLEMENTATIONS
// ============================================================================

// 1. DASHBOARD PANEL
function DashboardPanel({ role, stats, occupancy, complaints, profile, notices, studentFees, studentComplaints }) {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">System Dashboard</h2>
        <p className="text-sm text-light-textMuted">Overview & diagnostics reports</p>
      </div>

      {/* Role-Specific Stats Grid */}
      {role === "ADMIN" && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard title="Total Capacity" value="350 Beds" desc="Across 3 Halls" color="indigo" />
            <StatCard title="Financial Collections" value={`₹${stats.collected_fees.toLocaleString()}`} desc="Total Invoiced ledger paid" color="emerald" />
            <StatCard title="Fees Pending" value={`₹${stats.pending_fees.toLocaleString()}`} desc="Defaulters accounts" color="rose" />
            <StatCard title="Defaulters Count" value={`${stats.defaulters} Students`} desc="Unpaid invoices count" color="amber" />
          </div>

          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Occupancy SVG Chart */}
            <div className="theme-card p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Hostel Occupancy Analysis</h3>
              <div className="space-y-4">
                {occupancy.map((o) => (
                  <div key={o.hostel_name}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span>{o.hostel_name} ({o.hostel_type})</span>
                      <span>{o.occupied_beds}/{o.total_capacity} beds ({o.occupancy_percentage}%)</span>
                    </div>
                    <div className="w-full bg-light-bg h-2.5 rounded-full overflow-hidden border border-light-border">
                      <div
                        className="bg-brand-brown h-full"
                        style={{ width: `${o.occupancy_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Complaints SVG Chart */}
            <div className="theme-card p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Complaints Category Distribution</h3>
              {complaints.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-light-textMuted font-semibold">
                  All systems operating normally. Zero complaints.
                </div>
              ) : (
                <div className="space-y-3">
                  {complaints.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs border-b border-light-border/50 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-brown shadow-sm"></span>
                        <span className="font-semibold text-light-textMain">{c.category}</span>
                      </div>
                      <span className="text-light-textMuted">Priority: {c.priority}</span>
                      <span className="px-2 py-0.5 rounded bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo font-bold">{c.complaint_count} Open</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {role === "STUDENT" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Room Assignment */}
          <div className="theme-card p-5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-brand-brown tracking-wider uppercase">My Allocation</span>
              <h3 className="text-2xl font-extrabold text-light-textMain mt-1">{profile?.room_number || "Not Assigned"}</h3>
              <p className="text-xs text-light-textMuted mt-0.5">{profile?.hostel_name || "Hostel allocation pending"}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-light-border/50 text-xs flex justify-between text-light-textMuted">
              <span>Status: <strong className="text-brand-green">{profile?.status}</strong></span>
              <span>Admission: {profile?.admission_date}</span>
            </div>
          </div>

          {/* Pending Fees Card */}
          <div className="theme-card p-5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-brand-red tracking-wider uppercase">Active Invoices</span>
              <h3 className="text-2xl font-extrabold text-light-textMain mt-1">
                ₹{studentFees.reduce((acc, curr) => acc + (parseFloat(curr.amount_due) - parseFloat(curr.amount_paid)), 0).toLocaleString()}
              </h3>
              <p className="text-xs text-light-textMuted mt-0.5">Dues balance remaining</p>
            </div>
            <div className="mt-4 pt-4 border-t border-light-border/50 flex justify-between items-center text-xs">
              <span className="text-light-textMuted">UPI/Card Simulators</span>
              <span className="text-brand-brown font-bold">Pending Payment</span>
            </div>
          </div>

          {/* Active Complaints */}
          <div className="theme-card p-5 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-brand-wheat tracking-wider uppercase">Unresolved Issues</span>
              <h3 className="text-2xl font-extrabold text-light-textMain mt-1">
                {studentComplaints.filter(c => c.status !== "RESOLVED").length} Open
              </h3>
              <p className="text-xs text-light-textMuted mt-0.5">Assigned to maintenance</p>
            </div>
            <div className="mt-4 pt-4 border-t border-light-border/50 text-xs flex justify-between text-light-textMuted">
              <span>Resolved: {studentComplaints.filter(c => c.status === "RESOLVED").length} Items</span>
              <span className="text-brand-wheat font-semibold">Priority Checked</span>
            </div>
          </div>
        </div>
      )}

      {role === "WARDEN" && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Hostel Rooms" value="45 Rooms" desc="Newton / Gargi / Sarabhai" color="cyan" />
          <StatCard title="Assigned complaints" value={`${stats.defaulters || 8} Active`} desc="Pending maintenance logs" color="rose" />
          <StatCard title="Leave applications" value="3 Pending" desc="Awaiting approval" color="amber" />
          <StatCard title="Visitors Active" value="2 Inside" desc="Registered today" color="indigo" />
        </div>
      )}

      {role === "ACCOUNTANT" && (
        <div className="grid grid-cols-4 gap-4">
          <StatCard title="Total Collections" value={`₹${stats.collected_fees.toLocaleString()}`} desc="LED Ledger Bookings" color="emerald" />
          <StatCard title="Outstanding Dues" value={`₹${stats.pending_fees.toLocaleString()}`} desc="Due invoice list" color="rose" />
          <StatCard title="Active Defaulters" value={`${stats.defaulters} Accounts`} desc="Overdue balance students" color="amber" />
          <StatCard title="Success Payments" value="23 Ledger txns" desc="System automatic loggers" color="indigo" />
        </div>
      )}

      {/* Global Notices Section */}
      <div className="theme-card p-5 rounded-xl mt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4 flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-brand-brown" /> Campus Notice Board
        </h3>
        {notices.length === 0 ? (
          <p className="text-xs text-light-textMuted">No announcements published today.</p>
        ) : (
          <div className="space-y-4">
            {notices.map((n) => (
              <div key={n.notice_id} className="p-4 rounded-lg bg-light-bg/60 border border-light-border/60">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-light-textMain text-sm">{n.title}</h4>
                  <span className="text-[10px] text-brand-brown font-bold bg-brand-brown/10 px-2 py-0.5 border border-brand-brown/20 rounded">
                    To: {n.audience}
                  </span>
                </div>
                <p className="text-xs text-light-textMuted mt-1 leading-relaxed">{n.description}</p>
                <div className="flex justify-between items-center text-[10px] text-light-textMuted mt-2">
                  <span>Author: {n.author_name}</span>
                  <span>Published: {new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Stats Card Helper
function StatCard({ title, value, desc, color }) {
  const colorMap = {
    cyan: "border-brand-brown/30 text-brand-brown",
    indigo: "border-brand-indigo/30 text-brand-indigo",
    emerald: "border-brand-green/30 text-brand-green",
    rose: "border-brand-red/30 text-brand-red",
    amber: "border-brand-wheat/30 text-brand-wheat",
  };

  return (
    <div className="theme-card p-5 rounded-xl border-l-4">
      <span className="text-xs font-bold text-light-textMuted tracking-wider uppercase block">{title}</span>
      <h3 className="text-2xl font-black text-light-textMain mt-1.5">{value}</h3>
      <p className="text-xs text-light-textMuted mt-0.5">{desc}</p>
    </div>
  );
}

// 2. ROOMS & ALLOCATION PANEL
function RoomsPanel({ role, rooms, hostels, roommates, students, onAllocate, onVacate }) {
  const [selectedHostel, setSelectedHostel] = useState("");
  const [allocForm, setAllocForm] = useState({ student_id: "", room_id: "" });
  
  // Filter rooms based on hostel
  const filteredRooms = selectedHostel
    ? rooms.filter((r) => r.hostel_id === parseInt(selectedHostel))
    : rooms;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Rooms & Allocations</h2>
        <p className="text-sm text-light-textMuted">Manage room registers and roommates map</p>
      </div>

      {role === "STUDENT" && (
        <div className="theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">My Roommates</h3>
          {roommates.length === 0 ? (
            <p className="text-xs text-light-textMuted font-semibold">You have no roommates in your current room.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {roommates.map((rm) => (
                <div key={rm.student_id} className="p-4 rounded-lg bg-light-bg/60 border border-light-border">
                  <h4 className="font-bold text-light-textMain text-sm">{rm.name}</h4>
                  <p className="text-xs text-light-textMuted mt-0.5">Roll No: {rm.roll_no}</p>
                  <p className="text-[11px] text-light-textMuted mt-2 font-mono">{rm.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(role === "WARDEN" || role === "ADMIN") && (
        <div className="grid grid-cols-3 gap-6">
          {/* Allocation console */}
          <div className="theme-card p-5 rounded-xl h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Assign Room (Stored Proc)</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onAllocate(allocForm.student_id, allocForm.room_id);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Select Student</label>
                <select
                  required
                  className="w-full theme-input"
                  value={allocForm.student_id}
                  onChange={(e) => setAllocForm({ ...allocForm, student_id: e.target.value })}
                >
                  <option value="">-- Choose Active Student --</option>
                  {students.filter(s => s.status === "ACTIVE").map((s) => (
                    <option key={s.student_id} value={s.student_id}>
                      {s.name} ({s.roll_no})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Select Room</label>
                <select
                  required
                  className="w-full theme-input"
                  value={allocForm.room_id}
                  onChange={(e) => setAllocForm({ ...allocForm, room_id: e.target.value })}
                >
                  <option value="">-- Choose Available Room --</option>
                  {rooms.filter(r => r.occupied_count < r.capacity && r.status !== "MAINTENANCE").map((r) => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.hostel_name} - Room {r.room_number} ({r.room_type}, space: {r.capacity - r.occupied_count})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full theme-btn-primary py-2.5 text-sm">
                Commit Room Allocation
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-light-border/60">
              <h4 className="text-xs font-bold text-brand-red tracking-wider uppercase mb-3">Vacate Room (Rollback Safe)</h4>
              <div className="space-y-2">
                {students.filter(s => s.room_number && s.room_number !== "Not Allocated").map((s) => (
                  <div key={s.student_id} className="flex justify-between items-center bg-light-bg/60 p-2.5 rounded border border-light-border text-xs">
                    <div>
                      <strong className="text-light-textMain block">{s.name}</strong>
                      <span className="text-light-textMuted font-mono">{s.roll_no} - Room: {s.room_number}</span>
                    </div>
                    <button
                      onClick={() => onVacate(s.student_id)}
                      className="px-2 py-1 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 transition-all font-semibold"
                    >
                      Vacate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rooms Grid Register */}
          <div className="col-span-2 theme-card p-5 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted">Rooms Directory</h3>
              <select
                className="theme-input text-xs"
                value={selectedHostel}
                onChange={(e) => setSelectedHostel(e.target.value)}
              >
                <option value="">All Hostels</option>
                {hostels.map((h) => (
                  <option key={h.hostel_id} value={h.hostel_id}>
                    {h.hostel_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3.5 max-h-[500px] overflow-y-auto pr-2">
              {filteredRooms.map((r) => {
                const isFull = r.occupied_count >= r.capacity;
                return (
                  <div
                    key={r.room_id}
                    className={`p-3.5 rounded-lg border bg-light-bg/40 flex flex-col justify-between transition-all ${
                      r.status === "MAINTENANCE"
                        ? "border-brand-red/20 bg-brand-red/5"
                        : isFull
                        ? "border-light-border"
                        : "border-brand-brown/20 bg-brand-brown/5"
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-light-textMain text-base">Room {r.room_number}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          r.status === "MAINTENANCE"
                            ? "bg-brand-red/20 text-brand-red"
                            : isFull
                            ? "bg-dark-border text-light-textMuted"
                            : "bg-brand-brown/15 text-brand-brown"
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-light-textMuted font-bold uppercase tracking-wider block mt-1">
                        {r.hostel_name} (Floor {r.floor})
                      </span>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-light-border/50 flex justify-between items-center text-xs text-light-textMuted">
                      <span>{r.room_type} Type</span>
                      <strong className="text-light-textMain">{r.occupied_count}/{r.capacity} Beds</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. FEE PANEL
function FeesPanel({ role, fees, allFees, payments, defaulters, students, onPay, onCreateInvoice, onRecordManual }) {
  const [invoiceForm, setInvoiceForm] = useState({ student_id: "", fee_structure_id: "", due_date: "" });
  const [manualForm, setManualForm] = useState({ fee_id: "", amount: "", payment_method: "UPI", transaction_id: "" });
  const structures = [
    { id: 1, label: "SINGLE (Total: ₹1,30,000)" },
    { id: 2, label: "DOUBLE (Total: ₹95,000)" },
    { id: 3, label: "TRIPLE (Total: ₹80,000)" },
    { id: 4, label: "COMMON (Total: ₹62,000)" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Fee Ledgers & Financials</h2>
        <p className="text-sm text-light-textMuted">Track billing records, UPI payments, and triggers status updates</p>
      </div>

      {role === "STUDENT" && (
        <div className="theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">My Invoiced Charges</h3>
          {fees.length === 0 ? (
            <p className="text-xs text-light-textMuted">No outstanding fee invoices mapped to your roll number.</p>
          ) : (
            <div className="space-y-4">
              {fees.map((f) => {
                const pending = parseFloat(f.amount_due) - parseFloat(f.amount_paid);
                return (
                  <div key={f.fee_id} className="p-4 rounded-lg bg-light-bg/60 border border-light-border flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-extrabold text-light-textMain text-base">{f.room_type} Room Fee</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          f.status === "PAID"
                            ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                            : f.status === "PARTIAL"
                            ? "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                            : "bg-brand-red/10 border-brand-red/20 text-brand-red"
                        }`}>
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-light-textMuted mt-1.5">
                        Amount Due: <strong>₹{parseFloat(f.amount_due).toLocaleString()}</strong> | Paid: <strong>₹{parseFloat(f.amount_paid).toLocaleString()}</strong>
                      </p>
                      <p className="text-[10px] text-light-textMuted mt-0.5">Due Date: {f.due_date}</p>
                    </div>

                    {pending > 0 && (
                      <button
                        onClick={() => onPay(f.fee_id, pending)}
                        className="theme-btn-primary text-xs py-2 px-4 shadow-sm flex items-center gap-1"
                      >
                        Simulate UPI Pay: ₹{pending.toLocaleString()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {(role === "ACCOUNTANT" || role === "ADMIN") && (
        <div className="grid grid-cols-3 gap-6">
          {/* Action panels */}
          <div className="space-y-6">
            {/* Create Invoice Form */}
            <div className="theme-card p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Generate Student Invoice</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onCreateInvoice(invoiceForm.student_id, invoiceForm.fee_structure_id, invoiceForm.due_date);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Select Student</label>
                  <select
                    required
                    className="w-full theme-input text-xs"
                    value={invoiceForm.student_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, student_id: e.target.value })}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.name} ({s.roll_no})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Fee Structure Type</label>
                  <select
                    required
                    className="w-full theme-input text-xs"
                    value={invoiceForm.fee_structure_id}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, fee_structure_id: e.target.value })}
                  >
                    <option value="">-- Structure Rate --</option>
                    {structures.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    className="w-full theme-input text-xs"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, due_date: e.target.value })}
                  />
                </div>

                <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
                  Publish Invoice & Post Ledger
                </button>
              </form>
            </div>

            {/* Record Manual Payment */}
            <div className="theme-card p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Record Cash/Bank Payment</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onRecordManual(manualForm.fee_id, manualForm.amount, manualForm.payment_method, manualForm.transaction_id);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Select Open Ledger Invoice</label>
                  <select
                    required
                    className="w-full theme-input text-xs"
                    value={manualForm.fee_id}
                    onChange={(e) => setManualForm({ ...manualForm, fee_id: e.target.value })}
                  >
                    <option value="">-- Choose Ledger Invoice --</option>
                    {allFees.filter(f => f.status !== "PAID").map((f) => (
                      <option key={f.fee_id} value={f.fee_id}>
                        {f.student_name} ({f.roll_no}) - Balance: ₹{(parseFloat(f.amount_due) - parseFloat(f.amount_paid)).toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Amount</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      className="w-full theme-input text-xs"
                      value={manualForm.amount}
                      onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Method</label>
                    <select
                      required
                      className="w-full theme-input text-xs"
                      value={manualForm.payment_method}
                      onChange={(e) => setManualForm({ ...manualForm, payment_method: e.target.value })}
                    >
                      <option value="CASH">CASH</option>
                      <option value="UPI">UPI</option>
                      <option value="CARD">CARD</option>
                      <option value="NET_BANKING">BANK NET</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Transaction Ref ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TXN1029302"
                    className="w-full theme-input text-xs font-mono"
                    value={manualForm.transaction_id}
                    onChange={(e) => setManualForm({ ...manualForm, transaction_id: e.target.value })}
                  />
                </div>

                <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
                  Process Receipt Update
                </button>
              </form>
            </div>
          </div>

          {/* Ledger Lists & Defaulters Sheet */}
          <div className="col-span-2 space-y-6">
            {/* View: pending_fees list */}
            <div className="theme-card p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-red mb-3">Defaulters Ledger Sheet (Database View)</h3>
              <div className="max-h-[220px] overflow-y-auto pr-1">
                {defaulters.length === 0 ? (
                  <p className="text-xs text-light-textMuted font-semibold">Zero outstanding balances. Excellent record!</p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-light-border text-light-textMuted uppercase font-bold tracking-wider">
                        <th className="py-2">Student</th>
                        <th className="py-2">Roll No</th>
                        <th className="py-2 text-right">Balance Due</th>
                        <th className="py-2 text-right">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {defaulters.map((d, i) => (
                        <tr key={i} className="border-b border-light-border/40 hover:bg-dark-border/10">
                          <td className="py-2 text-light-textMain font-semibold">{d.name}</td>
                          <td className="py-2 font-mono text-light-textMuted">{d.roll_no}</td>
                          <td className="py-2 text-right text-brand-red font-bold">₹{parseFloat(d.balance_due).toLocaleString()}</td>
                          <td className="py-2 text-right text-light-textMuted">{d.due_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Payments Log */}
            <div className="theme-card p-5 rounded-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-3">Received Payments Ledger</h3>
              <div className="max-h-[240px] overflow-y-auto pr-1">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-light-border text-light-textMuted uppercase font-bold tracking-wider">
                      <th className="py-2">Ref ID</th>
                      <th className="py-2">Student</th>
                      <th className="py-2 text-right">Amount</th>
                      <th className="py-2 text-right">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.payment_id} className="border-b border-light-border/40 hover:bg-dark-border/10">
                        <td className="py-2 font-mono text-brand-brown">{p.transaction_id}</td>
                        <td className="py-2 text-light-textMain font-semibold">{p.student_name}</td>
                        <td className="py-2 text-right text-brand-green font-bold">₹{parseFloat(p.amount).toLocaleString()}</td>
                        <td className="py-2 text-right text-light-textMuted uppercase">{p.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 4. COMPLAINTS PANEL
function ComplaintsPanel({ role, studentComplaints, wardenComplaints, onSubmit, onResolve }) {
  const [complaintForm, setComplaintForm] = useState({ category: "WIFI", description: "", priority: "MEDIUM" });
  const [resolutionText, setResolutionText] = useState({});
  const categories = ["WIFI", "ELECTRICAL", "PLUMBING", "CLEANING", "FURNITURE", "FOOD", "SECURITY", "OTHER"];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Complaints Management</h2>
        <p className="text-sm text-light-textMuted">Maintenance feedback and resolution desk</p>
      </div>

      {role === "STUDENT" && (
        <div className="grid grid-cols-3 gap-6">
          {/* File Complaint */}
          <div className="theme-card p-5 rounded-xl h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4 font-bold">Submit Maintenance Request</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(complaintForm.category, complaintForm.description, complaintForm.priority);
                setComplaintForm({ category: "WIFI", description: "", priority: "MEDIUM" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Issue Category</label>
                <select
                  className="w-full theme-input text-xs"
                  value={complaintForm.category}
                  onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Priority</label>
                <select
                  className="w-full theme-input text-xs"
                  value={complaintForm.priority}
                  onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Description / Location Details</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Describe your issue..."
                  className="w-full theme-input text-xs"
                  value={complaintForm.description}
                  onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
                Log Complaint
              </button>
            </form>
          </div>

          {/* History */}
          <div className="col-span-2 theme-card p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">My Complaint History</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {studentComplaints.map((c) => (
                <div key={c.complaint_id} className="p-4 rounded-lg bg-light-bg/60 border border-light-border">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-light-textMain text-sm">{c.category}</h4>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                          c.status === "RESOLVED"
                            ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                            : c.status === "NEW"
                            ? "bg-brand-brown/10 border-brand-brown/20 text-brand-brown"
                            : "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <p className="text-xs text-light-textMuted mt-1.5">{c.description}</p>
                    </div>
                    <span className="text-[10px] text-light-textMuted">Priority: <strong className="text-light-textMain">{c.priority}</strong></span>
                  </div>

                  {c.resolution && (
                    <div className="mt-3 p-2.5 rounded bg-brand-indigo/5 border border-brand-indigo/20 text-xs">
                      <strong className="text-brand-indigo block mb-0.5">Warden Resolution:</strong>
                      <p className="text-light-textMuted italic">"{c.resolution}"</p>
                      <span className="text-[10px] text-light-textMuted block mt-1">Resolved at: {new Date(c.resolved_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(role === "WARDEN" || role === "ADMIN") && (
        <div className="theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Warden Complaint Resolver Desk</h3>
          {wardenComplaints.length === 0 ? (
            <p className="text-xs text-light-textMuted">All tickets cleared! No complaints logged.</p>
          ) : (
            <div className="space-y-4">
              {wardenComplaints.map((c) => (
                <div key={c.complaint_id} className="p-4 rounded-lg bg-light-bg/60 border border-light-border flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-extrabold text-light-textMain text-base">{c.category}</h4>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        c.status === "RESOLVED"
                          ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                          : "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs text-brand-brown font-semibold">Room: {c.room_number || "Unallocated"}</span>
                    </div>
                    <p className="text-xs text-light-textMuted mt-2">
                      Reported by: <strong>{c.student_name} ({c.roll_no})</strong>
                    </p>
                    <p className="text-xs text-light-textMain mt-1 leading-relaxed">"{c.description}"</p>
                    
                    {c.resolution && (
                      <p className="text-xs text-brand-indigo mt-2 italic">
                        Resolution: "{c.resolution}"
                      </p>
                    )}
                  </div>

                  {c.status !== "RESOLVED" && (
                    <div className="w-80 flex flex-col gap-2 shrink-0">
                      <textarea
                        required
                        placeholder="Resolution comments..."
                        className="w-full theme-input text-xs"
                        rows="2"
                        value={resolutionText[c.complaint_id] || ""}
                        onChange={(e) => setResolutionText({ ...resolutionText, [c.complaint_id]: e.target.value })}
                      ></textarea>
                      <div className="flex gap-2">
                        {c.status === "NEW" && (
                          <button
                            onClick={() => onResolve(c.complaint_id, "IN_PROGRESS")}
                            className="flex-1 theme-btn-secondary text-[11px] py-1.5"
                          >
                            Assign to Work
                          </button>
                        )}
                        <button
                          onClick={() => onResolve(c.complaint_id, "RESOLVED", resolutionText[c.complaint_id])}
                          disabled={!resolutionText[c.complaint_id]}
                          className="flex-1 theme-btn-primary text-[11px] py-1.5"
                        >
                          Resolve & Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 5. LEAVES PANEL
function LeavesPanel({ role, leaves, wardenLeaves, onSubmit, onProcess }) {
  const [leaveForm, setLeaveForm] = useState({
    pass_type: "LEAVE",
    from_date: "",
    to_date: "",
    reason: "",
    destination: "",
    emergency_contact: ""
  });
  const [wardenFilter, setWardenFilter] = useState("ALL");

  const getPassBadgeColor = (type) => {
    switch (type) {
      case "HOME_PASS": return "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat";
      case "OUT_PASS": return "bg-blue-500/10 border-blue-500/20 text-blue-500";
      default: return "bg-brand-tan/10 border-brand-tan/20 text-brand-tan";
    }
  };

  const getPassTypeName = (type) => {
    switch (type) {
      case "HOME_PASS": return "🏠 Home Pass";
      case "OUT_PASS": return "🚶 Out Pass";
      default: return "📚 Leave";
    }
  };

  const filteredWardenLeaves = wardenLeaves.filter(l => {
    if (wardenFilter === "ALL") return true;
    return l.pass_type === wardenFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain font-bold">Pass & Leave Registers</h2>
        <p className="text-sm text-light-textMuted">Apply for Out Passes, Home Passes, or Academic Leaves and track their approvals</p>
      </div>

      {role === "STUDENT" && (
        <div className="grid grid-cols-3 gap-6">
          {/* Apply Leave / Pass */}
          <div className="theme-card p-5 rounded-xl h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Request Pass / Leave</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(
                  leaveForm.from_date,
                  leaveForm.to_date,
                  leaveForm.reason,
                  leaveForm.destination,
                  leaveForm.emergency_contact,
                  leaveForm.pass_type
                );
                setLeaveForm({ pass_type: "LEAVE", from_date: "", to_date: "", reason: "", destination: "", emergency_contact: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Pass Type</label>
                <select
                  className="w-full theme-input text-xs"
                  value={leaveForm.pass_type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, pass_type: e.target.value })}
                >
                  <option value="LEAVE">📚 Academic Leave</option>
                  <option value="HOME_PASS">🏠 Home Pass (Weekend / Holiday)</option>
                  <option value="OUT_PASS">🚶 Out Pass (Local Day Outing)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    className="w-full theme-input text-xs"
                    value={leaveForm.from_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, from_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    className="w-full theme-input text-xs"
                    value={leaveForm.to_date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, to_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">
                  {leaveForm.pass_type === "OUT_PASS" ? "Local Destination" : "Destination Address"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={leaveForm.pass_type === "OUT_PASS" ? "e.g. City Mall, Market" : "e.g. Home town address"}
                  className="w-full theme-input text-xs"
                  value={leaveForm.destination}
                  onChange={(e) => setLeaveForm({ ...leaveForm, destination: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Emergency Contact</label>
                <input
                  type="text"
                  required
                  placeholder="Parent phone number"
                  className="w-full theme-input text-xs font-mono"
                  value={leaveForm.emergency_contact}
                  onChange={(e) => setLeaveForm({ ...leaveForm, emergency_contact: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Reason</label>
                <textarea
                  required
                  rows="2"
                  placeholder="Brief explanation..."
                  className="w-full theme-input text-xs"
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
                Request Warden Approval
              </button>
            </form>
          </div>

          {/* History */}
          <div className="col-span-2 theme-card p-5 rounded-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">My Pass & Leave History</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {leaves.map((l) => (
                <div key={l.leave_id} className="p-4 rounded-lg bg-light-bg border border-light-border">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs text-light-textMain font-bold block">
                        {l.from_date} ➔ {l.to_date}
                      </span>
                      <span className={`inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getPassBadgeColor(l.pass_type)}`}>
                        {getPassTypeName(l.pass_type)}
                      </span>
                    </div>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                      l.status === "APPROVED"
                        ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                        : l.status === "REJECTED"
                        ? "bg-brand-red/10 border-brand-red/20 text-brand-red"
                        : "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-xs text-light-textMuted mt-1">Destination: <strong className="text-light-textMain">{l.destination}</strong></p>
                  <p className="text-xs text-light-textMuted mt-0.5">Reason: "{l.reason}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(role === "WARDEN" || role === "ADMIN") && (
        <div className="theme-card p-5 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted font-bold">Pass Approval registers</h3>
            <div className="flex gap-2">
              {["ALL", "LEAVE", "HOME_PASS", "OUT_PASS"].map((f) => (
                <button
                  key={f}
                  onClick={() => setWardenFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border ${
                    wardenFilter === f
                      ? "bg-brand-brown border-brand-brown text-white"
                      : "border-light-border text-light-textMuted hover:bg-light-bg"
                  }`}
                >
                  {f === "ALL" ? "All Requests" : getPassTypeName(f)}
                </button>
              ))}
            </div>
          </div>

          {filteredWardenLeaves.length === 0 ? (
            <p className="text-xs text-light-textMuted">No pass or leave requests logged for the selected filter.</p>
          ) : (
            <div className="space-y-4">
              {filteredWardenLeaves.map((l) => (
                <div key={l.leave_id} className="p-4 rounded-lg bg-light-bg border border-light-border flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="font-extrabold text-light-textMain text-sm">{l.student_name} ({l.roll_no})</h4>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${getPassBadgeColor(l.pass_type)}`}>
                        {getPassTypeName(l.pass_type)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                        l.status === "APPROVED"
                          ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                          : l.status === "REJECTED"
                          ? "bg-brand-red/10 border-brand-red/20 text-brand-red"
                          : "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                      }`}>
                        {l.status}
                      </span>
                    </div>
                    <p className="text-xs text-light-textMuted mt-1">
                      Travel Period: <strong>{l.from_date}</strong> to <strong>{l.to_date}</strong>
                    </p>
                    <p className="text-xs text-light-textMuted mt-0.5">
                      Reason: "{l.reason}" | Destination: {l.destination} | Contact: {l.emergency_contact}
                    </p>
                  </div>

                  {l.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onProcess(l.leave_id, "REJECTED")}
                        className="px-3 py-1.5 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 text-xs font-semibold"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => onProcess(l.leave_id, "APPROVED")}
                        className="px-3 py-1.5 rounded bg-brand-green/10 border border-brand-green/20 text-brand-green hover:bg-brand-green/20 text-xs font-semibold"
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 6. VISITORS PANEL
function VisitorsPanel({ role, visitors, students, onSubmit, onCheckout }) {
  const [visitorForm, setVisitorForm] = useState({ student_id: "", visitor_name: "", relationship: "", phone: "" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Visitor Registries</h2>
        <p className="text-sm text-light-textMuted">Warden gate access tracker & entry pass logs</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Register Visitor */}
        <div className="theme-card p-5 rounded-xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Register Entry Log</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(visitorForm.student_id, visitorForm.visitor_name, visitorForm.relationship, visitorForm.phone);
              setVisitorForm({ student_id: "", visitor_name: "", relationship: "", phone: "" });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Student Host</label>
              <select
                required
                className="w-full theme-input text-xs"
                value={visitorForm.student_id}
                onChange={(e) => setVisitorForm({ ...visitorForm, student_id: e.target.value })}
              >
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.student_id} value={s.student_id}>
                    {s.name} ({s.roll_no})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Visitor Name</label>
              <input
                type="text"
                required
                placeholder="Full name"
                className="w-full theme-input text-xs"
                value={visitorForm.visitor_name}
                onChange={(e) => setVisitorForm({ ...visitorForm, visitor_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Relationship</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Parent, Friend"
                  className="w-full theme-input text-xs"
                  value={visitorForm.relationship}
                  onChange={(e) => setVisitorForm({ ...visitorForm, relationship: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="Phone"
                  className="w-full theme-input text-xs font-mono"
                  value={visitorForm.phone}
                  onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
              Check-In Visitor
            </button>
          </form>
        </div>

        {/* Visitor Logs Grid */}
        <div className="col-span-2 theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Gate Visitor Register</h3>
          <div className="max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-light-border text-light-textMuted uppercase font-bold tracking-wider">
                  <th className="py-2.5">Visitor</th>
                  <th className="py-2.5">Student Host</th>
                  <th className="py-2.5">Entry Time</th>
                  <th className="py-2.5 text-right">Exit / Action</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((v) => (
                  <tr key={v.visitor_id} className="border-b border-light-border/40 hover:bg-dark-border/10">
                    <td className="py-3">
                      <strong className="text-light-textMain block">{v.visitor_name}</strong>
                      <span className="text-light-textMuted font-semibold uppercase text-[10px]">{v.relationship}</span>
                    </td>
                    <td className="py-3 text-light-textMuted">
                      <span>{v.student_name}</span>
                      <span className="block font-mono text-[10px] text-light-textMuted">{v.roll_no}</span>
                    </td>
                    <td className="py-3 text-light-textMuted font-mono">
                      {new Date(v.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      {v.status === "APPROVED" ? (
                        <button
                          onClick={() => onCheckout(v.visitor_id)}
                          className="px-2.5 py-1 rounded bg-brand-red/10 border border-brand-red/20 text-brand-red hover:bg-brand-red/20 text-xs font-semibold"
                        >
                          Check-Out
                        </button>
                      ) : (
                        <span className="text-xs text-brand-green font-bold font-mono">
                          Checked-out: {new Date(v.exit_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// 7. ATTENDANCE PANEL
function AttendancePanel({ role, records, students, onMark }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Student Attendance</h2>
        <p className="text-sm text-light-textMuted">Record and track daily presence logs</p>
      </div>

      {role === "STUDENT" && (
        <div className="theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">My Attendance Log</h3>
          {records.length === 0 ? (
            <p className="text-xs text-light-textMuted">No attendance ledger logged for your profile.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {records.map((r) => (
                <div key={r.attendance_id} className="p-3.5 rounded-lg bg-light-bg/60 border border-light-border flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-light-textMain">{r.date}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    r.status === "PRESENT"
                      ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                      : r.status === "ABSENT"
                      ? "bg-brand-red/10 border-brand-red/20 text-brand-red"
                      : "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {role === "WARDEN" && (
        <div className="theme-card p-5 rounded-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted">Record Daily Attendance: {new Date().toLocaleDateString()}</h3>
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-light-border text-light-textMuted uppercase font-bold tracking-wider">
                  <th className="py-2.5">Student</th>
                  <th className="py-2.5">Roll No</th>
                  <th className="py-2.5 text-right">Quick Mark Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id} className="border-b border-light-border/40 hover:bg-dark-border/10">
                    <td className="py-3 text-light-textMain font-semibold">{s.name}</td>
                    <td className="py-3 font-mono text-light-textMuted">{s.roll_no}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex rounded-lg overflow-hidden border border-light-border">
                        <button
                          onClick={() => onMark(s.student_id, "PRESENT")}
                          className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 border-r border-light-border text-brand-green font-semibold text-xs"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => onMark(s.student_id, "ABSENT")}
                          className="px-3 py-1.5 bg-brand-red/10 hover:bg-brand-red/20 text-brand-red font-semibold text-xs"
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 8. MESS PANEL
function MessPanel({ role, menu, hostels, onSubmitFeedback, studentProfile }) {
  const [rating, setRating] = useState({ quality: 5, taste: 5, cleanliness: 5, comments: "" });
  const [foodComplaintDesc, setFoodComplaintDesc] = useState("");
  const [foodComplaints, setFoodComplaints] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadFoodComplaints = async () => {
    try {
      const allComps = await api.getMyComplaints();
      setFoodComplaints(allComps.filter(c => c.category === "FOOD"));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (role === "STUDENT") {
      loadFoodComplaints();
    }
  }, []);

  const handleFoodComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!foodComplaintDesc.trim()) return;
    setIsSubmitting(true);
    try {
      await api.fileComplaint("FOOD", foodComplaintDesc, "MEDIUM");
      setFoodComplaintDesc("");
      loadFoodComplaints();
      alert("Food complaint filed successfully!");
    } catch (err) {
      alert("Failed to file food complaint: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain font-bold">Mess Hall</h2>
        <p className="text-sm text-light-textMuted">Daily menu schedules, ratings feedback & food complaints</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Side: Rating & Complaints */}
        {role === "STUDENT" && (
          <div className="space-y-6">
            {/* Mess Pass Card */}
            <div className="theme-card bg-gradient-to-br from-brand-brown to-brand-tan text-white relative overflow-hidden p-6 rounded-2xl">
              <div className="absolute right-[-10%] top-[-10%] w-32 h-32 rounded-full bg-white/5 pointer-events-none"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[10px] uppercase tracking-wider font-bold text-white/80">University Mess Service</h4>
                    <span className="text-[9px] bg-white/20 px-2 py-0.5 rounded-full font-bold">DIGITAL MESS PASS</span>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-extrabold text-sm text-white">
                    U
                  </div>
                </div>
                <div className="pt-2 text-white">
                  <p className="text-base font-bold tracking-wide text-white">{studentProfile?.name || "Student Name"}</p>
                  <p className="text-[11px] text-white/90 font-mono mt-0.5">Roll No: {studentProfile?.roll_no || "23CSE101"}</p>
                  <p className="text-[11px] text-white/90 mt-0.5">Hostel: {studentProfile?.hostel_name || "Aryabhata Hall"}</p>
                  <p className="text-[11px] text-white/90 mt-0.5">Room: {studentProfile?.room_number || "A-101"}</p>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-white/20">
                  <div>
                    <span className="text-[8px] uppercase tracking-wider block text-white/70">Mess Status</span>
                    <span className="text-xs font-bold text-green-300">● ACTIVE & ENROLLED</span>
                  </div>
                  {/* Mock Barcode */}
                  <div className="bg-white p-1 rounded">
                    <div className="flex gap-0.5 items-center h-5">
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-0.5 h-full bg-black"></div>
                      <div className="w-1.5 h-full bg-black"></div>
                      <div className="w-0.5 h-full bg-black"></div>
                      <div className="w-1 h-full bg-black"></div>
                      <div className="w-2 h-full bg-black"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mess Rating Form */}
            <div className="theme-card">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Rate Meal Quality</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSubmitFeedback(rating.quality, rating.taste, rating.cleanliness, rating.comments);
                  setRating({ quality: 5, taste: 5, cleanliness: 5, comments: "" });
                }}
                className="space-y-4"
              >
                <div className="space-y-3">
                  <RatingSelect
                    label="Food Quality"
                    val={rating.quality}
                    onChange={(v) => setRating({ ...rating, quality: v })}
                  />
                  <RatingSelect
                    label="Taste Rating"
                    val={rating.taste}
                    onChange={(v) => setRating({ ...rating, taste: v })}
                  />
                  <RatingSelect
                    label="Cleanliness"
                    val={rating.cleanliness}
                    onChange={(v) => setRating({ ...rating, cleanliness: v })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Additional Comments</label>
                  <textarea
                    placeholder="Suggestions..."
                    className="w-full theme-input text-xs"
                    rows="2"
                    value={rating.comments}
                    onChange={(e) => setRating({ ...rating, comments: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
                  Log Ratings Feedback
                </button>
              </form>
            </div>

            {/* Mess Food Complaint Form */}
            <div className="theme-card">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">File Food Complaint</h3>
              <form onSubmit={handleFoodComplaintSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Complaint Details</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Describe your issue with food quality, hygiene, or mess staff..."
                    className="w-full theme-input text-xs"
                    value={foodComplaintDesc}
                    onChange={(e) => setFoodComplaintDesc(e.target.value)}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full theme-btn-primary py-2.5 text-xs bg-brand-red hover:bg-brand-red/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Mess Complaint"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Right Side: Menu Board & Food Complaints List */}
        <div className="col-span-2 space-y-6">
          {/* Menu Board */}
          <div className="theme-card">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4 font-bold">Weekly Food Menu</h3>
            {menu.length === 0 ? (
              <p className="text-xs text-light-textMuted">No mess menus seeded for your hostel.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
                {menu.map((m) => (
                  <div key={m.menu_id} className="p-4 rounded-xl bg-light-bg border border-light-border shadow-sm">
                    <span className="text-xs font-bold text-brand-brown uppercase tracking-wider block mb-2">{m.day_of_week} ({m.hostel_name})</span>
                    <div className="space-y-1.5 text-xs">
                      <div>
                        <strong className="text-light-textMain">Breakfast: </strong>
                        <span className="text-light-textMuted">{m.breakfast}</span>
                      </div>
                      <div>
                        <strong className="text-light-textMain">Lunch: </strong>
                        <span className="text-light-textMuted">{m.lunch}</span>
                      </div>
                      <div>
                        <strong className="text-light-textMain">Dinner: </strong>
                        <span className="text-light-textMuted">{m.dinner}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Food Complaints History */}
          {role === "STUDENT" && (
            <div className="theme-card">
              <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4 font-bold">My Filed Food Complaints</h3>
              {foodComplaints.length === 0 ? (
                <p className="text-xs text-light-textMuted">No food complaints filed yet.</p>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {foodComplaints.map((c) => (
                    <div key={c.complaint_id} className="p-3.5 rounded-lg bg-light-bg border border-light-border flex justify-between items-center text-xs">
                      <div className="space-y-1">
                        <p className="text-light-textMain font-semibold">"{c.description}"</p>
                        <p className="text-[10px] text-light-textMuted">
                          Filed on: {new Date(c.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                        c.status === "RESOLVED"
                          ? "bg-brand-green/10 border-brand-green/20 text-brand-green"
                          : "bg-brand-wheat/10 border-brand-wheat/20 text-brand-wheat"
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Rating Slider Helper
function RatingSelect({ label, val, onChange }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-light-textMuted font-semibold">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs transition-all border ${
              val === i
                ? "bg-brand-brown/20 border-brand-brown text-brand-brown shadow-sm"
                : "border-light-border hover:bg-dark-border/40 text-light-textMuted"
            }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

// 9. INVENTORY PANEL
function InventoryPanel({ role, inventory, hostels, onTx }) {
  const [txForm, setTxForm] = useState({ item_id: "", transaction_type: "ADD", quantity: "", remarks: "" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Asset Inventories</h2>
        <p className="text-sm text-light-textMuted">Track beds, fans, tubelights, and damage reports</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Log Adjustments Form */}
        <div className="theme-card p-5 rounded-xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Stock Ledger Adjustment</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onTx(txForm.item_id, txForm.transaction_type, parseInt(txForm.quantity), txForm.remarks);
              setTxForm({ item_id: "", transaction_type: "ADD", quantity: "", remarks: "" });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Select Asset Item</label>
              <select
                required
                className="w-full theme-input text-xs"
                value={txForm.item_id}
                onChange={(e) => setTxForm({ ...txForm, item_id: e.target.value })}
              >
                <option value="">-- Choose Asset --</option>
                {inventory.map((i) => (
                  <option key={i.item_id} value={i.item_id}>
                    {i.hostel_name} - {i.item_name} (Stock: {i.total_qty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Adjustment Type</label>
              <select
                required
                className="w-full theme-input text-xs"
                value={txForm.transaction_type}
                onChange={(e) => setTxForm({ ...txForm, transaction_type: e.target.value })}
              >
                <option value="ADD">ADD Stock</option>
                <option value="REMOVE">REMOVE Stock</option>
                <option value="DAMAGE_REPORT">Report DAMAGE</option>
                <option value="REPAIR_REPORT">Log REPAIRED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Adjust Quantity</label>
              <input
                type="number"
                required
                className="w-full theme-input text-xs"
                placeholder="Adjust count"
                value={txForm.quantity}
                onChange={(e) => setTxForm({ ...txForm, quantity: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Audit Remarks</label>
              <input
                type="text"
                required
                placeholder="Remarks..."
                className="w-full theme-input text-xs"
                value={txForm.remarks}
                onChange={(e) => setTxForm({ ...txForm, remarks: e.target.value })}
              />
            </div>

            <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
              Commit Stock Adjustment
            </button>
          </form>
        </div>

        {/* Inventory list */}
        <div className="col-span-2 theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Stock registries</h3>
          <div className="max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-light-border text-light-textMuted uppercase font-bold tracking-wider">
                  <th className="py-2.5">Item Registry</th>
                  <th className="py-2.5 text-right">Total stock</th>
                  <th className="py-2.5 text-right">Allocated</th>
                  <th className="py-2.5 text-right">Damaged</th>
                  <th className="py-2.5 text-right">Available</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item) => (
                  <tr key={item.item_id} className="border-b border-light-border/40 hover:bg-dark-border/10">
                    <td className="py-3">
                      <strong className="text-light-textMain block">{item.item_name}</strong>
                      <span className="text-light-textMuted font-semibold text-[10px]">{item.hostel_name}</span>
                    </td>
                    <td className="py-3 text-right font-bold text-light-textMain">{item.total_qty}</td>
                    <td className="py-3 text-right text-brand-indigo">{item.occupied_qty}</td>
                    <td className="py-3 text-right text-brand-red">{item.damaged_qty}</td>
                    <td className="py-3 text-right font-bold text-brand-green">{item.available_qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. NOTICES PANEL
function NoticesPanel({ role, notices, onSubmit }) {
  const [noticeForm, setNoticeForm] = useState({ title: "", description: "", audience: "ALL", expiry_date: "" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Notice Board</h2>
        <p className="text-sm text-light-textMuted">Publish and track announcements</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Create Notice Form */}
        {role === "WARDEN" && (
          <div className="theme-card p-5 rounded-xl h-fit">
            <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Publish Announcement</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit(noticeForm.title, noticeForm.description, noticeForm.audience, noticeForm.expiry_date);
                setNoticeForm({ title: "", description: "", audience: "ALL", expiry_date: "" });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Notice Title"
                  className="w-full theme-input text-xs"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Audience</label>
                <select
                  required
                  className="w-full theme-input text-xs"
                  value={noticeForm.audience}
                  onChange={(e) => setNoticeForm({ ...noticeForm, audience: e.target.value })}
                >
                  <option value="ALL">ALL Campus</option>
                  <option value="STUDENTS">Students only</option>
                  <option value="WARDENS">Wardens only</option>
                  <option value="STAFF">All staff</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full theme-input text-xs"
                  value={noticeForm.expiry_date}
                  onChange={(e) => setNoticeForm({ ...noticeForm, expiry_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Details</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Notice details..."
                  className="w-full theme-input text-xs"
                  value={noticeForm.description}
                  onChange={(e) => setNoticeForm({ ...noticeForm, description: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" className="w-full theme-btn-primary py-2.5 text-xs">
                Publish Notice
              </button>
            </form>
          </div>
        )}

        {/* Notices Board list */}
        <div className={`col-span-2 theme-card p-5 rounded-xl`}>
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Board Feed</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {notices.map((n) => (
              <div key={n.notice_id} className="p-4 rounded-lg bg-light-bg/60 border border-light-border">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-extrabold text-light-textMain text-sm">{n.title}</h4>
                  <span className="text-[10px] text-brand-brown font-bold bg-brand-brown/10 px-2 py-0.5 border border-brand-brown/20 rounded">
                    To: {n.audience}
                  </span>
                </div>
                <p className="text-xs text-light-textMuted mt-1.5 leading-relaxed">{n.description}</p>
                <div className="flex justify-between items-center text-[10px] text-light-textMuted mt-2">
                  <span>Author: {n.author_name}</span>
                  <span>Published: {new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 11. STUDENTS PANEL
function StudentsPanel({ role, students, onSubmit }) {
  const [form, setForm] = useState({ username: "", password: "", roll_no: "", name: "", email: "", phone: "", department: "", year: "", gender: "Male", date_of_birth: "" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Student registries</h2>
        <p className="text-sm text-light-textMuted">Complete student registry profiles database</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Create Student Form */}
        <div className="theme-card p-5 rounded-xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Register Student Profile</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({ ...form, year: form.year ? parseInt(form.year) : null });
              setForm({ username: "", password: "", roll_no: "", name: "", email: "", phone: "", department: "", year: "", gender: "Male", date_of_birth: "" });
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Username</label>
                <input
                  type="text"
                  required
                  placeholder="username"
                  className="w-full theme-input text-xs"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full theme-input text-xs"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Roll No</label>
                <input
                  type="text"
                  required
                  placeholder="23CSE101"
                  className="w-full theme-input text-xs font-mono"
                  value={form.roll_no}
                  onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Name"
                  className="w-full theme-input text-xs"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Email Address</label>
              <input
                type="email"
                required
                placeholder="student@smarthostel.edu"
                className="w-full theme-input text-xs font-mono"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+91987654..."
                  className="w-full theme-input text-xs font-mono"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Dept</label>
                <input
                  type="text"
                  required
                  placeholder="CSE / ECE"
                  className="w-full theme-input text-xs"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Year</label>
                <input
                  type="number"
                  placeholder="1-4"
                  className="w-full theme-input text-xs"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">Gender</label>
                <select
                  className="w-full theme-input text-xs"
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-light-textMuted uppercase mb-0.5">DOB</label>
                <input
                  type="date"
                  className="w-full theme-input text-xs"
                  value={form.date_of_birth}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="w-full theme-btn-primary py-2 text-xs mt-2">
              Commit Student Creation
            </button>
          </form>
        </div>

        {/* Student list table */}
        <div className="col-span-2 theme-card p-5 rounded-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Student database directory</h3>
          <div className="max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-light-border text-light-textMuted uppercase font-bold tracking-wider">
                  <th className="py-2.5">Student</th>
                  <th className="py-2.5">Room Info</th>
                  <th className="py-2.5">admission date</th>
                  <th className="py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.student_id} className="border-b border-light-border/40 hover:bg-dark-border/10">
                    <td className="py-3">
                      <strong className="text-light-textMain block">{s.name}</strong>
                      <span className="text-light-textMuted font-semibold font-mono text-[10px]">{s.roll_no} | {s.department}</span>
                    </td>
                    <td className="py-3 text-light-textMuted font-semibold">
                      {s.room_number !== "Not Allocated" ? `${s.hostel_name} - ${s.room_number}` : "Unallocated"}
                    </td>
                    <td className="py-3 text-light-textMuted">{s.admission_date}</td>
                    <td className="py-3 text-right">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase bg-brand-green/10 border border-brand-green/20 text-brand-green">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// 12. HOSTELS PANEL
function HostelsPanel({ role, hostels, wardens, onCreateHostel, onCreateWarden, onCreateRoom }) {
  const [hForm, setHForm] = useState({ hostel_name: "", hostel_type: "BOYS", capacity: "", warden_id: "" });
  const [wForm, setWForm] = useState({ username: "", password: "", name: "", email: "", phone: "" });
  const [rForm, setRForm] = useState({ hostel_id: "", room_number: "", floor: "", room_type: "DOUBLE", capacity: "" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-light-textMain">Hostels, Wardens, & Rooms configuration</h2>
        <p className="text-sm text-light-textMuted">Infrastructure setup registries</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Create Hostel Form */}
        <div className="theme-card p-5 rounded-xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Add Hostel building</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreateHostel({ ...hForm, capacity: parseInt(hForm.capacity), warden_id: hForm.warden_id ? parseInt(hForm.warden_id) : null });
              setHForm({ hostel_name: "", hostel_type: "BOYS", capacity: "", warden_id: "" });
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Hostel name</label>
              <input
                type="text"
                required
                placeholder="e.g. Aryabhata Hall"
                className="w-full theme-input text-xs"
                value={hForm.hostel_name}
                onChange={(e) => setHForm({ ...hForm, hostel_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Hostel type</label>
                <select
                  className="w-full theme-input text-xs"
                  value={hForm.hostel_type}
                  onChange={(e) => setHForm({ ...hForm, hostel_type: e.target.value })}
                >
                  <option value="BOYS">BOYS</option>
                  <option value="GIRLS">GIRLS</option>
                  <option value="COED">COED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  placeholder="Beds"
                  className="w-full theme-input text-xs"
                  value={hForm.capacity}
                  onChange={(e) => setHForm({ ...hForm, capacity: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Assign Warden</label>
              <select
                className="w-full theme-input text-xs"
                value={hForm.warden_id}
                onChange={(e) => setHForm({ ...hForm, warden_id: e.target.value })}
              >
                <option value="">-- Choose Warden --</option>
                {wardens.map((w) => (
                  <option key={w.warden_id} value={w.warden_id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="w-full theme-btn-primary py-2 text-xs">
              Commit Hostel building
            </button>
          </form>
        </div>

        {/* Create Warden Form */}
        <div className="theme-card p-5 rounded-xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Register Warden</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreateWarden(wForm);
              setWForm({ username: "", password: "", name: "", email: "", phone: "" });
            }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="warden_username"
                  className="w-full theme-input text-xs"
                  value={wForm.username}
                  onChange={(e) => setWForm({ ...wForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full theme-input text-xs"
                  value={wForm.password}
                  onChange={(e) => setWForm({ ...wForm, password: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Full name</label>
              <input
                type="text"
                required
                placeholder="Dr. Name..."
                className="w-full theme-input text-xs"
                value={wForm.name}
                onChange={(e) => setWForm({ ...wForm, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Email</label>
              <input
                type="email"
                required
                placeholder="warden@smarthostel.edu"
                className="w-full theme-input text-xs font-mono"
                value={wForm.email}
                onChange={(e) => setWForm({ ...wForm, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Phone</label>
              <input
                type="text"
                required
                placeholder="Phone number"
                className="w-full theme-input text-xs font-mono"
                value={wForm.phone}
                onChange={(e) => setWForm({ ...wForm, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="w-full theme-btn-primary py-2 text-xs">
              Commit Warden profile
            </button>
          </form>
        </div>

        {/* Create Room Form */}
        <div className="theme-card p-5 rounded-xl h-fit">
          <h3 className="text-sm font-bold uppercase tracking-wider text-light-textMuted mb-4">Add Rooms</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onCreateRoom({
                ...rForm,
                hostel_id: parseInt(rForm.hostel_id),
                floor: parseInt(rForm.floor),
                capacity: parseInt(rForm.capacity)
              });
              setRForm({ hostel_id: "", room_number: "", floor: "", room_type: "DOUBLE", capacity: "" });
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Select Hostel Building</label>
              <select
                required
                className="w-full theme-input text-xs"
                value={rForm.hostel_id}
                onChange={(e) => setRForm({ ...rForm, hostel_id: e.target.value })}
              >
                <option value="">-- Choose Hostel --</option>
                {hostels.map((h) => (
                  <option key={h.hostel_id} value={h.hostel_id}>
                    {h.hostel_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Room No</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 101"
                  className="w-full theme-input text-xs font-mono"
                  value={rForm.room_number}
                  onChange={(e) => setRForm({ ...rForm, room_number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Floor No</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 1"
                  className="w-full theme-input text-xs"
                  value={rForm.floor}
                  onChange={(e) => setRForm({ ...rForm, floor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Room type</label>
                <select
                  className="w-full theme-input text-xs"
                  value={rForm.room_type}
                  onChange={(e) => setRForm({ ...rForm, room_type: e.target.value })}
                >
                  <option value="SINGLE">SINGLE</option>
                  <option value="DOUBLE">DOUBLE</option>
                  <option value="TRIPLE">TRIPLE</option>
                  <option value="COMMON">COMMON</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-light-textMuted uppercase mb-1">Capacity Beds</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 2"
                  className="w-full theme-input text-xs"
                  value={rForm.capacity}
                  onChange={(e) => setRForm({ ...rForm, capacity: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="w-full theme-btn-primary py-2 text-xs">
              Commit Room insertion
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
