import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const fetchData = (searchQuery = "") => {
    setLoading(true);
    fetch(`https://brainmaxs.zeabur.app/get_test_results?search=${searchQuery}`)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setData(result.data);
        } else {
          setError(result.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("❌ 無法獲取資料，請稍後再試！");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gradient-to-r from-blue-200 to-blue-300 p-6">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-2xl">
        <h1 className="text-3xl font-semibold mb-4 text-center text-blue-600">📄 資料庫數據</h1>
        
        <div className="mb-4 flex justify-between items-center">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="搜尋資料..."
            className="border p-3 w-full rounded-md shadow-sm focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => fetchData(search)}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            搜尋
          </button>
        </div>
        
        {loading && <div className="flex justify-center items-center text-blue-500">📡 資料加載中...</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}

        {!loading && !error && (
          <>
            <table className="w-full border-collapse border border-gray-300 mb-4">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">ID</th>
                  <th className="border p-3 text-left">使用者名稱</th>
                  <th className="border p-3 text-left">問題</th>
                  <th className="border p-3 text-left">回應</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="border p-3">{item.id}</td>
                    <td className="border p-3">{item.full_name}</td>
                    <td className="border p-3">{item.question}</td>
                    <td className="border p-3">{item.answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={exportToExcel}
              className="mt-4 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500"
            >
              📥 匯出為 Excel
            </button>
          </>
        )}

        <button
          className="mt-6 fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700"
          onClick={() => navigate("/home")}
        >
          🔙 返回首頁
        </button>
      </div>
    </div>
  );
}
