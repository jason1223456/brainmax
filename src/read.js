import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(""); // 🔍 搜尋關鍵字

  // ⏬ fetch 資料：支援模糊查詢參數
  const fetchData = (q = "") => {
    setLoading(true);
    setError(null);

    const encodedQuery = encodeURIComponent(q.trim());
    const url = q ? `https://brainmaxs.zeabur.app/get_test_results?q=${encodedQuery}` : `https://brainmaxs.zeabur.app/get_test_results`;

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const sortedData = result.data.slice().sort((a, b) => Number(b.id) - Number(a.id));
          setData(sortedData);
        } else {
          setError(result.message || "⚠️ 查詢失敗");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("❌ 無法獲取資料，請稍後再試！");
        setLoading(false);
      });
  };

  // 📦 初始載入所有資料
  useEffect(() => {
    fetchData();
  }, []);

  // 🔍 搜尋觸發事件
  const handleSearch = (e) => {
    e.preventDefault();
    fetchData(query);
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">📄 資料庫數據</h1>

        {/* 🔍 搜尋欄 */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="🔍 搜尋關鍵字..."
            className="flex-grow border border-gray-300 rounded-lg p-2"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            搜尋
          </button>
        </form>

        {loading && <p className="text-blue-500">📡 資料加載中...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <>
            {data.length > 0 ? (
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
                      <td className="border p-2 whitespace-pre-line">{item.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">🔎 沒有符合的資料</p>
            )}
          </>
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
