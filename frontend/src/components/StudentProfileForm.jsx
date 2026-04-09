import { motion } from "framer-motion";
import { FaUserGraduate, FaChalkboardTeacher, FaFileUpload, FaLink } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function StudentProfileForm() {
  const [currentSection, setCurrentSection] = useState(0);
  const [progress, setProgress] = useState(25);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // ✅ Single formData state — persists across all section navigations
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    roll_no: "",
    department_id: "",
    graduation_year: "",
    cgpa: "",
    active_backlogs: "",
    total_backlogs: "",
    tenth_percentage: "",
    twelfth_percentage: "",
    linkedin_url: "",
    github_url: "",
    portfolio_url: ""
  });

  const sections = [
    { title: "Basic Info", icon: FaUserGraduate },
    { title: "Academic", icon: FaChalkboardTeacher },
    { title: "Backlogs", icon: FaFileUpload },
    { title: "Resume & Links", icon: FaLink }
  ];

  // ✅ handleChange uses functional update so no stale closure issues
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("Only PDF files are allowed!");
      e.target.value = "";
      return;
    }
    if (file && file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB!");
      e.target.value = "";
      return;
    }
    setResumeFile(file);
  };

  const uploadResume = async () => {
    const token = localStorage.getItem("token");
    const data = new FormData();
    data.append("file", resumeFile);
    const response = await axios.post("/upload/resume", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.resume_url;
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) return alert("Please enter First Name!") || false;
    if (!formData.last_name.trim()) return alert("Please enter Last Name!") || false;
    if (!formData.roll_no.trim()) return alert("Please enter Roll Number!") || false;
    if (!formData.department_id.trim()) return alert("Please enter Department ID!") || false;

    const gradYear = Number(formData.graduation_year);
    if (!gradYear) return alert("Please enter Graduation Year!") || false;
    if (gradYear < 2000 || gradYear > 2030) return alert("Graduation Year must be between 2000 and 2030!") || false;

    const cgpa = Number(formData.cgpa);
    if (!formData.cgpa) return alert("Please enter CGPA!") || false;
    if (cgpa < 1 || cgpa > 10) return alert("CGPA must be between 1 and 10!") || false;

    const tenth = Number(formData.tenth_percentage);
    if (!formData.tenth_percentage) return alert("Please enter 10th Percentage!") || false;
    if (tenth < 0 || tenth > 100) return alert("10th Percentage must be between 0 and 100!") || false;

    const twelfth = Number(formData.twelfth_percentage);
    if (!formData.twelfth_percentage) return alert("Please enter 12th Percentage!") || false;
    if (twelfth < 0 || twelfth > 100) return alert("12th Percentage must be between 0 and 100!") || false;

    const active = Number(formData.active_backlogs);
    const total = Number(formData.total_backlogs);
    if (formData.active_backlogs === "") return alert("Please enter Active Backlogs!") || false;
    if (formData.total_backlogs === "") return alert("Please enter Total Backlogs!") || false;
    if (active < 0) return alert("Active Backlogs cannot be negative!") || false;
    if (total < 0) return alert("Total Backlogs cannot be negative!") || false;
    if (active > total) return alert("Active Backlogs cannot be more than Total Backlogs!") || false;

    const urlPattern = /^https?:\/\/.+\..+/;
    if (!formData.linkedin_url) return alert("Please enter LinkedIn URL!") || false;
    if (!urlPattern.test(formData.linkedin_url)) return alert("Please enter a valid LinkedIn URL!") || false;
    if (!formData.github_url) return alert("Please enter GitHub URL!") || false;
    if (!urlPattern.test(formData.github_url)) return alert("Please enter a valid GitHub URL!") || false;
    if (!formData.portfolio_url) return alert("Please enter Portfolio URL!") || false;
    if (!urlPattern.test(formData.portfolio_url)) return alert("Please enter a valid Portfolio URL!") || false;

    if (!resumeFile) return alert("Please upload your resume PDF!") || false;

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      const resumeUrl = await uploadResume();
      const payload = {
        ...formData,
        graduation_year: Number(formData.graduation_year),
        cgpa: Number(formData.cgpa),
        active_backlogs: Number(formData.active_backlogs),
        total_backlogs: Number(formData.total_backlogs),
        tenth_percentage: Number(formData.tenth_percentage),
        twelfth_percentage: Number(formData.twelfth_percentage),
        resume_url: resumeUrl,
        placement_status: "unplaced",
        is_profile_complete: true
      };
      await axios.post("/student/profile", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Profile Completed Successfully 🎉");
      navigate("/student-dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        alert(detail.map(e => e.msg).join("\n"));
      } else {
        alert(detail || "Error submitting profile ❌");
      }
      console.error(err.response?.data || err.message);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Navigation preserves section index cleanly; progress derived from section
  const goToSection = (index) => {
    setCurrentSection(index);
    setProgress((index + 1) * 25);
  };

  const nextSection = () => {
    if (currentSection < 3) goToSection(currentSection + 1);
  };

  const prevSection = () => {
    if (currentSection > 0) goToSection(currentSection - 1);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden bg-gradient-to-br from-sky-50 via-indigo-100 to-emerald-100">

      <motion.div animate={{ y: [0, -40, 0] }} transition={{ repeat: Infinity, duration: 10 }}
        className="absolute w-[28rem] h-[28rem] bg-indigo-300/30 rounded-full top-10 left-10 blur-3xl"/>
      <motion.div animate={{ y: [0, 50, 0] }} transition={{ repeat: Infinity, duration: 12 }}
        className="absolute w-[32rem] h-[32rem] bg-emerald-300/30 rounded-full bottom-10 right-10 blur-3xl"/>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-3xl w-full rounded-[2rem] bg-white/60 backdrop-blur-2xl border border-white/40 shadow-[0_30px_80px_rgba(0,0,0,0.15)] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-emerald-500 p-8 text-white">
          <div className="flex items-center gap-4">
            <FaUserGraduate className="text-4xl" />
            <div>
              <h1 className="text-2xl font-bold">Complete Student Profile</h1>
              <p className="text-indigo-100 text-sm">Step {currentSection + 1} of 4</p>
            </div>
          </div>
          <div className="mt-6 w-full bg-white/40 rounded-full h-3">
            <motion.div animate={{ width: `${progress}%` }} className="bg-white h-3 rounded-full"/>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="p-3 bg-white/40 backdrop-blur-md">
          <div className="flex gap-2">
            {sections.map((section, index) => (
              <button key={index} onClick={() => goToSection(index)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  index === currentSection
                    ? "bg-gradient-to-r from-indigo-500 to-emerald-500 text-white"
                    : "bg-white text-slate-600 border border-gray-200"
                }`}>
                <section.icon className="mx-auto mb-1" />
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form Sections */}
        <div className="p-8 space-y-4">

          {currentSection === 0 && (
            <>
              <Input label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange}/>
              <Input label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange}/>
              <Input label="Roll Number *" name="roll_no" value={formData.roll_no} onChange={handleChange}/>
              <Input label="Department ID *" name="department_id" value={formData.department_id} onChange={handleChange}/>
              <Input
                label="Graduation Year * (2000-2030)"
                name="graduation_year"
                value={formData.graduation_year}
                type="number"
                min="2000"
                max="2030"
                onChange={handleChange}
              />
            </>
          )}

          {currentSection === 1 && (
            <>
              <Input
                label="CGPA * (1-10)"
                name="cgpa"
                value={formData.cgpa}
                type="number"
                min="1"
                max="10"
                step="0.01"
                onChange={handleChange}
              />
              <Input
                label="10th Percentage * (0-100)"
                name="tenth_percentage"
                value={formData.tenth_percentage}
                type="number"
                min="0"
                max="100"
                step="0.01"
                onChange={handleChange}
              />
              <Input
                label="12th Percentage * (0-100)"
                name="twelfth_percentage"
                value={formData.twelfth_percentage}
                type="number"
                min="0"
                max="100"
                step="0.01"
                onChange={handleChange}
              />
            </>
          )}

          {currentSection === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Active Backlogs *"
                name="active_backlogs"
                value={formData.active_backlogs}
                type="number"
                min="0"
                onChange={handleChange}
              />
              <Input
                label="Total Backlogs *"
                name="total_backlogs"
                value={formData.total_backlogs}
                type="number"
                min="0"
                onChange={handleChange}
              />
            </div>
          )}

          {currentSection === 3 && (
            <>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Upload Resume * (PDF only, max 5MB)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                {resumeFile && (
                  <p className="text-green-600 text-xs mt-1">✅ {resumeFile.name} selected</p>
                )}
              </div>
              <Input label="LinkedIn URL *" name="linkedin_url" value={formData.linkedin_url} type="url" onChange={handleChange}/>
              <Input label="GitHub URL *" name="github_url" value={formData.github_url} type="url" onChange={handleChange}/>
              <Input label="Portfolio URL *" name="portfolio_url" value={formData.portfolio_url} type="url" onChange={handleChange}/>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={prevSection}
              disabled={currentSection === 0}
              className="flex-1 py-3 border border-gray-300 rounded-xl disabled:opacity-50">
              Previous
            </button>
            <button
              onClick={currentSection === 3 ? handleSubmit : nextSection}
              disabled={uploading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-emerald-500 text-white py-3 rounded-xl font-semibold disabled:opacity-50">
              {uploading ? "Uploading... Please wait ⏳" : currentSection === 3 ? "Submit Profile" : "Next"}
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

// ✅ Input now accepts `value` prop so it's a controlled component — data persists
function Input({ label, name, type = "text", onChange, min, max, step, value }) {
  return (
    <div>
      <label className="block text-sm text-gray-600 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
      />
    </div>
  );
}