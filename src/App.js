import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import HomePage from "./HomePage";
import NewPage from "./NewPage"; // 新增引入 NewPage
import Reads from "./Reads"; 
import AiReport from "./AiReport"; 
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/newpage" element={<NewPage />} />
        <Route path="/Reads" element={<Reads/>} /> 
        <Route path="/AiReport" element={<AiReport/>} /> 
      </Routes>
    </Router>
  );
}



