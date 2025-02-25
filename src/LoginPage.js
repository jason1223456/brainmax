import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); // 清除錯誤訊息

    try {
      const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // 當登入成功時，將 account_level 和 full_name 傳遞到主頁
        navigate("/home", {
          state: {
            accountLevel: data.account_level,
            fullName: data.full_name,
          },
        });
      } else {
        setError(data.message); // 顯示錯誤訊息
      }
    } catch (err) {
      setError("伺服器錯誤，請稍後再試！");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('https://source.unsplash.com/random/1600x900/?nature,water')" }}>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-96 bg-opacity-90 backdrop-blur-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">登入</h2>
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
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          onClick={handleLogin}
        >
          登入
        </button>
      </div>
    </div>
  );
}
