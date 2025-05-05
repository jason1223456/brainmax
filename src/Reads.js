import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";  // 引入 xlsx 库

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // 存放資料庫數據
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(""); // 用於控制搜尋框

  // 取得資料
  const fetchData = (searchQuery = "") => {
    setLoading(true); // 讓資料加載狀態為 true
    fetch(`https://brainmaxs.zeabur.app/get_test_results?search=${searchQuery}`) // 帶上搜尋參數
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          setData(result.data); // 假設後端返回 { success: true, data: [...] }
        } else {
          setError(result.message); // 顯示錯誤訊息
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("❌ 無法獲取資料，請稍後再試！");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData(); // 預設加載所有資料
  }, []);

  // 處理搜尋框輸入變化
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    fetchData(e.target.value); // 每次輸入時觸發搜尋
  };

  // 匯出資料到 Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data); // 將資料轉換成工作表格式
    const wb = XLSX.utils.book_new(); // 創建一個新的工作簿
    XLSX.utils.book_append_sheet(wb, ws, "Data"); // 將工作表添加到工作簿
    XLSX.writeFile(wb, "test_results.xlsx"); // 將工作簿寫入為 Excel 檔案
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">📄 資料庫數據</h1>
        
        {/* 搜尋框 */}
        <input
          type="text"
          value={search}
          onChange={handleSearchChange}
          placeholder="搜尋資料..."
          className="border p-2 mb-4 w-full rounded-md"
        />
        
        {loading && <p className="text-blue-500">📡 資料加載中...</p>}
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && (
          <>
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

            {/* 匯出到 Excel 按鈕 */}
            <button
              onClick={exportToExcel}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              📥 匯出為 Excel
            </button>
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
