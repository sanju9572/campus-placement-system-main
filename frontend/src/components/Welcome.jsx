import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import placementImg from "../assets/placement.png";

export default function Welcome() {
  const navigate = useNavigate();

  // Mouse glow effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-indigo-100 to-emerald-100 flex items-center justify-center px-6 overflow-hidden">

      {/* Floating soft blobs */}
      <motion.div
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute w-96 h-96 bg-indigo-300/30 rounded-full top-10 left-10 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 40, 0] }}
        transition={{ repeat: Infinity, duration: 10 }}
        className="absolute w-[30rem] h-[30rem] bg-emerald-300/30 rounded-full bottom-10 right-10 blur-3xl"
      />

      {/* Card */}
      <motion.div
        onMouseMove={handleMouseMove}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 max-w-6xl w-full grid md:grid-cols-2 rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_30px_80px_rgba(0,0,0,0.15)] overflow-hidden"
      >

        {/* Mouse-follow glow */}
        <motion.div
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${mouseX}px ${mouseY}px,
                rgba(52,211,153,0.35),
                transparent 60%
              )
            `,
          }}
          className="absolute inset-0 pointer-events-none"
        />

        {/* LEFT */}
        <div className="relative p-12 flex flex-col justify-center">
          <motion.h1
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight"
          >
            Campus Placement <br />
            <span className="text-emerald-600">Management System</span>
          </motion.h1>

          <motion.p
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-slate-600 leading-relaxed"
          >
            A smart digital platform to manage campus recruitment, connect
            students with companies, and simplify the entire placement journey.
          </motion.p>

          <motion.button
            whileHover={{
              scale: 1.07,
              boxShadow: "0px 10px 30px rgba(52,211,153,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/register")}
            className="mt-8 w-fit bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold px-10 py-3 rounded-xl"
          >
            Get Started →
          </motion.button>
        </div>

        {/* RIGHT */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center p-8"
        >
          <motion.img
            src={placementImg}
            alt="Campus Placement"
            className="w-full max-w-md drop-shadow-xl"
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
