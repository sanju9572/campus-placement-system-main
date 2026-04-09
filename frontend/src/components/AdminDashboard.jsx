import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const D = {
  pageBg: (dm) => dm ? "linear-gradient(160deg,#0a0f1e 0%,#0d1f1a 50%,#091510 100%)" : "linear-gradient(160deg,#eef2ff 0%,#f0fdf4 60%,#ecfdf5 100%)",
  cardBg: (dm) => dm ? "rgba(10,31,26,0.85)" : "#ffffff",
  inputBg: (dm) => dm ? "rgba(10,31,26,0.7)" : "#f0fdf4",
  textPri: (dm) => dm ? "#d1fae5" : "#064e3b",
  textSec: (dm) => dm ? "#6ee7b7" : "#6b7280",
  textMuted: (dm) => dm ? "#4a7c6e" : "#9ca3af",
  border: (dm) => dm ? "rgba(16,185,129,0.2)" : "#d1fae5",
  headerBg: (dm) => dm ? "linear-gradient(135deg,#1e1b4b 0%,#065f46 100%)" : "linear-gradient(135deg,#4f46e5 0%,#10b981 100%)",
};

const Icon = ({ d, size = 18, color = "currentColor", sw = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const IC = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  company: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  apps: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2",
  placed: "M12 15l-2 5L5 8l14-3-5 10z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
  camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z M12 17a4 4 0 100-8 4 4 0 000 8z",
  plus: "M12 5v14M5 12h14",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  pdf: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  check: "M20 6L9 17l-5-5",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  mapPin: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 13a3 3 0 100-6 3 3 0 000 6z",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  close: "M18 6L6 18M6 6l12 12",
  trophy: "M6 9H4a2 2 0 00-2 2v1a4 4 0 004 4h1m8-7h2a2 2 0 012 2v1a4 4 0 01-4 4h-1M9 21h6M12 17v4M8 3h8l-1 6H9L8 3z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
};

const NAV_ITEMS = [
  { label: "Dashboard", id: "sec-dashboard", icon: IC.dashboard },
  { label: "Post Opportunity", id: "sec-addopp", icon: IC.company },
  { label: "Opportunities", id: "sec-opportunities", icon: IC.apps },
  { label: "Placed Students", id: "sec-placed", icon: IC.placed },
];

const APP_STATUS_OPTIONS = ["applied","shortlisted","test_scheduled","interviewed","offered","accepted","rejected"];
const APP_STATUS_CONFIG = {
  applied:       { label: "Applied",        bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  shortlisted:   { label: "Shortlisted",    bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  test_scheduled:{ label: "Test Scheduled", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  interviewed:   { label: "Interviewed",    bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  offered:       { label: "Offer Received", bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  accepted:      { label: "Accepted",       bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  rejected:      { label: "Rejected",       bg: "#fee2e2", color: "#7f1d1d", dot: "#ef4444" },
};

const Card = ({ children, darkMode, style = {} }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    style={{ background: D.cardBg(darkMode), borderRadius: 18, padding: "20px 22px", border: `1px solid ${D.border(darkMode)}`, boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.35)" : "0 4px 20px rgba(99,102,241,0.07)", ...style }}>
    {children}
  </motion.div>
);

const SectionTitle = ({ text, darkMode }) => (
  <motion.h2 initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
    style={{ fontSize: 17, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b", margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#10b981)", borderRadius: 4, display: "inline-block" }} />
    {text}
  </motion.h2>
);

const InputField = ({ label, darkMode, style = {}, ...props }) => (
  <div>
    <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>{label}</label>
    <input {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box", ...style }} />
  </div>
);

const TextareaField = ({ label, darkMode, style = {}, ...props }) => (
  <div>
    <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode), display: "block", marginBottom: 5 }}>{label}</label>
    <textarea {...props} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box", resize: "vertical", minHeight: 90, ...style }} />
  </div>
);

function Spinner({ color = "#10b981", size = 28 }) {
  return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: size, height: size, borderRadius: "50%", border: `3px solid ${color}25`, borderTopColor: color, margin: "0 auto" }} />;
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1";
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
      style={{ position: "fixed", top: 20, left: "50%", background: bg, color: "#fff", padding: "12px 24px", borderRadius: 14, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
      <Icon d={type === "success" ? IC.check : IC.warning} size={16} color="#fff" sw={2.5} />{message}
    </motion.div>
  );
}

function APIError({ message, onRetry, darkMode }) {
  return (
    <div style={{ padding: "14px 18px", background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2", borderRadius: 12, color: darkMode ? "#fca5a5" : "#7f1d1d", fontSize: 13, marginBottom: 12, border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
      <Icon d={IC.warning} size={16} color={darkMode ? "#fca5a5" : "#ef4444"} />
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && <button onClick={onRetry} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Retry</button>}
    </div>
  );
}

function Btn({ children, onClick, color = "indigo", loading = false, style = {}, ...props }) {
  const bgs = { indigo: "linear-gradient(135deg,#4f46e5,#10b981)", green: "linear-gradient(135deg,#10b981,#059669)", amber: "linear-gradient(135deg,#f59e0b,#d97706)", red: "linear-gradient(135deg,#ef4444,#dc2626)" };
  return (
    <motion.button whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.97 }} onClick={onClick} disabled={loading} {...props}
      style={{ background: bgs[color] || bgs.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6, opacity: loading ? 0.7 : 1, ...style }}>
      {loading ? <><Spinner color="#fff" size={14} /> Saving...</> : children}
    </motion.button>
  );
}

function StatCard({ title, value, icon, color, darkMode, delay = 0 }) {
  const pal = {
    indigo:  { l: { bg: "#eef2ff", ac: "#6366f1", tx: "#3730a3" }, d: { bg: "#1e1b4b", ac: "#818cf8", tx: "#c7d2fe" } },
    emerald: { l: { bg: "#d1fae5", ac: "#10b981", tx: "#065f46" }, d: { bg: "#064e3b", ac: "#34d399", tx: "#6ee7b7" } },
    amber:   { l: { bg: "#fef3c7", ac: "#f59e0b", tx: "#92400e" }, d: { bg: "#2d1a00", ac: "#fbbf24", tx: "#fcd34d" } },
    violet:  { l: { bg: "#ede9fe", ac: "#8b5cf6", tx: "#5b21b6" }, d: { bg: "#1a0d2e", ac: "#a78bfa", tx: "#c4b5fd" } },
    rose:    { l: { bg: "#ffe4e6", ac: "#f43f5e", tx: "#9f1239" }, d: { bg: "#2d0a0a", ac: "#fb7185", tx: "#fda4af" } },
  };
  const c = (pal[color] || pal.indigo)[darkMode ? "d" : "l"];
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }} whileHover={{ y: -4, boxShadow: `0 12px 28px ${c.ac}30` }}
      style={{ background: c.bg, borderRadius: 16, padding: "18px 14px", textAlign: "center", border: `1.5px solid ${c.ac}28` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.ac}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
        <Icon d={icon} size={20} color={c.ac} sw={1.8} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: c.ac, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: c.tx, fontWeight: 600, marginTop: 4 }}>{title}</div>
    </motion.div>
  );
}

