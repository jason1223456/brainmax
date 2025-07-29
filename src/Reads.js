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

  // 讀 localStorage 的 username 或 fullName
  const username = localStorage.getItem("username") || localStorage.getItem("fullName") || "";

  const fetchData = (searchQuery = "") => {
    setLoading(true);
    setError(null);

    // 如果沒登入，直接報錯或導回登入頁
    if (!username) {
      setError("❌ 尚未登入，請先登入！");
      setLoading(false);
      return;
    }

    const encodedSearch = encodeURIComponent(searchQuery.trim());
    const encodedUsername = encodeURIComponent(username.trim());

    // API 依照你的設計加參數 username 跟搜尋字串 q
    let url = `https://brainmaxs.zeabur.app/get_test_results?username=${encodedUsername}`;
    if (searchQuery) {
      url += `&q=${encodedSearch}`;
    }

    fetch(url)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          // 確保有必要欄位再呈現
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
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "test_results.xlsx");
  };

  const currentItem = data[currentIndex];
  const total = data.length;

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-100 p-6 flex flex-col items-center justify-start">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📄 單筆資料檢視</h1>

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

        {loading && <p className="text-blue-500 text-center">📡 載入中...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && currentItem && (
          <>
            <div className="border rounded-xl p-4 bg-gray-50 space-y-3 shadow-inner">
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
              <span>
                第 {currentIndex + 1} 筆 / 共 {total} 筆
              </span>
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, total - 1))}
                disabled={currentIndex === total - 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                下一筆 →
              </button>
            </div>

            <button
              onClick={exportToExcel}
              className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              📥 匯出所有資料為 Excel
            </button>
          </>
        )}

        {!loading && !error && data.length === 0 && (
          <p className="text-gray-600 text-center mt-8">😕 查無資料</p>
        )}

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
