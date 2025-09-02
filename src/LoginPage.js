import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("https://brainmaxs.zeabur.app/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        // ✅ 正確存 token 和姓名
        localStorage.setItem("token", data.token.trim());
        localStorage.setItem("fullName", data.full_name || "");
        localStorage.setItem("username", username); 
        navigate("/home", {
          state: {
            fullName: data.full_name,
          },
        });
      } else {
        setError(data.message || "登入失敗！");
      }
    } catch (err) {
      setError("伺服器錯誤，請稍後再試！");
    }
  };

  return (
    
    <div
      className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/1.png')" }}
    >
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 bg-opacity-90 backdrop-blur-md">
        <img src="/2.png" alt="Logo" />
        <input
          type="text"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="輸入帳號"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="輸入密碼"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
        <button
          className="w-full bg-[#8342f6] text-white p-3 rounded-lg hover:bg-[#6a29dd] transition duration-200"
          onClick={handleLogin}
        >
          登入
        </button>
      </div>
    </div>
  );
}
