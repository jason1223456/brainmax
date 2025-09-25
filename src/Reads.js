import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  const username =
    localStorage.getItem("username") ||
    localStorage.getItem("fullName") ||
    "";

  const isAdmin = username.toLowerCase() === "admin";

  const fetchData = (searchQuery = "") => {
    setLoading(true);
    setError(null);

    if (!username) {
      setError("❌ 尚未登入，請先登入！");
      setLoading(false);
      return;
    }

    const encodedSearch = encodeURIComponent(searchQuery.trim());
    const encodedUsername = encodeURIComponent(username.trim());

    let url = `https://brainmaxs.zeabur.app/get_test_results?username=${encodedUsername}`;
    if (searchQuery) url += `&q=${encodedSearch}`;

    fetch(url)
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          const filtered = result.data.filter(
            (item) => item.full_name && item.question && item.answer
          );
          setData(filtered);
          setCurrentIndex(0);
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

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchData(val);
  };

  const exportToExcel = () => {
    if (data.length === 0) {
      alert("目前沒有資料可匯出");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isAdmin ? "AllData" : "UserData");
    XLSX.writeFile(
      wb,
      isAdmin ? "all_test_results.xlsx" : "test_results.xlsx"
    );
  };

  const currentItem = data[currentIndex];
  const total = data.length;

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start py-10"
      style={{ backgroundImage: "url('/1.png')" }}
    >
      <div className="px-6 py-5 max-w-5xl w-full bg-white/80 rounded-lg shadow-lg overflow-auto">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">
          📄 {isAdmin ? "全部使用者資料總覽" : "單筆資料檢視"}
        </h1>

        {/* 搜尋列 */}
        <div className="mb-4 flex flex-col sm:flex-row items-stretch gap-2">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="搜尋資料..."
            className="border p-3 flex-1 rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => fetchData(search)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            🔍 搜尋
          </button>
        </div>

        {/* 載入 / 錯誤 */}
        {loading && <p className="text-blue-500 text-center">📡 載入中...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* admin → 表格模式 */}
        {!loading && !error && isAdmin && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300 bg-white/90 shadow-md rounded-lg">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2 text-left">ID</th>
                  <th className="border px-4 py-2 text-left">使用者名稱</th>
                  <th className="border px-4 py-2 text-left">問題</th>
                  <th className="border px-4 py-2 text-left">回應</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="border px-4 py-2">{item.id}</td>
                    <td className="border px-4 py-2">{item.full_name}</td>
                    <td className="border px-4 py-2">{item.question}</td>
                    <td className="border px-4 py-2">{item.answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 一般使用者 → 單筆模式 */}
        {!loading && !error && !isAdmin && currentItem && (
          <>
            <div className="border rounded-xl p-4 bg-gray-50/80 space-y-3 shadow-inner">
              <div><strong>ID：</strong>{currentItem.id}</div>
              <div><strong>使用者名稱：</strong>{currentItem.full_name}</div>
              <div><strong>問題：</strong>{currentItem.question}</div>
              <div><strong>回應：</strong>{currentItem.answer}</div>
            </div>

            <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ← 上一筆
              </button>
              <span>第 {currentIndex + 1} 筆 / 共 {total} 筆</span>
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))}
                disabled={currentIndex === total - 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                下一筆 →
              </button>
            </div>
          </>
        )}

        {/* 無資料 */}
        {!loading && !error && data.length === 0 && (
          <p className="text-gray-600 text-center mt-8">😕 查無資料</p>
        )}

        {/* 匯出 Excel */}
        {!loading && !error && data.length > 0 && (
          <button
            onClick={exportToExcel}
            className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            📥 匯出資料為 Excel
          </button>
        )}

        {/* 返回首頁 */}
        <button
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          onClick={() => navigate("/home")}
        >
          🔙 返回首頁
        </button>
      </div>
    </div>
  );
}