function TopBar({ darkMode, setDarkMode, notifications, markAllRead, activeSection, onNav, admin, onPhotoChange, fileInputRef, onLogout }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  return (
    <header style={{ background: D.headerBg(darkMode), boxShadow: "0 4px 24px rgba(79,70,229,0.28)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 32px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div whileHover={{ scale: 1.08 }} style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "'Georgia',serif" }}>IU</motion.div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Georgia',serif", letterSpacing: 0.3, lineHeight: 1.2 }}>Indus University</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase" }}>Admin — Placement Portal</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => setDarkMode(!darkMode)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <Icon d={darkMode ? IC.sun : IC.moon} size={13} color="#fff" /> {darkMode ? "Light" : "Dark"}
          </motion.button>
          <div style={{ position: "relative" }}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowNotif(!showNotif)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={IC.bell} size={16} color="#fff" />
            </motion.button>
            {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{unread}</span>}
            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 46, width: 300, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200 }}>
                  <div style={{ padding: "11px 16px", borderBottom: `1px solid ${D.border(darkMode)}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: D.textPri(darkMode) }}>Notifications</span>
                    <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Mark all read</button>
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} style={{ padding: "10px 16px", borderBottom: `1px solid ${D.border(darkMode)}`, background: n.read ? "transparent" : darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={IC[n.icon] || IC.bell} size={14} color="#10b981" /></div>
                      <span style={{ fontSize: 12, color: D.textPri(darkMode), flex: 1 }}>{n.text}</span>
                      {!n.read && <span style={{ width: 7, height: 7, background: "#6366f1", borderRadius: "50%", flexShrink: 0 }} />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div style={{ position: "relative" }}>
            <motion.img whileHover={{ scale: 1.06 }} src={admin.avatar} alt="admin" onClick={() => setShowMenu(!showMenu)} style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)", cursor: "pointer", objectFit: "cover" }} />
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={onPhotoChange} />
            <AnimatePresence>
              {showMenu && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 50, width: 200, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200 }}>
                  <div style={{ padding: "12px 14px", borderBottom: `1px solid ${D.border(darkMode)}` }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: D.textPri(darkMode) }}>{admin.name}</div>
                    <div style={{ fontSize: 11, color: D.textSec(darkMode) }}>{admin.email}</div>
                  </div>
                  <button onClick={() => { fileInputRef.current?.click(); setShowMenu(false); }} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#6366f1", fontWeight: 600 }}>
                    <Icon d={IC.camera} size={14} color="#6366f1" /> Change Photo
                  </button>
                  <button onClick={onLogout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "10px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                    <Icon d={IC.logout} size={14} color="#ef4444" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button whileTap={{ scale: 0.92 }} onClick={onLogout} style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
            <Icon d={IC.logout} size={13} color="#fff" /> Logout
          </motion.button>
        </div>
      </div>
      <nav style={{ display: "flex", gap: 2, padding: "4px 28px", overflowX: "auto" }}>
        {NAV_ITEMS.map(({ label, id, icon }) => {
          const active = activeSection === id;
          return (
            <motion.button key={id} onClick={() => onNav(id)} whileHover={{ background: "rgba(255,255,255,0.12)" }}
              style={{ background: active ? "rgba(255,255,255,0.18)" : "transparent", border: "none", borderBottom: active ? "2.5px solid #fff" : "2.5px solid transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)", padding: "8px 14px", borderRadius: active ? "8px 8px 0 0" : 8, cursor: "pointer", fontSize: 12, fontWeight: active ? 700 : 400, whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={icon} size={13} color={active ? "#fff" : "rgba(255,255,255,0.65)"} />{label}
            </motion.button>
          );
        })}
      </nav>
    </header>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState("sec-dashboard");
  const [adminPic, setAdminPic] = useState("https://i.pravatar.cc/100?u=admin");
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const admin = { name: localStorage.getItem("name") || "Admin Coordinator", email: localStorage.getItem("email") || "admin@indusuni.ac.in", avatar: adminPic };

  const showToast = (message, type = "success") => setToast({ message, type, id: Date.now() });
  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const handleAdminPhotoChange = (e) => { const f = e.target.files[0]; if (!f) return; setAdminPic(URL.createObjectURL(f)); e.target.value = ""; };
  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(id); };

  useEffect(() => {
    const obs = NAV_ITEMS.map(({ id }) => {
      const el = document.getElementById(id); if (!el) return null;
      const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActiveSection(id); }, { threshold: 0.2 });
      o.observe(el); return o;
    });
    return () => obs.forEach((o) => o?.disconnect());
  }, []);

  const [notifications, setNotifications] = useState([{ id: 1, text: "Welcome to the Admin Panel!", read: false, icon: "dashboard" }]);
  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const addNotif = (text, icon = "bell") => setNotifications((p) => [{ id: Date.now(), text, read: false, icon }, ...p]);

  const [opportunities, setOpportunities] = useState([]);
  const [oppsLoading, setOppsLoading] = useState(false);
  const [oppsError, setOppsError] = useState("");

  const fetchOpportunities = useCallback(async () => {
    setOppsLoading(true); setOppsError("");
    try { const res = await API.get("/opportunities?skip=0&limit=50"); setOpportunities(res.data); }
    catch (err) { setOppsError(err.response?.data?.detail || "Failed to load opportunities"); }
    finally { setOppsLoading(false); }
  }, []);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  // ✅ company_name instead of company_id UUID, no POST hint banner
  const EMPTY_OPP = { company_name: "", title: "", description: "", location: "", ctc_lpa: "", application_deadline: "", additional_criteria: "", jdMode: "text" };
  const [oppForm, setOppForm] = useState(EMPTY_OPP);
  const [editingOppId, setEditingOppId] = useState(null);
  const [savingOpp, setSavingOpp] = useState(false);
  const jdPdfRef = useRef(null);

  const handleOppFormChange = (e) => { const { name, value } = e.target; setOppForm((p) => ({ ...p, [name]: value })); };

  const handleSaveOpportunity = async () => {
    if (!oppForm.company_name.trim()) { showToast("Company name is required", "error"); return; }
    if (!oppForm.title.trim()) { showToast("Job title is required", "error"); return; }
    setSavingOpp(true);
    try {
      const payload = { title: oppForm.title, description: oppForm.description || undefined, location: oppForm.location || undefined, ctc_lpa: oppForm.ctc_lpa ? parseFloat(oppForm.ctc_lpa) : undefined, application_deadline: oppForm.application_deadline ? new Date(oppForm.application_deadline).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString(), additional_criteria: oppForm.additional_criteria || undefined };
      if (editingOppId) {
        await API.patch(`/opportunities/${editingOppId}`, payload);
        showToast(`"${oppForm.title}" updated!`, "success"); addNotif(`Opportunity updated: ${oppForm.title}`, "edit"); setEditingOppId(null);
      } else {
        await API.post(`/companies/${encodeURIComponent(oppForm.company_name.trim())}/opportunities`, payload);
        showToast(`"${oppForm.title}" posted!`, "success"); addNotif(`New opportunity: ${oppForm.title}`, "company");
      }
      setOppForm(EMPTY_OPP); await fetchOpportunities(); scrollTo("sec-opportunities");
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(Array.isArray(detail) ? detail.map((e) => e.msg).join(" · ") : detail || "Failed to save", "error");
    } finally { setSavingOpp(false); }
  };

  const handlePublish = async (opp) => {
    const newStatus = opp.status === "active" ? "draft" : "active";
    try {
      await API.patch(`/opportunities/${opp.id}`, { status: newStatus });
      setOpportunities((p) => p.map((o) => o.id === opp.id ? { ...o, status: newStatus, is_accepting_applications: newStatus === "active" } : o));
      showToast(`"${opp.title}" is now ${newStatus}`, "success"); addNotif(`${opp.title} set to ${newStatus}`, "shield");
    } catch (err) { showToast(err.response?.data?.detail || "Update failed", "error"); }
  };

  const handleEditOpportunity = (opp) => {
    setOppForm({ company_name: opp.company_name || "", title: opp.title || "", description: opp.description || "", location: opp.location || "", ctc_lpa: opp.ctc_lpa?.toString() || "", application_deadline: opp.application_deadline ? new Date(opp.application_deadline).toISOString().slice(0, 16) : "", additional_criteria: opp.additional_criteria || "", jdMode: "text" });
    setEditingOppId(opp.id); scrollTo("sec-addopp");
  };

  const handleDeleteOpportunity = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try { await API.delete(`/opportunities/${id}`); setOpportunities((p) => p.filter((o) => o.id !== id)); showToast(`"${title}" deleted`, "success"); }
    catch (err) { showToast(err.response?.data?.detail || "Delete failed", "error"); }
  };

  const [viewOpp, setViewOpp] = useState(null);
  const [viewApps, setViewApps] = useState([]);
  const [viewAppsLoading, setViewAppsLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const handleViewOpportunity = async (opp) => {
    setViewOpp(opp); setViewAppsLoading(true);
    try { const res = await API.get(`/opportunities/${opp.id}/applications`); setViewApps(res.data); }
    catch (err) { showToast(err.response?.data?.detail || "Failed to load applications", "error"); }
    finally { setViewAppsLoading(false); }
  };

  const handleUpdateAppStatus = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      const res = await API.patch(`/applications/${appId}/status`, { status: newStatus });
      setViewApps((p) => p.map((a) => (a.id === appId ? { ...a, status: res.data.status } : a)));
      showToast(`Status updated to ${newStatus}`, "success");
      if (newStatus === "offered" || newStatus === "accepted") addNotif(`${res.data.student_name || "A student"} received an offer!`, "trophy");
    } catch (err) { showToast(err.response?.data?.detail || "Update failed", "error"); }
    finally { setUpdatingAppId(null); }
  };

  // ✅ Placed students — only photo + greeting
  const [placedStudents, setPlacedStudents] = useState([
    { id: 1, photo: "https://i.pravatar.cc/100?img=3", greeting: "Congratulations Aarav! Placed at Wipro." },
    { id: 2, photo: "https://i.pravatar.cc/100?img=5", greeting: "Well done Priya! Your hard work paid off." },
    { id: 3, photo: "https://i.pravatar.cc/100?img=8", greeting: "Rohan, your consistency brought you to TCS!" },
  ]);
  const [placedForm, setPlacedForm] = useState({ photo: null, greeting: "" });
  const placedPhotoRef = useRef(null);

  const handleAddPlacedStudent = () => {
    if (!placedForm.photo) { showToast("Please upload a photo", "error"); return; }
    if (!placedForm.greeting.trim()) { showToast("Greeting message is required", "error"); return; }
    setPlacedStudents((p) => [{ id: Date.now(), photo: placedForm.photo, greeting: placedForm.greeting }, ...p]);
    setPlacedForm({ photo: null, greeting: "" });
    showToast("Added to Wall of Fame!", "success"); addNotif("New student added to placed students!", "trophy");
  };

  const activeOpps = opportunities.filter((o) => o.status === "active").length;

  return (
    <div style={{ minHeight: "100vh", background: D.pageBg(darkMode), fontFamily: "'Outfit','Segoe UI',sans-serif", color: D.textPri(darkMode), transition: "background 0.35s, color 0.35s" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box}`}</style>
      <AnimatePresence>{toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}</AnimatePresence>

      <TopBar darkMode={darkMode} setDarkMode={setDarkMode} notifications={notifications} markAllRead={markAllRead} activeSection={activeSection} onNav={scrollTo} admin={admin} onPhotoChange={handleAdminPhotoChange} fileInputRef={fileInputRef} onLogout={handleLogout} />

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* DASHBOARD */}
        <div id="sec-dashboard">
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: darkMode ? "linear-gradient(135deg,rgba(79,70,229,0.6),rgba(6,95,70,0.5))" : "linear-gradient(135deg,#4f46e5,#10b981)", borderRadius: 22, padding: "26px 32px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginBottom: 4 }}>Admin Panel</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Welcome, {admin.name}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.72)" }}>Placement Coordinator · {admin.email}</div>
            </div>
            <div style={{ display: "flex", gap: 12, position: "relative" }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo("sec-addopp")} style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.plus} size={14} color="#fff" /> Post Opportunity
              </motion.button>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={() => scrollTo("sec-placed")} style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 12, padding: "9px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.trophy} size={14} color="#fff" /> Add Placed Student
              </motion.button>
            </div>
          </motion.div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14 }}>
            <StatCard title="Total Opps"     value={opportunities.length}                                    icon={IC.company} color="indigo"  darkMode={darkMode} delay={0}    />
            <StatCard title="Active"          value={activeOpps}                                              icon={IC.shield}  color="emerald" darkMode={darkMode} delay={0.08} />
            <StatCard title="Draft"           value={opportunities.filter((o) => o.status === "draft").length} icon={IC.edit}   color="amber"   darkMode={darkMode} delay={0.16} />
            <StatCard title="Placed Students" value={placedStudents.length}                                   icon={IC.trophy}  color="violet"  darkMode={darkMode} delay={0.24} />
            <StatCard title="Notifications"   value={notifications.filter((n) => !n.read).length}             icon={IC.bell}    color="rose"    darkMode={darkMode} delay={0.32} />
          </div>
        </div>

        {/* POST OPPORTUNITY */}
        <div id="sec-addopp" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text={editingOppId ? "Edit Opportunity" : "Post New Opportunity"} darkMode={darkMode} />
          <Card darkMode={darkMode}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
              {/* ✅ Company Name (no UUID, no POST banner) */}
              <InputField label="Company Name *" darkMode={darkMode} name="company_name" placeholder="e.g. Tata Consultancy Services" value={oppForm.company_name} onChange={handleOppFormChange} disabled={!!editingOppId} style={editingOppId ? { opacity: 0.5, cursor: "not-allowed" } : {}} />
              <InputField label="Job Title *"            darkMode={darkMode} name="title"               placeholder="e.g. SDE Intern"           value={oppForm.title}                onChange={handleOppFormChange} />
              <InputField label="Location"               darkMode={darkMode} name="location"            placeholder="e.g. Bangalore"            value={oppForm.location}             onChange={handleOppFormChange} />
              <InputField label="CTC (LPA)"              darkMode={darkMode} name="ctc_lpa"             type="number" step="0.5" placeholder="e.g. 12.5" value={oppForm.ctc_lpa}  onChange={handleOppFormChange} />
              <InputField label="Application Deadline"   darkMode={darkMode} name="application_deadline" type="datetime-local"                  value={oppForm.application_deadline} onChange={handleOppFormChange} />
              <InputField label="Additional Criteria"    darkMode={darkMode} name="additional_criteria" placeholder="e.g. ML project required"  value={oppForm.additional_criteria}  onChange={handleOppFormChange} />
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode) }}>Description</label>
                <div style={{ display: "flex", background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", borderRadius: 8, padding: 3, gap: 3 }}>
                  {["text", "pdf"].map((mode) => (
                    <button key={mode} onClick={() => setOppForm((p) => ({ ...p, jdMode: mode }))} style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, background: oppForm.jdMode === mode ? "#10b981" : "transparent", color: oppForm.jdMode === mode ? "#fff" : D.textSec(darkMode), transition: "all 0.2s" }}>
                      {mode === "text" ? "Write" : "Upload PDF"}
                    </button>
                  ))}
                </div>
              </div>
              {oppForm.jdMode === "text" ? (
                <TextareaField darkMode={darkMode} name="description" placeholder="Enter job description, requirements, eligibility..." value={oppForm.description} onChange={handleOppFormChange} style={{ minHeight: 110 }} />
              ) : (
                <div>
                  <input ref={jdPdfRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) setOppForm((p) => ({ ...p, description: `[PDF] ${f.name}` })); }} />
                  <motion.button whileTap={{ scale: 0.96 }} onClick={() => jdPdfRef.current?.click()} style={{ width: "100%", padding: "20px", borderRadius: 12, border: `2px dashed ${D.border(darkMode)}`, background: D.inputBg(darkMode), cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                    <Icon d={IC.pdf} size={28} color="#10b981" />
                    <div style={{ fontSize: 13, fontWeight: 600, color: D.textPri(darkMode) }}>{oppForm.description?.startsWith("[PDF]") ? `✓ ${oppForm.description}` : "Click to upload JD PDF"}</div>
                    <div style={{ fontSize: 11, color: D.textSec(darkMode) }}>PDF only · Max 10MB</div>
                  </motion.button>
                </div>
              )}
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn onClick={handleSaveOpportunity} loading={savingOpp}><Icon d={editingOppId ? IC.check : IC.plus} size={14} color="#fff" />{editingOppId ? "Update Opportunity" : "Post Opportunity"}</Btn>
              {editingOppId && <Btn color="amber" onClick={() => { setOppForm(EMPTY_OPP); setEditingOppId(null); }}>Cancel Edit</Btn>}
              <Btn color="amber" onClick={() => setOppForm(EMPTY_OPP)}>Clear</Btn>
            </div>
          </Card>
        </div>

        {/* OPPORTUNITIES LIST */}
        <div id="sec-opportunities" style={{ scrollMarginTop: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle text={`All Opportunities (${opportunities.length})`} darkMode={darkMode} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={fetchOpportunities} style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "6px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={IC.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
            </motion.button>
          </div>
          {oppsLoading && <div style={{ textAlign: "center", padding: 40 }}><Spinner /><div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading opportunities...</div></div>}
          {oppsError && <APIError message={oppsError} onRetry={fetchOpportunities} darkMode={darkMode} />}
          {!oppsLoading && !oppsError && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
              {opportunities.map((opp) => (
                <motion.div key={opp.id} whileHover={{ y: -3 }} style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}` }}>
                  <div style={{ height: 5, background: opp.status === "active" ? "linear-gradient(90deg,#4f46e5,#10b981)" : opp.status === "closed" ? "#9ca3af" : "linear-gradient(90deg,#f59e0b,#d97706)" }} />
                  <div style={{ padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: D.textPri(darkMode) }}>{opp.title}</div>
                        <div style={{ fontSize: 11, color: D.textSec(darkMode), marginTop: 2 }}>{opp.company_name || opp.company_id}</div>
                      </div>
                      <span style={{ background: opp.status === "active" ? "#d1fae5" : opp.status === "closed" ? "#fee2e2" : "#fef3c7", color: opp.status === "active" ? "#065f46" : opp.status === "closed" ? "#7f1d1d" : "#92400e", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: "capitalize" }}>{opp.status}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                      {opp.location && <span style={{ background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Icon d={IC.mapPin} size={10} color={darkMode ? "#6ee7b7" : "#065f46"} /> {opp.location}</span>}
                      {opp.ctc_lpa && <span style={{ background: darkMode ? "rgba(99,102,241,0.12)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>₹{opp.ctc_lpa} LPA</span>}
                      {opp.application_deadline && <span style={{ background: darkMode ? "rgba(239,68,68,0.1)" : "#fee2e2", color: darkMode ? "#fca5a5" : "#7f1d1d", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>Due: {new Date(opp.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
                    </div>
                    {opp.description && <p style={{ fontSize: 12, color: D.textSec(darkMode), marginBottom: 10, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{opp.description}</p>}
                    <div style={{ fontSize: 11, color: D.textMuted(darkMode), marginBottom: 12 }}>
                      Created: {new Date(opp.created_at).toLocaleDateString("en-IN")}
                      {opp.application_count !== undefined && <span> · {opp.application_count} applications</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <motion.button whileTap={{ scale: 0.96 }} onClick={() => handlePublish(opp)} style={{ flex: 1, background: opp.status === "active" ? "linear-gradient(135deg,#f59e0b,#d97706)" : "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "8px", fontWeight: 700, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                        <Icon d={opp.status === "active" ? IC.eye : IC.check} size={13} color="#fff" />{opp.status === "active" ? "Unpublish" : "Publish"}
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleViewOpportunity(opp)} style={{ background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", border: "none", borderRadius: 10, padding: "8px 12px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, color: darkMode ? "#6ee7b7" : "#065f46", fontSize: 12, fontWeight: 600 }}>
                        <Icon d={IC.apps} size={13} color={darkMode ? "#6ee7b7" : "#065f46"} /> Applicants
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleEditOpportunity(opp)} style={{ background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}><Icon d={IC.edit} size={14} color="#6366f1" /></motion.button>
                      <motion.button whileTap={{ scale: 0.95 }} onClick={() => handleDeleteOpportunity(opp.id, opp.title)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer" }}><Icon d={IC.trash} size={14} color="#ef4444" /></motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {opportunities.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 48, color: D.textMuted(darkMode) }}>No opportunities yet. Post one above!</div>}
            </div>
          )}
        </div>

        {/* PLACED STUDENTS */}
        <div id="sec-placed" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="Placed Students — Wall of Fame" darkMode={darkMode} />
          <Card darkMode={darkMode} style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: D.textPri(darkMode), marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Icon d={IC.plus} size={16} color="#10b981" /> Add Placed Student
            </div>
            {/* ✅ Only greeting + photo upload */}
            <div style={{ marginBottom: 14 }}>
              <TextareaField label="Greeting Message *" darkMode={darkMode} placeholder="e.g. Congratulations Rahul! Your dedication led you to TCS." value={placedForm.greeting} onChange={(e) => setPlacedForm((p) => ({ ...p, greeting: e.target.value }))} style={{ minHeight: 70 }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <input ref={placedPhotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files[0]; if (f) setPlacedForm((p) => ({ ...p, photo: URL.createObjectURL(f) })); }} />
              <motion.button whileTap={{ scale: 0.96 }} onClick={() => placedPhotoRef.current?.click()} style={{ padding: "9px 16px", borderRadius: 10, border: `1.5px dashed ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Icon d={IC.camera} size={14} color={D.textSec(darkMode)} />{placedForm.photo ? "Photo Uploaded ✓" : "Upload Photo *"}
              </motion.button>
              {placedForm.photo && <img src={placedForm.photo} alt="preview" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "2px solid #10b981" }} />}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
              <Btn onClick={handleAddPlacedStudent} color="green"><Icon d={IC.trophy} size={14} color="#fff" /> Add to Wall of Fame</Btn>
              <Btn color="amber" onClick={() => setPlacedForm({ photo: null, greeting: "" })}>Clear</Btn>
            </div>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16 }}>
            {placedStudents.map((s) => (
              <motion.div key={s.id} whileHover={{ y: -6 }} style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", position: "relative" }}>
                <div style={{ width: "100%", aspectRatio: "1/1", background: "#000", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <motion.img src={s.photo} alt="student" whileHover={{ scale: 1.05 }} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  <div style={{ position: "absolute", top: 12, right: 12, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 11, padding: "5px 12px", borderRadius: 8, fontWeight: 700 }}>🎉 Placed</div>
                </div>
                <div style={{ padding: "14px 16px", textAlign: "center" }}>
                  <div style={{ margin: "0 0 10px", padding: "8px 12px", background: darkMode ? "rgba(16,185,129,0.1)" : "#f0fdf4", borderRadius: 10, fontSize: 12, color: D.textSec(darkMode), fontStyle: "italic" }}>🎉 {s.greeting}</div>
                  <motion.button whileTap={{ scale: 0.95 }} onClick={() => setPlacedStudents((p) => p.filter((x) => x.id !== s.id))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "6px 14px", color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5, margin: "0 auto" }}>
                    <Icon d={IC.trash} size={12} color="#ef4444" /> Remove
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "20px 0", borderTop: `1px solid ${D.border(darkMode)}`, fontSize: 12, color: D.textMuted(darkMode) }}>
          © {new Date().getFullYear()} Indus University Placement Portal · Admin Panel
        </div>
      </main>

      {/* APPLICANTS MODAL */}
      <AnimatePresence>
        {viewOpp && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewOpp(null)}>
            <motion.div initial={{ scale: 0.92, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 20 }} onClick={(e) => e.stopPropagation()}
              style={{ background: D.cardBg(darkMode), borderRadius: 22, padding: "28px", width: "100%", maxWidth: 620, maxHeight: "85vh", overflowY: "auto", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: D.textPri(darkMode) }}>{viewOpp.title}</div>
                  <div style={{ fontSize: 12, color: "#10b981", marginTop: 2 }}>Applications for this opportunity</div>
                </div>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => setViewOpp(null)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: "6px 10px", cursor: "pointer" }}>
                  <Icon d={IC.close} size={16} color="#ef4444" />
                </motion.button>
              </div>
              {viewAppsLoading ? (
                <div style={{ textAlign: "center", padding: 32 }}><Spinner /></div>
              ) : viewApps.length === 0 ? (
                <div style={{ textAlign: "center", padding: 32, color: D.textMuted(darkMode), fontSize: 13 }}>No applications yet for this opportunity.</div>
              ) : (
                viewApps.map((app) => {
                  const cfg = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.applied;
                  return (
                    <div key={app.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: darkMode ? "rgba(16,185,129,0.05)" : "#f9faff", border: `1px solid ${D.border(darkMode)}`, flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#10b981" }}>{app.student_name?.[0] || "?"}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14, color: D.textPri(darkMode) }}>{app.student_name}</div>
                          <div style={{ fontSize: 11, color: D.textSec(darkMode) }}>{app.student_email}{app.student_cgpa && <span> · CGPA: {app.student_cgpa}</span>}{app.student_department && <span> · {app.student_department}</span>}</div>
                          <div style={{ fontSize: 11, color: D.textMuted(darkMode) }}>Applied: {new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <select value={app.status} disabled={updatingAppId === app.id} onChange={(e) => handleUpdateAppStatus(app.id, e.target.value)} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${D.border(darkMode)}`, background: D.inputBg(darkMode), color: D.textPri(darkMode), fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                          {APP_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{APP_STATUS_CONFIG[s]?.label || s}</option>)}
                        </select>
                        <span style={{ background: cfg.bg, color: cfg.color, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />{cfg.label}
                        </span>
                        {updatingAppId === app.id && <Spinner size={16} />}
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}