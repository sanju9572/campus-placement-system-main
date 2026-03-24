import {
  motion,
  useMotionValue,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";
import { FaUserGraduate, FaUserTie } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import API from "../api/axios";
import indusLogo from "../assets/indus-logo.png";

export default function RegistrationForm() {
  const [role, setRole] = useState("student");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  const handleChange = (e) => {
    setErrorMsg(""); // clear error on any change
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── CLIENT-SIDE VALIDATION ─────────────────────────────────────────────────
  const validate = () => {
    if (!formData.first_name.trim()) return "First name is required.";
    if (!formData.last_name.trim())  return "Last name is required.";
    if (!formData.email.trim())      return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address.";
    if (!formData.password)          return "Password is required.";
    if (formData.password.length < 6) return "Password must be at least 6 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate before hitting API
    const validationError = validate();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post("/auth/register", {
        ...formData,
        role,
      });

      // Store auth info in localStorage
      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("name", formData.first_name + " " + formData.last_name);
      localStorage.setItem("role", role);
      localStorage.setItem("email", formData.email);

      setShowSuccess(true);

      // ── ROLE-BASED REDIRECT ──────────────────────────────────────────────
      // student  → /student-profile  (profile setup first)
      // coordinator → /admin-dashboard
      setTimeout(() => {
        if (role === "student") navigate("/student-profile");
        else navigate("/admin-dashboard");
      }, 2000);

    } catch (err) {
      const detail = err.response?.data?.detail;

      if (Array.isArray(detail)) {
        // FastAPI validation errors come as array
        setErrorMsg(detail.map((e) => e.msg).join(" · "));
      } else if (typeof detail === "string") {
        // e.g. "Email already registered"
        setErrorMsg(detail);
      } else {
        setErrorMsg("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-100 to-emerald-100">

      {/* ── SUCCESS TOAST ── */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0 }}
            className="fixed top-10 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold text-lg"
          >
            Registration Successful 🎉✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background blobs — UNCHANGED */}
      <motion.div
        animate={{ y: [0, -40, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute w-[30rem] h-[30rem] bg-indigo-300/30 rounded-full top-10 left-10 blur-3xl"
      />

      <motion.div
        animate={{ y: [0, 50, 0] }}
        transition={{ repeat: Infinity, duration: 12 }}
        className="absolute w-[34rem] h-[34rem] bg-emerald-300/30 rounded-full bottom-10 right-10 blur-3xl"
      />

      <motion.div
        onMouseMove={handleMouseMove}
        className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_30px_80px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Mouse glow — UNCHANGED */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useMotionTemplate`
              radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99,102,241,0.25), transparent 60%)
            `,
          }}
        />

        {/* ── LEFT PANEL ── logo + title properly aligned */}
        <div className="p-14 flex flex-col justify-center bg-gradient-to-br from-indigo-500 to-emerald-500 text-white">
          {/* Logo + university name stacked cleanly */}
          <div className="flex flex-col items-start gap-3 mb-6">
            <img
              src={indusLogo}
              alt="Indus University"
              className="w-54 filter brightness-0 invert"
            />
            <div>
              <h1 className="text-4xl font-bold leading-snug">
                Indus Placement System
              </h1>
              <p className="mt-2 text-indigo-100 text-sm max-w-sm">
                Register and start your placement journey with Indus University.
              </p>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL — UNCHANGED design ── */}
        <div className="p-14 bg-white rounded-r-[2rem]">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Create Account
          </h2>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <RoleButton
              icon={<FaUserGraduate />}
              label="Student"
              active={role === "student"}
              onClick={() => setRole("student")}
            />
            <RoleButton
              icon={<FaUserTie />}
              label="Coordinator"
              active={role === "coordinator"}
              onClick={() => setRole("coordinator")}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="First Name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            {/* ── INLINE ERROR (no design change, just a small red message) ── */}
            <AnimatePresence>
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                >
                  {errorMsg}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting}
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                `Register as ${role === "student" ? "Student" : "Coordinator"}`
              )}
            </motion.button>
          </form>

          <p className="text-sm text-gray-500 mt-6 text-center">
            Already registered?{" "}
            <Link
              to="/login"
              className="text-indigo-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── UNCHANGED COMPONENTS ──────────────────────────────────────────────────────
function RoleButton({ icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition ${
        active
          ? "bg-indigo-500 text-white border-indigo-500"
          : "bg-white text-slate-600 border-gray-200 hover:border-indigo-400"
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function Input({ label, type, ...props }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <motion.input
        whileFocus={{ scale: 1.02 }}
        type={type}
        {...props}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
      />
    </div>
  );
}