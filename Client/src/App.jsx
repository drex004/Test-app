import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Exam from "./pages/Exam.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Result from "./pages/Result.jsx";
import Workspace from "./pages/Workspace.jsx";
import register from "./pages/register.jsx";
import ExamCreation from "./pages/ExamCreation.jsx";
import Navbar from "./components/Navbar.jsx";

const App = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/exam/:examId" element={<Exam />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/result" element={<Result />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/exam-creation" element={<ExamCreation />} />
      </Routes>
    </Router>
  );
};

export default App;