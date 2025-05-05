import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = (searchQuery = "") => {
    setLoading(true);
    fetch(`https://brainmaxs.zeabur.app/get_test_results?search=${searchQuery}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          const filtered = result.data.filter(
            (item) => item.full_name && item.question && item.answer
          );
          setData(filtered);
          setCurrentPage(1);
        } else {
          setError(result.message);
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

  useEffect(() => {
    let sortedData = [...data];
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayData(sortedData.slice(start, end));
  }, [data, sortConfig, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchData(e.target.value);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "test_results.xlsx");
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className="min-h-screen overflow-y-auto bg-gray-100 p-6 flex flex-col items-center justify-start">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-4xl">
        <h1 className="text-2xl font-bold mb-4 text-center text-blue-600">📄 資料庫數據</h1>

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

        {loading && <p className="text-blue-500 text-center">📡 資料加載中...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 mb-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th
                      className="border p-3 text-left cursor-pointer"
                      onClick={() => handleSort("id")}
                    >
                      ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th
                      className="border p-3 text-left cursor-pointer"
                      onClick={() => handleSort("full_name")}
                    >
                      使用者名稱 {sortConfig.key === "full_name" ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                    <th className="border p-3 text-left">問題</th>
                    <th className="border p-3 text-left">回應</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-100">
                      <td className="border p-3">{item.id}</td>
                      <td className="border p-3">{item.full_name}</td>
                      <td className="border p-3">{item.question}</td>
                      <td className="border p-3">{item.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分頁 */}
            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                ← 上一頁
              </button>
              <span>
                第 {currentPage} 頁 / 共 {totalPages} 頁
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                下一頁 →
              </button>
            </div>

            {/* 匯出 */}
            <button
              onClick={exportToExcel}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              📥 匯出為 Excel
            </button>
          </>
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
