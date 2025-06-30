import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("請先選擇檔案");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("uploader", "root"); // 你可以改成動態的使用者名稱或ID

    try {
      const response = await fetch("http://localhost:5003/upload_file", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        alert("檔案上傳成功！");
        setSelectedFile(null); // 清空選擇
      } else {
        alert("上傳失敗：" + result.message);
      }
    } catch (error) {
      alert("上傳錯誤：" + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-6 shadow-lg rounded-2xl text-center w-[400px]">
        <h1 className="text-2xl font-bold mb-4">📤 上傳檔案</h1>
        <input
          type="file"
          className="mb-4 border p-2 rounded w-full"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {selectedFile && (
          <p className="text-gray-600">已選擇檔案：{selectedFile.name}</p>
        )}
        <div className="mt-6 flex space-x-4 justify-center">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            onClick={() => navigate("/home")}
            disabled={uploading}
          >
            🔙 返回首頁
          </button>
          <button
            className={`bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? "上傳中..." : "🚀 上傳檔案"}
          </button>
        </div>
      </div>
    </div>
  );
}

