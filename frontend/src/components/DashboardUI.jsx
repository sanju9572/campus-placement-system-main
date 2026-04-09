import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

const LS_PLACED = "portal_placed_students";
const LS_JOBS = "portal_jobs";

const D = {
  pageBg: (dm) =>
    dm
      ? "linear-gradient(160deg,#0a0f1e 0%,#0d1f1a 50%,#091510 100%)"
      : "linear-gradient(160deg,#eef2ff 0%,#f0fdf4 60%,#ecfdf5 100%)",
  cardBg: (dm) => (dm ? "rgba(10,31,26,0.85)" : "#ffffff"),
  inputBg: (dm) => (dm ? "rgba(10,31,26,0.7)" : "#ffffff"),
  textPri: (dm) => (dm ? "#d1fae5" : "#064e3b"),
  textSec: (dm) => (dm ? "#6ee7b7" : "#6b7280"),
  textMuted: (dm) => (dm ? "#4a7c6e" : "#9ca3af"),
  border: (dm) => (dm ? "rgba(16,185,129,0.2)" : "#d1fae5"),
  border2: (dm) => (dm ? "rgba(255,255,255,0.06)" : "#f0fdf4"),
  headerBg: (dm) =>
    dm
      ? "linear-gradient(135deg,#1e1b4b 0%,#065f46 100%)"
      : "linear-gradient(135deg,#4f46e5 0%,#10b981 100%)",
};

function parseApiError(detail, fallback = "An error occurred") {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => e.msg || JSON.stringify(e)).join(", ");
  if (typeof detail === "object")
    return detail.msg || detail.message || JSON.stringify(detail);
  return String(detail);
}
const lsGet = (key, def) => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
};

const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z",
  moon: "M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",
  bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  briefcase: "M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2zM16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2",
  calendar: "M3 9h18M3 15h18M9 3v18M15 3v18M3 3h18v18H3z",
  mic: "M12 2a3 3 0 013 3v7a3 3 0 01-6 0V5a3 3 0 013-3zM19 10v2a7 7 0 01-14 0v-2M12 19v3M8 22h8",
  trophy: "M6 9H4a2 2 0 00-2 2v1a4 4 0 004 4h1m8-7h2a2 2 0 012 2v1a4 4 0 01-4 4h-1M9 21h6M12 17v4M8 3h8l-1 6H9L8 3z",
  close: "M18 6L6 18M6 6l12 12",
  lightning: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  upload: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  search: "M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z",
  mapPin: "M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z M12 10m-3 0a3 3 0 106 0 3 3 0 10-6 0",
  dollar: "M12 2v20M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  download: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  camera: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2zM12 17a4 4 0 100-8 4 4 0 000 8z",
  logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  check: "M20 6L9 17l-5-5",
  clock: "M12 22a10 10 0 110-20 10 10 0 010 20zM12 6v6l4 2",
  user: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  chartBar: "M18 20V10M12 20V4M6 20v-6",
  plus: "M12 5v14M5 12h14",
  alumni: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  jobs: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  refresh: "M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  warning: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  info: "M12 22a10 10 0 110-20 10 10 0 010 20zM12 8h.01M12 12v4",
  edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  menu: "M4 6h16M4 12h16M4 18h16",
};

const NAV_ITEMS = [
  { label: "Dashboard", id: "section-dashboard", icon: Icons.chartBar },
  { label: "Job Listings", id: "section-jobs", icon: Icons.jobs },
  { label: "My Applications", id: "section-applications", icon: Icons.briefcase },
  { label: "Interviews", id: "section-interviews", icon: Icons.mic },
  { label: "Placed Students", id: "section-placed", icon: Icons.trophy },
  { label: "Alumni", id: "section-alumni", icon: Icons.alumni },
];

