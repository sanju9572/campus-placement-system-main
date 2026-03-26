import { Routes, Route } from "react-router-dom";
import Welcome from "./components/Welcome";
import RegistrationForm from "./components/RegistrationForm";
import Login from "./components/Login";
import StudentProfileForm from "./components/StudentProfileForm";
import StudentDashboard from "./components/DashboardUI";
import AdminDashboard from "./components/AdminDashboard";






function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<Login />} />
      <Route path="/student-profile" element={<StudentProfileForm />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />


    </Routes>
  );
}

export default App;
