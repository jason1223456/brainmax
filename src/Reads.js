import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";  // 引入 xlsx 库

export default function Read() {
  const navigate = useNavigate();
  const [data, setData] = useState([]); // 存放資料庫數據
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 取得資料
  useEffect(() => {
    fetch("http://brainmax.zeabur.app/get_test_results") // 從後端讀取資料
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
  }, []);

  // 下載 Excel 檔案
  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data); // 把資料轉換成工作表
    const wb = XLSX.utils.book_new(); // 創建一個新的工作簿
    XLSX.utils.book_append_sheet(wb, ws, "Data"); // 把工作表添加到工作簿
    XLSX.writeFile(wb, "test_results.xlsx"); // 下載為 Excel 文件
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-6 shadow-lg rounded-2xl w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">📄 資料庫數據</h1>
        {loading && <p className="text-blue-500">📡 資料加載中...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div>
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border-b px-4 py-2 text-left">ID</th>
                  <th className="border-b px-4 py-2 text-left">使用者名稱</th>
                  <th className="border-b px-4 py-2 text-left">問題</th>
                  <th className="border-b px-4 py-2 text-left">回應</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-100">
                    <td className="border-b px-4 py-2">{item.id}</td>
                    <td className="border-b px-4 py-2">{item.full_name}</td>
                    <td className="border-b px-4 py-2">{item.question}</td>
                    <td className="border-b px-4 py-2">{item.answer}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 下載 Excel 按鈕 */}
            <button
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              onClick={downloadExcel}
            >
              📥 下載 Excel
            </button>
          </div>
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