const APP_STATUS = {
  applied: { label: "Applied", bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  shortlisted: { label: "Shortlisted", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  test_scheduled: { label: "Test Scheduled", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  interviewed: { label: "Interviewed", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  offered: { label: "Offer Received", bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  accepted: { label: "Accepted", bg: "#dcfce7", color: "#14532d", dot: "#22c55e" },
  rejected: { label: "Rejected", bg: "#fee2e2", color: "#7f1d1d", dot: "#ef4444" },
};

// ── Edit Profile Modal ────────────────────────────────────────────────────────
function EditProfileModal({ darkMode, onClose, onSave, initialData }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    roll_no: initialData?.roll_no || "",
    department_id: initialData?.department_id || "",
    graduation_year: initialData?.graduation_year || "",
    cgpa: initialData?.cgpa || "",
    active_backlogs: initialData?.active_backlogs ?? "",
    total_backlogs: initialData?.total_backlogs ?? "",
    tenth_percentage: initialData?.tenth_percentage || "",
    twelfth_percentage: initialData?.twelfth_percentage || "",
    linkedin_url: initialData?.linkedin_url || "",
    github_url: initialData?.github_url || "",
    portfolio_url: initialData?.portfolio_url || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") { alert("Only PDF files are allowed!"); e.target.value = ""; return; }
    if (file && file.size > 5 * 1024 * 1024) { alert("File size must be less than 5MB!"); e.target.value = ""; return; }
    setResumeFile(file);
  };

  const sections = ["Basic Info", "Academic", "Backlogs", "Resume & Links"];

  const handleSubmit = async () => {
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      let resumeUrl = initialData?.resume_url || "";

      if (resumeFile) {
        const data = new FormData();
        data.append("file", resumeFile);
        const res = await API.post("/upload/resume", data, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
        resumeUrl = res.data.resume_url;
      }

      const payload = {
        ...formData,
        graduation_year: Number(formData.graduation_year),
        cgpa: Number(formData.cgpa),
        active_backlogs: Number(formData.active_backlogs),
        total_backlogs: Number(formData.total_backlogs),
        tenth_percentage: Number(formData.tenth_percentage),
        twelfth_percentage: Number(formData.twelfth_percentage),
        resume_url: resumeUrl,
        placement_status: initialData?.placement_status || "unplaced",
        is_profile_complete: true,
      };

      await API.put("/student/profile", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onSave(payload);
      alert("Profile updated successfully! 🎉");
      onClose();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) alert(detail.map(e => e.msg).join("\n"));
      else alert(detail || "Error updating profile ❌");
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: `1px solid ${D.border(darkMode)}`,
    background: darkMode ? "rgba(16,185,129,0.06)" : "#f9fafb",
    color: D.textPri(darkMode), fontSize: 13, outline: "none", boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 12, color: D.textSec(darkMode), marginBottom: 4, display: "block", fontWeight: 600 };
  const fieldGroup = { marginBottom: 14 };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <motion.div
        initial={{ scale: 0.88, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88 }}
        onClick={e => e.stopPropagation()}
        style={{ background: D.cardBg(darkMode), borderRadius: 24, width: "100%", maxWidth: 600, maxHeight: "90vh", overflow: "hidden", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 32px 80px rgba(0,0,0,0.3)", display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#4f46e5,#10b981)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.edit} size={18} color="#fff" />
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 17 }}>Edit Profile</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Update your information</div>
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={onClose}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon d={Icons.close} size={16} color="#fff" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Section Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "12px 20px", background: darkMode ? "rgba(16,185,129,0.05)" : "#f8faff", borderBottom: `1px solid ${D.border(darkMode)}`, flexShrink: 0 }}>
          {sections.map((s, i) => (
            <button key={i} onClick={() => setCurrentSection(i)} style={{ flex: 1, padding: "7px 4px", borderRadius: 10, border: i === currentSection ? "none" : `1px solid ${D.border(darkMode)}`, background: i === currentSection ? "linear-gradient(135deg,#4f46e5,#10b981)" : "transparent", color: i === currentSection ? "#fff" : D.textSec(darkMode), fontSize: 11, fontWeight: i === currentSection ? 700 : 500, cursor: "pointer", transition: "all 0.2s" }}>
              {s}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {currentSection === 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldGroup}><label style={labelStyle}>First Name *</label><input style={inputStyle} name="first_name" value={formData.first_name} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>Last Name *</label><input style={inputStyle} name="last_name" value={formData.last_name} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>Roll Number *</label><input style={inputStyle} name="roll_no" value={formData.roll_no} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>Department ID *</label><input style={inputStyle} name="department_id" value={formData.department_id} onChange={handleChange} /></div>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>Graduation Year * (2000–2030)</label><input style={inputStyle} name="graduation_year" type="number" min="2000" max="2030" value={formData.graduation_year} onChange={handleChange} /></div>
            </div>
          )}
          {currentSection === 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ ...fieldGroup, gridColumn: "1 / -1" }}><label style={labelStyle}>CGPA * (1–10)</label><input style={inputStyle} name="cgpa" type="number" min="1" max="10" step="0.01" value={formData.cgpa} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>10th Percentage * (0–100)</label><input style={inputStyle} name="tenth_percentage" type="number" min="0" max="100" step="0.01" value={formData.tenth_percentage} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>12th Percentage * (0–100)</label><input style={inputStyle} name="twelfth_percentage" type="number" min="0" max="100" step="0.01" value={formData.twelfth_percentage} onChange={handleChange} /></div>
            </div>
          )}
          {currentSection === 2 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={fieldGroup}><label style={labelStyle}>Active Backlogs *</label><input style={inputStyle} name="active_backlogs" type="number" min="0" value={formData.active_backlogs} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>Total Backlogs *</label><input style={inputStyle} name="total_backlogs" type="number" min="0" value={formData.total_backlogs} onChange={handleChange} /></div>
            </div>
          )}
          {currentSection === 3 && (
            <div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Upload New Resume (PDF only, max 5MB — leave blank to keep existing)</label>
                <div style={{ border: `2px dashed ${D.border(darkMode)}`, borderRadius: 12, padding: "14px 16px", background: darkMode ? "rgba(16,185,129,0.05)" : "#f0fdf4", cursor: "pointer" }}>
                  <input type="file" accept=".pdf" onChange={handleResumeChange} style={{ fontSize: 13, color: D.textSec(darkMode), width: "100%" }} />
                  {resumeFile && <div style={{ marginTop: 8, fontSize: 12, color: "#10b981", fontWeight: 600 }}>✅ {resumeFile.name} selected</div>}
                  {!resumeFile && initialData?.resume_url && <div style={{ marginTop: 6, fontSize: 11, color: D.textMuted(darkMode) }}>Current resume on file — upload new to replace</div>}
                </div>
              </div>
              <div style={fieldGroup}><label style={labelStyle}>LinkedIn URL *</label><input style={inputStyle} name="linkedin_url" type="url" value={formData.linkedin_url} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>GitHub URL *</label><input style={inputStyle} name="github_url" type="url" value={formData.github_url} onChange={handleChange} /></div>
              <div style={fieldGroup}><label style={labelStyle}>Portfolio URL *</label><input style={inputStyle} name="portfolio_url" type="url" value={formData.portfolio_url} onChange={handleChange} /></div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "14px 24px", borderTop: `1px solid ${D.border(darkMode)}`, display: "flex", gap: 10, flexShrink: 0, background: darkMode ? "rgba(0,0,0,0.2)" : "#f8faff" }}>
          {currentSection > 0 && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentSection(s => s - 1)}
              style={{ padding: "10px 18px", borderRadius: 12, border: `1px solid ${D.border(darkMode)}`, background: "transparent", color: D.textSec(darkMode), fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              ← Back
            </motion.button>
          )}
          <motion.button whileTap={{ scale: 0.97 }} onClick={onClose}
            style={{ padding: "10px 18px", borderRadius: 12, border: `1px solid ${D.border(darkMode)}`, background: "transparent", color: D.textSec(darkMode), fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
            Cancel
          </motion.button>
          {currentSection < 3 ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCurrentSection(s => s + 1)}
              style={{ flex: 1, padding: "10px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#4f46e5,#10b981)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
              Next →
            </motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={uploading}
              style={{ flex: 1, padding: "10px 18px", borderRadius: 12, border: "none", background: uploading ? "#9ca3af" : "linear-gradient(135deg,#4f46e5,#10b981)", color: "#fff", fontWeight: 700, cursor: uploading ? "not-allowed" : "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Icon d={Icons.check} size={15} color="#fff" strokeWidth={2.5} />
              {uploading ? "Saving..." : "Save Changes"}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────
function Card({ children, darkMode, style = {} }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      style={{ background: D.cardBg(darkMode), borderRadius: 18, padding: "20px 22px", border: `1px solid ${D.border(darkMode)}`, boxShadow: darkMode ? "0 2px 20px rgba(0,0,0,0.4)" : "0 2px 16px rgba(99,102,241,0.06)", ...style }}>
      {children}
    </motion.div>
  );
}
function SectionTitle({ text, darkMode }) {
  return (
    <motion.h2 initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
      style={{ fontSize: 17, fontWeight: 700, color: darkMode ? "#6ee7b7" : "#064e3b", margin: "28px 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ display: "inline-block", width: 4, height: 18, background: "linear-gradient(180deg,#6366f1,#10b981)", borderRadius: 4 }} />
      {text}
    </motion.h2>
  );
}
function Spinner({ color = "#10b981" }) {
  return (
    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${color}30`, borderTopColor: color, margin: "0 auto" }} />
  );
}
function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#6366f1";
  return (
    <motion.div initial={{ opacity: 0, y: -20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: -20, x: "-50%" }}
      style={{ position: "fixed", top: 20, left: "50%", background: bg, color: "#fff", padding: "12px 24px", borderRadius: 14, fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8 }}>
      <Icon d={type === "success" ? Icons.check : Icons.warning} size={16} color="#fff" strokeWidth={2.5} />
      {String(message)}
    </motion.div>
  );
}
function StatCard({ title, value, iconPath, color, darkMode, delay = 0 }) {
  const pal = {
    indigo: { l: { bg: "#eef2ff", ac: "#6366f1", tx: "#3730a3" }, d: { bg: "#1e1b4b", ac: "#818cf8", tx: "#c7d2fe" } },
    sky: { l: { bg: "#e0f2fe", ac: "#0ea5e9", tx: "#0369a1" }, d: { bg: "#0c2340", ac: "#38bdf8", tx: "#7dd3fc" } },
    emerald: { l: { bg: "#d1fae5", ac: "#10b981", tx: "#065f46" }, d: { bg: "#064e3b", ac: "#34d399", tx: "#6ee7b7" } },
    amber: { l: { bg: "#fef3c7", ac: "#f59e0b", tx: "#92400e" }, d: { bg: "#2d1a00", ac: "#fbbf24", tx: "#fcd34d" } },
    rose: { l: { bg: "#ffe4e6", ac: "#f43f5e", tx: "#9f1239" }, d: { bg: "#2d0a0a", ac: "#fb7185", tx: "#fda4af" } },
    violet: { l: { bg: "#ede9fe", ac: "#8b5cf6", tx: "#5b21b6" }, d: { bg: "#1a0d2e", ac: "#a78bfa", tx: "#c4b5fd" } },
  };
  const c = (pal[color] || pal.indigo)[darkMode ? "d" : "l"];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: `0 12px 32px ${c.ac}30` }}
      style={{ background: c.bg, borderRadius: 16, padding: "18px 14px", textAlign: "center", border: `1.5px solid ${c.ac}28` }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: `${c.ac}18`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px" }}>
        <Icon d={iconPath} size={20} color={c.ac} strokeWidth={1.8} />
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: c.ac, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: c.tx, fontWeight: 600, marginTop: 4 }}>{title}</div>
    </motion.div>
  );
}

// ── TopBar with Options Menu ──────────────────────────────────────────────────
function TopBar({ darkMode, setDarkMode, notifications, markAllRead, activeSection, onLogout, onEditProfile }) {
  const [showNotif, setShowNotif] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;
  const optionsRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (optionsRef.current && !optionsRef.current.contains(e.target)) setShowOptions(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setShowNotif(false);
  };

  return (
    <header style={{ background: D.headerBg(darkMode), boxShadow: "0 4px 24px rgba(79,70,229,0.25)", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 32px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div whileHover={{ scale: 1.08 }} style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Georgia',serif", flexShrink: 0 }}>
            IU
          </motion.div>
          <div>
            <div style={{ color: "#fff", fontWeight: 800, fontSize: 19, fontFamily: "'Georgia',serif", letterSpacing: 0.3, lineHeight: 1.2 }}>Indus University</div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase" }}>Placement Portal</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Dark mode toggle */}
          <motion.button whileTap={{ scale: 0.92 }} onClick={() => setDarkMode(!darkMode)}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: "6px 14px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
            <Icon d={darkMode ? Icons.sun : Icons.moon} size={14} color="#fff" /> {darkMode ? "Light" : "Dark"}
          </motion.button>

          {/* Notification Bell */}
          <div style={{ position: "relative" }}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowNotif(!showNotif)}
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "50%", width: 38, height: 38, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.bell} size={16} color="#fff" />
            </motion.button>
            {unread > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                style={{ position: "absolute", top: -3, right: -3, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 17, height: 17, fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                {unread}
              </motion.span>
            )}
            <AnimatePresence>
              {showNotif && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 46, width: 310, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200 }}>
                  <div style={{ padding: "12px 16px", borderBottom: `1px solid ${D.border(darkMode)}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: D.textPri(darkMode) }}>Notifications</span>
                    <button onClick={markAllRead} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Mark all read</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "20px", textAlign: "center", color: D.textMuted(darkMode), fontSize: 13 }}>No notifications</div>
                  ) : notifications.map((n) => (
                    <div key={n.id} style={{ padding: "11px 16px", borderBottom: `1px solid ${D.border2(darkMode)}`, background: n.read ? "transparent" : darkMode ? "rgba(16,185,129,0.08)" : "#f0fdf4", display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={Icons[n.icon] || Icons.bell} size={15} color="#10b981" />
                      </div>
                      <span style={{ fontSize: 13, color: D.textPri(darkMode), flex: 1, lineHeight: 1.4 }}>{String(n.text)}</span>
                      {!n.read && <span style={{ width: 7, height: 7, background: "#6366f1", borderRadius: "50%", flexShrink: 0 }} />}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ✅ Options Menu — Profile button with dropdown */}
          <div style={{ position: "relative" }} ref={optionsRef}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={() => setShowOptions(!showOptions)}
              style={{ background: showOptions ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.35)", borderRadius: 20, padding: "6px 16px", color: "#fff", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 7, fontWeight: 600, transition: "background 0.2s" }}>
              <Icon d={Icons.user} size={14} color="#fff" />
              Profile
              <Icon d={Icons.menu} size={13} color="rgba(255,255,255,0.8)" />
            </motion.button>

            <AnimatePresence>
              {showOptions && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  style={{ position: "absolute", right: 0, top: 46, width: 200, background: D.cardBg(darkMode), borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.22)", border: `1px solid ${D.border(darkMode)}`, overflow: "hidden", zIndex: 200 }}>
                  <motion.button whileHover={{ background: darkMode ? "rgba(99,102,241,0.15)" : "#eef2ff" }}
                    onClick={() => { setShowOptions(false); onEditProfile(); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6366f1", fontWeight: 600, textAlign: "left", transition: "background 0.15s" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: darkMode ? "rgba(99,102,241,0.2)" : "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={Icons.edit} size={14} color="#6366f1" />
                    </div>
                    Edit Profile
                  </motion.button>
                  <div style={{ height: "0.5px", background: D.border(darkMode) }} />
                  <motion.button whileHover={{ background: darkMode ? "rgba(239,68,68,0.1)" : "#fff1f2" }}
                    onClick={() => { setShowOptions(false); onLogout(); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#ef4444", fontWeight: 600, textAlign: "left", transition: "background 0.15s" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: darkMode ? "rgba(239,68,68,0.15)" : "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon d={Icons.logout} size={14} color="#ef4444" />
                    </div>
                    Logout
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <nav style={{ display: "flex", gap: 2, padding: "4px 28px", overflowX: "auto" }}>
        {NAV_ITEMS.map(({ label, id, icon }) => {
          const isActive = activeSection === id;
          return (
            <motion.button key={id} onClick={() => scrollTo(id)} whileHover={{ background: "rgba(255,255,255,0.12)" }}
              style={{ background: isActive ? "rgba(255,255,255,0.18)" : "transparent", border: "none", borderBottom: isActive ? "2.5px solid #fff" : "2.5px solid transparent", color: isActive ? "#fff" : "rgba(255,255,255,0.65)", padding: "8px 14px", borderRadius: isActive ? "8px 8px 0 0" : 8, cursor: "pointer", fontSize: 12, fontWeight: isActive ? 700 : 400, whiteSpace: "nowrap", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={icon} size={13} color={isActive ? "#fff" : "rgba(255,255,255,0.65)"} />
              {label}
            </motion.button>
          );
        })}
      </nav>
    </header>
  );
}

function JobCard({ job, darkMode, onApply }) {
  const [applying, setApplying] = useState(false);
  const isClosed = !job.is_accepting_applications;
  const hasApplied = job.has_applied;
  const isInelig = !job.is_eligible;
  const handleApply = async () => {
    if (isClosed || hasApplied || isInelig || applying) return;
    setApplying(true);
    try { await onApply(job.id); } finally { setApplying(false); }
  };
  const renderAction = () => {
    if (isClosed) return <div style={{ flex: 1, padding: "9px", borderRadius: 10, background: darkMode ? "rgba(156,163,175,0.15)" : "#f3f4f6", color: D.textMuted(darkMode), fontSize: 13, fontWeight: 600, textAlign: "center" }}>Closed</div>;
    if (hasApplied) return <div style={{ flex: 1, padding: "9px", borderRadius: 10, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", fontSize: 13, fontWeight: 700, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon d={Icons.check} size={13} color={darkMode ? "#6ee7b7" : "#065f46"} strokeWidth={2.5} /> Applied</div>;
    if (isInelig) return <div style={{ flex: 1, padding: "9px", borderRadius: 10, background: darkMode ? "rgba(239,68,68,0.1)" : "#fee2e2", color: darkMode ? "#fca5a5" : "#7f1d1d", fontSize: 12, fontWeight: 500, textAlign: "center" }}>{typeof job.ineligible_reason === "string" ? job.ineligible_reason : "Not eligible"}</div>;
    return (
      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleApply} disabled={applying}
        style={{ flex: 1, background: "linear-gradient(135deg,#4f46e5,#10b981)", color: "#fff", border: "none", borderRadius: 10, padding: "9px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        {applying ? (<><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff" }} /> Applying...</>) : (<><Icon d={Icons.send} size={13} color="#fff" /> Apply Now</>)}
      </motion.button>
    );
  };
  return (
    <motion.div whileHover={{ y: -3, boxShadow: darkMode ? "0 8px 28px rgba(0,0,0,0.4)" : "0 8px 28px rgba(16,185,129,0.12)" }}
      style={{ background: D.cardBg(darkMode), borderRadius: 18, overflow: "hidden", border: `1px solid ${D.border(darkMode)}` }}>
      <div style={{ height: 5, background: isClosed ? "#9ca3af" : "linear-gradient(90deg,#4f46e5,#10b981)" }} />
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: D.textPri(darkMode) }}>{String(job.title || "")}</div>
            {job.company_name && <div style={{ fontSize: 12, color: "#10b981", fontWeight: 600, marginTop: 2 }}>{String(job.company_name)}</div>}
          </div>
          {isClosed ? <span style={{ background: darkMode ? "rgba(156,163,175,0.15)" : "#f3f4f6", color: D.textMuted(darkMode), padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Closed</span>
            : <span style={{ background: darkMode ? "rgba(16,185,129,0.2)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 9px", borderRadius: 20, fontSize: 10, fontWeight: 700 }}>Active</span>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
          {job.location && <span style={{ background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Icon d={Icons.mapPin} size={10} color={darkMode ? "#6ee7b7" : "#065f46"} /> {String(job.location)}</span>}
          {job.ctc_lpa && <span style={{ background: darkMode ? "rgba(99,102,241,0.12)" : "#eef2ff", color: darkMode ? "#c7d2fe" : "#4338ca", padding: "3px 10px", borderRadius: 20, fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><Icon d={Icons.dollar} size={10} color={darkMode ? "#c7d2fe" : "#4338ca"} /> ₹{String(job.ctc_lpa)} LPA</span>}
          {job.application_deadline && <span style={{ background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2", color: darkMode ? "#fca5a5" : "#7f1d1d", padding: "3px 10px", borderRadius: 20, fontSize: 11 }}>Due: {new Date(job.application_deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>}
        </div>
        {job.description && <p style={{ fontSize: 12, color: D.textSec(darkMode), marginBottom: 12, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{String(job.description)}</p>}
        {job.eligibility && (
          <div style={{ marginBottom: 12, padding: "8px 12px", background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff", borderRadius: 8, border: `1px solid ${D.border(darkMode)}` }}>
            <div style={{ fontSize: 11, color: D.textSec(darkMode), display: "flex", flexWrap: "wrap", gap: 8 }}>
              {job.eligibility.min_cgpa && <span>Min CGPA: {String(job.eligibility.min_cgpa)}</span>}
              {job.eligibility.allowed_depts?.length > 0 && <span>Depts: {job.eligibility.allowed_depts.join(", ")}</span>}
              {job.eligibility.allowed_batches?.length > 0 && <span>Batch: {job.eligibility.allowed_batches.join(", ")}</span>}
              {job.eligibility.max_backlogs != null && <span>Max Backlogs: {String(job.eligibility.max_backlogs)}</span>}
            </div>
          </div>
        )}
        {renderAction()}
      </div>
    </motion.div>
  );
}

function ApplicationRow({ app, darkMode }) {
  const cfg = APP_STATUS[app.status] || { label: String(app.status || "Unknown"), bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };
  return (
    <motion.div whileHover={{ x: 3 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, marginBottom: 8, background: darkMode ? "rgba(16,185,129,0.05)" : "#f9faff", border: `1px solid ${D.border(darkMode)}`, flexWrap: "wrap", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#10b981" }}>
          {String(app.opportunity_company || app.opportunity_title || "?")[0]}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: D.textPri(darkMode) }}>{String(app.opportunity_title || "")}</div>
          <div style={{ fontSize: 12, color: D.textSec(darkMode) }}>
            {app.opportunity_company && <span>{String(app.opportunity_company)} · </span>}
            {app.opportunity_ctc_lpa && <span>₹{String(app.opportunity_ctc_lpa)} LPA · </span>}
            <span>{new Date(app.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </div>
      <span style={{ background: cfg.bg, color: cfg.color, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
        {cfg.label}
      </span>
    </motion.div>
  );
}

function InterviewCard({ company, round, date, darkMode }) {
  const [countdown, setCountdown] = useState("");
  useEffect(() => {
    const tick = () => {
      const diff = new Date(date) - new Date();
      if (diff <= 0) return setCountdown("Today!");
      const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000);
      setCountdown(`${d}d ${h}h ${m}m`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [date]);
  return (
    <motion.div whileHover={{ y: -4 }} style={{ background: darkMode ? "linear-gradient(135deg,rgba(6,95,70,0.4),rgba(16,185,129,0.15))" : "linear-gradient(135deg,#f0fdf4,#d1fae5)", borderRadius: 16, padding: "18px 20px", border: `1px solid ${D.border(darkMode)}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: D.textPri(darkMode) }}>{String(company)}</div>
          <div style={{ fontSize: 12, color: D.textSec(darkMode), marginTop: 2 }}>{String(round)}</div>
        </div>
        <span style={{ background: darkMode ? "rgba(16,185,129,0.2)" : "#a7f3d0", color: darkMode ? "#6ee7b7" : "#065f46", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>Scheduled</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon d={Icons.calendar} size={13} color={D.textSec(darkMode)} />
        <span style={{ fontSize: 13, color: D.textSec(darkMode) }}>{new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
        <Icon d={Icons.clock} size={13} color={D.textSec(darkMode)} />
        <span style={{ fontSize: 13, color: D.textSec(darkMode) }}>{new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div style={{ background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon d={Icons.clock} size={14} color={darkMode ? "#6ee7b7" : "#065f46"} />
        <span style={{ fontWeight: 700, color: darkMode ? "#6ee7b7" : "#065f46", fontSize: 13 }}>{countdown}</span>
      </div>
    </motion.div>
  );
}

function LogoutModal({ onConfirm, onCancel, darkMode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.85, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85 }} onClick={e => e.stopPropagation()}
        style={{ background: D.cardBg(darkMode), borderRadius: 22, padding: "32px 36px", width: "100%", maxWidth: 380, textAlign: "center", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 24px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Icon d={Icons.logout} size={26} color="#ef4444" strokeWidth={2} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: D.textPri(darkMode), marginBottom: 8 }}>Logout?</div>
        <div style={{ fontSize: 14, color: D.textSec(darkMode), marginBottom: 24 }}>Are you sure you want to logout?</div>
        <div style={{ display: "flex", gap: 12 }}>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onCancel} style={{ flex: 1, padding: "11px", borderRadius: 12, border: `1px solid ${D.border(darkMode)}`, background: "transparent", color: D.textPri(darkMode), fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</motion.button>
          <motion.button whileTap={{ scale: 0.96 }} onClick={onConfirm} style={{ flex: 1, padding: "11px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <Icon d={Icons.logout} size={14} color="#fff" /> Yes, Logout
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeSection, setActiveSection] = useState("section-dashboard");
  const [toast, setToast] = useState(null);
  const [skills, setSkills] = useState(["Java", "SQL", "Python"]);
  // ✅ Photo stored as base64 in localStorage — persists across logout/login
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem("student_profile_photo") || null);
  const photInputRef = useRef(null);

  // ✅ Profile data — can be updated live via edit modal
  const [profileData, setProfileData] = useState({
    first_name: localStorage.getItem("first_name") || "",
    last_name: localStorage.getItem("last_name") || "",
    cgpa: localStorage.getItem("cgpa") || "",
    graduation_year: localStorage.getItem("graduation_year") || "",
    department_id: localStorage.getItem("department_id") || "",
    roll_no: localStorage.getItem("roll_no") || "",
    active_backlogs: localStorage.getItem("active_backlogs") || "0",
    total_backlogs: localStorage.getItem("total_backlogs") || "0",
    tenth_percentage: localStorage.getItem("tenth_percentage") || "",
    twelfth_percentage: localStorage.getItem("twelfth_percentage") || "",
    linkedin_url: localStorage.getItem("linkedin_url") || "",
    github_url: localStorage.getItem("github_url") || "",
    portfolio_url: localStorage.getItem("portfolio_url") || "",
    resume_url: localStorage.getItem("resume_url") || "",
  });

  const student = {
    name: profileData.first_name
      ? `${profileData.first_name} ${profileData.last_name}`.trim()
      : localStorage.getItem("name") || "Student",
    email: localStorage.getItem("email") || "student@indusuni.ac.in",
    branch: profileData.department_id
      ? `${profileData.department_id} | ${profileData.graduation_year} Batch`
      : "B.Tech CSE | 2025 Batch",
  };

  const showToast = (msg, type = "success") => setToast({ message: String(msg), type, id: Date.now() });

  // ✅ Preserve photo across logout — save it before clearing, restore after
  const handleLogout = () => {
    const savedPhoto = localStorage.getItem("student_profile_photo");
    localStorage.clear();
    if (savedPhoto) localStorage.setItem("student_profile_photo", savedPhoto);
    navigate("/login");
  };

  // ✅ Convert uploaded image to base64 and store persistently
  const handleProfilePicChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const b64 = ev.target.result;
      setProfilePic(b64);
      localStorage.setItem("student_profile_photo", b64);
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  const handleProfileSave = (updatedData) => {
    setProfileData(updatedData);
    Object.entries(updatedData).forEach(([key, val]) => localStorage.setItem(key, String(val)));
    showToast("Profile updated successfully!", "success");
  };

  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to the Placement Portal!", read: false, icon: "bell" },
  ]);
  const markAllRead = () => setNotifications(p => p.map(n => ({ ...n, read: true })));
  const addNotif = (text, icon = "bell") => setNotifications(p => [{ id: Date.now(), text: String(text), read: false, icon }, ...p]);

  useEffect(() => {
    const observers = NAV_ITEMS.map(({ id }) => {
      const el = document.getElementById(id); if (!el) return null;
      const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setActiveSection(id); }, { threshold: 0.15 });
      obs.observe(el); return obs;
    });
    return () => observers.forEach(o => o?.disconnect());
  }, []);

  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState("");
  const fetchJobs = useCallback(async () => {
    setJobsLoading(true); setJobsError("");
    try {
      const res = await API.get("/opportunities/eligible");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const cached = lsGet(LS_JOBS, []);
      if (cached.length) { setJobs(cached); setJobsError(""); }
      else { const d = err.response?.data?.detail; setJobsError(parseApiError(d, "Failed to load job listings")); }
    } finally { setJobsLoading(false); }
  }, []);
  useEffect(() => { fetchJobs(); }, [fetchJobs]);
  useEffect(() => {
    const id = setInterval(() => { const cached = lsGet(LS_JOBS, null); if (cached) setJobs(cached); }, 10000);
    return () => clearInterval(id);
  }, []);

  const handleApply = async (opportunityId) => {
    try {
      await API.post(`/opportunities/${opportunityId}/apply`);
      setJobs(prev => prev.map(j => j.id === opportunityId ? { ...j, has_applied: true } : j));
      const job = jobs.find(j => j.id === opportunityId);
      showToast(`Applied to ${job?.title || "opportunity"} successfully!`, "success");
      addNotif(`You applied to ${job?.title || "an opportunity"}!`, "send");
      fetchMyApplications();
    } catch (err) {
      const d = err.response?.data?.detail;
      showToast(parseApiError(d, "Failed to apply"), "error");
    }
  };

  const [myApplications, setMyApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState("");
  const fetchMyApplications = useCallback(async () => {
    setAppsLoading(true); setAppsError("");
    try {
      const res = await API.get("/student/applications");
      setMyApplications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const d = err.response?.data?.detail;
      setAppsError(parseApiError(d, "Failed to load applications"));
    } finally { setAppsLoading(false); }
  }, []);
  useEffect(() => { fetchMyApplications(); }, [fetchMyApplications]);

  const [placedStudents, setPlacedStudents] = useState(() => lsGet(LS_PLACED, []));
  useEffect(() => {
    const id = setInterval(() => { const data = lsGet(LS_PLACED, null); if (data) setPlacedStudents(data); }, 5000);
    return () => clearInterval(id);
  }, []);

  const profileCompletion = Math.min(20 + skills.length * 15 + (profileData.resume_url ? 20 : 0), 100);
  const addSkill = () => { const s = prompt("Enter skill name:"); if (s?.trim()) setSkills(p => [...p, s.trim()]); };

  const statsApplied = myApplications.length;
  const statsActive = myApplications.filter(a => !["offered", "accepted", "rejected"].includes(a.status)).length;
  const statsOffers = myApplications.filter(a => a.status === "offered" || a.status === "accepted").length;
  const statsShortlisted = myApplications.filter(a => a.status === "shortlisted").length;
  const statsInterviewed = myApplications.filter(a => a.status === "interviewed" || a.status === "test_scheduled").length;
  const statsRejected = myApplications.filter(a => a.status === "rejected").length;

  const interviews = [
    { id: 1, company: "TCS", round: "Technical Round", date: "2026-04-15T10:00:00" },
    { id: 2, company: "Wipro", round: "HR Round", date: "2026-04-18T14:00:00" },
  ];
  const alumniList = [
    { id: 1, name: "Aditya Kumar", role: "Senior SDE", company: "Google", batch: "2022", branch: "B.Tech CSE", photo: "https://i.pravatar.cc/100?img=11", quote: "Indus gave me the foundation. The placement cell was incredibly supportive." },
    { id: 2, name: "Simran Kaur", role: "Product Manager", company: "Flipkart", batch: "2021", branch: "MBA", photo: "https://i.pravatar.cc/100?img=12", quote: "The mock interviews and resume workshops were game changers for me." },
    { id: 3, name: "Dev Mehta", role: "Data Scientist", company: "Amazon", batch: "2023", branch: "B.Tech CSE", photo: "https://i.pravatar.cc/100?img=13", quote: "Focus on projects and skills. The placement portal made tracking easy." },
    { id: 4, name: "Pooja Verma", role: "UX Designer", company: "Microsoft", batch: "2022", branch: "B.Des", photo: "https://i.pravatar.cc/100?img=14", quote: "Indus's alumni network helped me land my dream role at Microsoft." },
  ];

  const APIError = ({ message, onRetry }) => (
    <div style={{ padding: "14px 18px", background: darkMode ? "rgba(239,68,68,0.12)" : "#fee2e2", borderRadius: 12, color: darkMode ? "#fca5a5" : "#7f1d1d", fontSize: 13, marginBottom: 12, border: "1px solid rgba(239,68,68,0.3)", display: "flex", alignItems: "center", gap: 10 }}>
      <Icon d={Icons.warning} size={16} color={darkMode ? "#fca5a5" : "#ef4444"} />
      <span style={{ flex: 1 }}>{String(message)}</span>
      {onRetry && <button onClick={onRetry} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Retry</button>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: D.pageBg(darkMode), fontFamily: "'Outfit','Segoe UI',sans-serif", color: D.textPri(darkMode), transition: "background 0.35s, color 0.35s" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>
      <AnimatePresence>
        {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <TopBar darkMode={darkMode} setDarkMode={setDarkMode} notifications={notifications} markAllRead={markAllRead} activeSection={activeSection} onLogout={() => setShowLogout(true)} onEditProfile={() => setShowEditProfile(true)} />

      <AnimatePresence>
        {showLogout && <LogoutModal darkMode={darkMode} onConfirm={handleLogout} onCancel={() => setShowLogout(false)} />}
      </AnimatePresence>

      {/* ✅ Edit Profile Modal */}
      <AnimatePresence>
        {showEditProfile && (
          <EditProfileModal darkMode={darkMode} initialData={profileData} onClose={() => setShowEditProfile(false)} onSave={handleProfileSave} />
        )}
      </AnimatePresence>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* ── DASHBOARD ── */}
        <div id="section-dashboard">
          <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: darkMode ? "linear-gradient(135deg,rgba(79,70,229,0.6),rgba(6,95,70,0.5))" : "linear-gradient(135deg,#4f46e5,#10b981)", borderRadius: 22, padding: "26px 32px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: -50, top: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", right: 60, bottom: -70, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Welcome back 👋</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{String(student.name)}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={Icons.user} size={13} color="rgba(255,255,255,0.6)" />
                {student.branch} <span style={{ opacity: 0.4 }}>·</span> {student.email}
              </div>
              {profileData.cgpa && (
                <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>CGPA: {profileData.cgpa}</span>
                  {profileData.roll_no && <span style={{ background: "rgba(255,255,255,0.18)", color: "#fff", padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>Roll: {profileData.roll_no}</span>}
                </div>
              )}
            </div>
            {/* ✅ Persistent photo upload — stored as base64 in localStorage */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <input ref={photInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleProfilePicChange} />
              <motion.div whileHover={{ scale: 1.06 }} onClick={() => photInputRef.current?.click()}
                style={{ width: 72, height: 72, borderRadius: "50%", cursor: "pointer", overflow: "hidden", border: profilePic ? "3px solid rgba(255,255,255,0.6)" : "3px dashed rgba(255,255,255,0.5)", background: profilePic ? "transparent" : "rgba(255,255,255,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3 }}>
                {profilePic
                  ? <img src={profilePic} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : (<>
                      <Icon d={Icons.camera} size={20} color="rgba(255,255,255,0.85)" />
                      <span style={{ fontSize: 8, color: "rgba(255,255,255,0.75)", fontWeight: 700, textAlign: "center", lineHeight: 1.2 }}>UPLOAD PHOTO</span>
                    </>)
                }
              </motion.div>
              {profilePic && (
                <motion.div whileHover={{ scale: 1.1 }} onClick={() => photInputRef.current?.click()}
                  style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#10b981)", border: "2px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Icon d={Icons.camera} size={11} color="#fff" strokeWidth={2} />
                </motion.div>
              )}
            </div>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, marginBottom: 8 }}>
            <StatCard title="Applied" value={statsApplied} iconPath={Icons.send} color="indigo" darkMode={darkMode} delay={0} />
            <StatCard title="Active" value={statsActive} iconPath={Icons.lightning} color="sky" darkMode={darkMode} delay={0.08} />
            <StatCard title="Shortlisted" value={statsShortlisted} iconPath={Icons.briefcase} color="violet" darkMode={darkMode} delay={0.16} />
            <StatCard title="Interviewed" value={statsInterviewed} iconPath={Icons.mic} color="amber" darkMode={darkMode} delay={0.24} />
            <StatCard title="Offers" value={statsOffers} iconPath={Icons.trophy} color="emerald" darkMode={darkMode} delay={0.32} />
            <StatCard title="Rejected" value={statsRejected} iconPath={Icons.close} color="rose" darkMode={darkMode} delay={0.4} />
          </div>

          <div style={{ marginTop: 20 }}>
            <SectionTitle text="Profile Snapshot" darkMode={darkMode} />
            <Card darkMode={darkMode}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "start" }}>
                {/* Left — avatar + name */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, minWidth: 120 }}>
                  <div onClick={() => photInputRef.current?.click()}
                    style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: profilePic ? "3px solid #10b981" : "3px dashed #10b981", background: profilePic ? "transparent" : "rgba(16,185,129,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                    {profilePic
                      ? <img src={profilePic} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <div style={{ fontWeight: 800, fontSize: 28, color: "#10b981" }}>{student.name[0]?.toUpperCase() || "S"}</div>}
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: D.textPri(darkMode) }}>{String(student.name)}</div>
                    <div style={{ fontSize: 11, color: D.textSec(darkMode), marginTop: 2 }}>{student.branch}</div>
                    <div style={{ fontSize: 11, color: D.textSec(darkMode), marginTop: 1 }}>{student.email}</div>
                  </div>
                </div>

                {/* Right — stats + progress + skills + resume button */}
                <div>
                  {/* Academic mini-stats */}
                  {(profileData.cgpa || profileData.tenth_percentage || profileData.twelfth_percentage) && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                      {profileData.cgpa && (
                        <div style={{ flex: 1, minWidth: 70, padding: "8px 12px", background: darkMode ? "rgba(99,102,241,0.12)" : "#eef2ff", borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#6366f1" }}>{profileData.cgpa}</div>
                          <div style={{ fontSize: 10, color: D.textSec(darkMode), fontWeight: 600, marginTop: 2 }}>CGPA</div>
                        </div>
                      )}
                      {profileData.tenth_percentage && (
                        <div style={{ flex: 1, minWidth: 70, padding: "8px 12px", background: darkMode ? "rgba(16,185,129,0.1)" : "#d1fae5", borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#10b981" }}>{profileData.tenth_percentage}%</div>
                          <div style={{ fontSize: 10, color: D.textSec(darkMode), fontWeight: 600, marginTop: 2 }}>10th</div>
                        </div>
                      )}
                      {profileData.twelfth_percentage && (
                        <div style={{ flex: 1, minWidth: 70, padding: "8px 12px", background: darkMode ? "rgba(245,158,11,0.12)" : "#fef3c7", borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{profileData.twelfth_percentage}%</div>
                          <div style={{ fontSize: 10, color: D.textSec(darkMode), fontWeight: 600, marginTop: 2 }}>12th</div>
                        </div>
                      )}
                      {profileData.roll_no && (
                        <div style={{ flex: 1, minWidth: 70, padding: "8px 12px", background: darkMode ? "rgba(99,102,241,0.08)" : "#f5f3ff", borderRadius: 12, textAlign: "center" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "#8b5cf6" }}>{profileData.roll_no}</div>
                          <div style={{ fontSize: 10, color: D.textSec(darkMode), fontWeight: 600, marginTop: 2 }}>Roll No.</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile completion bar */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: D.textSec(darkMode) }}>Profile Completion</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981" }}>{profileCompletion}%</span>
                    </div>
                    <div style={{ background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", borderRadius: 8, height: 7 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${profileCompletion}%` }} transition={{ duration: 1, delay: 0.5 }}
                        style={{ height: 7, background: "linear-gradient(90deg,#6366f1,#10b981)", borderRadius: 8 }} />
                    </div>
                  </div>

                  {/* Skills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                    {skills.map((s, i) => (
                      <span key={i} style={{ background: darkMode ? "rgba(16,185,129,0.15)" : "#d1fae5", color: darkMode ? "#6ee7b7" : "#065f46", padding: "3px 11px", borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${D.border(darkMode)}` }}>{String(s)}</span>
                    ))}
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={addSkill}
                      style={{ background: "linear-gradient(135deg,#6366f1,#10b981)", color: "#fff", border: "none", borderRadius: 20, padding: "3px 11px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                      <Icon d={Icons.plus} size={11} color="#fff" strokeWidth={2.5} /> Add Skill
                    </motion.button>
                  </div>

                  {/* Resume button */}
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ background: "linear-gradient(90deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 7 }}>
                    <Icon d={Icons.download} size={15} color="#fff" /> Download Resume
                  </motion.button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* ── JOB LISTINGS ── */}
        <div id="section-jobs" style={{ scrollMarginTop: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle text="Job Listings" darkMode={darkMode} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={fetchJobs}
              style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "6px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={Icons.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
            </motion.button>
          </div>
          {jobsLoading && <div style={{ textAlign: "center", padding: 40 }}><Spinner /><div style={{ marginTop: 12, color: D.textSec(darkMode), fontSize: 13 }}>Loading job listings...</div></div>}
          {jobsError && <APIError message={jobsError} onRetry={fetchJobs} />}
          {!jobsLoading && !jobsError && (jobs.length === 0
            ? <Card darkMode={darkMode}><div style={{ textAlign: "center", padding: "24px", color: D.textMuted(darkMode), fontSize: 13 }}>No job listings available right now.</div></Card>
            : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
                {jobs.map(job => <JobCard key={job.id} job={job} darkMode={darkMode} onApply={handleApply} />)}
              </div>
          )}
        </div>

        {/* ── MY APPLICATIONS ── */}
        <div id="section-applications" style={{ scrollMarginTop: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SectionTitle text="My Applications" darkMode={darkMode} />
            <motion.button whileTap={{ scale: 0.95 }} onClick={fetchMyApplications}
              style={{ background: "none", border: `1px solid ${D.border(darkMode)}`, borderRadius: 10, padding: "6px 12px", color: D.textSec(darkMode), cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
              <Icon d={Icons.refresh} size={13} color={D.textSec(darkMode)} /> Refresh
            </motion.button>
          </div>
          <Card darkMode={darkMode}>
            {appsLoading ? <div style={{ textAlign: "center", padding: 32 }}><Spinner /></div>
              : appsError ? <APIError message={appsError} onRetry={fetchMyApplications} />
              : myApplications.length === 0
                ? <div style={{ textAlign: "center", padding: "28px", color: D.textMuted(darkMode), fontSize: 13 }}>No applications yet. Apply to jobs in the Job Listings section!</div>
                : myApplications.map(app => <ApplicationRow key={app.id} app={app} darkMode={darkMode} />)
            }
          </Card>
        </div>

        {/* ── INTERVIEWS ── */}
        <div id="section-interviews" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="Upcoming Interviews" darkMode={darkMode} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
            {interviews.map(i => <InterviewCard key={i.id} {...i} darkMode={darkMode} />)}
          </div>
        </div>

        {/* ── PLACED STUDENTS ── */}
        <div id="section-placed" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="🏆 Placed Students — Wall of Fame" darkMode={darkMode} />
          <div style={{ marginBottom: 16, padding: "12px 18px", background: darkMode ? "rgba(16,185,129,0.08)" : "linear-gradient(135deg,#ecfdf5,#d1fae5)", borderRadius: 14, fontSize: 13, color: D.textSec(darkMode), border: `1px solid ${D.border(darkMode)}` }}>
            🎉 Celebrating our achievers — updated live by Placement Cell.
          </div>
          {placedStudents.length === 0 ? (
            <Card darkMode={darkMode}><div style={{ textAlign: "center", padding: 32 }}>No placed students yet.</div></Card>
          ) : (
            <div style={{ overflow: "hidden", position: "relative" }}>
              <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} style={{ display: "flex", gap: 20, width: "max-content" }}>
                {[...placedStudents, ...placedStudents].map((s, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.05 }}
                    onHoverStart={(e) => {
                      for (let i = 0; i < 12; i++) {
                        const conf = document.createElement("div"); conf.innerHTML = "🎉";
                        conf.style.cssText = "position:absolute;left:50%;top:50%;font-size:16px;pointer-events:none;transform:translate(-50%,-50%);transition:all 0.8s ease-out;";
                        e.currentTarget.appendChild(conf);
                        setTimeout(() => { conf.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * -200}px) scale(0.5)`; conf.style.opacity = "0"; }, 10);
                        setTimeout(() => conf.remove(), 800);
                      }
                    }}
                    style={{ minWidth: 220, background: darkMode ? "linear-gradient(160deg,#0f172a,#111827)" : "#f8fafc", borderRadius: 20, overflow: "hidden", border: `1px solid ${D.border(darkMode)}`, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", position: "relative" }}>
                    <div style={{ width: "100%", aspectRatio: "1/1", position: "relative" }}>
                      <img src={s.photo} alt="student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)" }} />
                      <div style={{ position: "absolute", top: 14, right: 14, background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", fontSize: 12, padding: "6px 16px", borderRadius: 20, fontWeight: 700 }}>🎉 Placed</div>
                    </div>
                    <div style={{ padding: 14, textAlign: "center" }}>
                      <div style={{ padding: "10px 12px", background: "#ecfdf5", borderRadius: 12, fontSize: 12, fontStyle: "italic" }}>🎉 {s.greeting}</div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* ── ALUMNI ── */}
        <div id="section-alumni" style={{ scrollMarginTop: 90 }}>
          <SectionTitle text="Alumni Network" darkMode={darkMode} />
          <div style={{ marginBottom: 14, padding: "10px 16px", background: darkMode ? "rgba(99,102,241,0.1)" : "#eef2ff", borderRadius: 12, fontSize: 13, color: D.textSec(darkMode), border: `1px solid ${D.border(darkMode)}` }}>
            Connect with Indus University alumni and learn from their placement journeys.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
            {alumniList.map(a => (
              <motion.div key={a.id} whileHover={{ y: -4 }} style={{ background: D.cardBg(darkMode), borderRadius: 16, padding: "18px", border: `1px solid ${D.border(darkMode)}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <img src={a.photo} alt={a.name} style={{ width: 52, height: 52, borderRadius: "50%", border: "2px solid #6366f1", objectFit: "cover", flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: D.textPri(darkMode) }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, marginTop: 1 }}>{a.role}</div>
                  <div style={{ fontSize: 12, color: D.textSec(darkMode), marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}><Icon d={Icons.briefcase} size={11} color={D.textSec(darkMode)} /> {a.company}</div>
                  <div style={{ fontSize: 11, color: D.textMuted(darkMode), marginTop: 3 }}>Batch of {a.batch} · {a.branch}</div>
                  <div style={{ marginTop: 8, fontSize: 12, color: D.textSec(darkMode), fontStyle: "italic", lineHeight: 1.4, background: darkMode ? "rgba(99,102,241,0.08)" : "#eef2ff", padding: "6px 10px", borderRadius: 8, border: `1px solid ${D.border(darkMode)}` }}>"{a.quote}"</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 48, padding: "20px 0", borderTop: `1px solid ${D.border(darkMode)}`, fontSize: 12, color: D.textMuted(darkMode) }}>
          © {new Date().getFullYear()} Indus University Placement Portal · All rights reserved
        </div>
      </main>
    </div>
  );
}