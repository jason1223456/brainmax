import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://brainmaxs.zeabur.app/get_test_results")
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // ✅ 確保依 id 降序排列（最新的資料在前面）
          const sortedData = result.data.slice().sort((a, b) => Number(b.id) - Number(a.id));
          setData(sortedData);
        } else {
          setError(result.message);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("❌ 無法獲取資料，請稍後再試！");
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">📄 資料庫數據</h1>

        {loading && <p className="text-blue-500">📡 資料加載中...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">使用者名稱</th>
                <th className="border p-2">問題</th>
                <th className="border p-2">回應</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="border p-2">{item.id}</td>
                  <td className="border p-2">{item.full_name}</td>
                  <td className="border p-2">{item.question}</td>
                  <td className="border p-2">{item.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => navigate("/home")}
        >
          🔙 返回首頁
        </button>
      </div>
    </div>
  );
}
