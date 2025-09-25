import React, { useState, useEffect } from "react";

export default function UploadAndAnalyze() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [copyActive, setCopyActive] = useState(false);

  const fetchFiles = async () => {
    try {
      const uploader = localStorage.getItem("username");
      if (!uploader) {
        setMessage("❌ 尚未登入，無法取得檔案列表");
        return;
      }
      const res = await fetch(`https://brainmaxs.zeabur.app/list_uploaded_files?uploader=${encodeURIComponent(uploader)}`);
      const data = await res.json();
      if (data.success) {
        setFiles(data.data);
      } else {
        setMessage(`❌ 無法取得檔案列表: ${data.message || ''}`);
      }
    } catch (err) {
      setMessage(`❌ 網路錯誤: ${err.message}`);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setText('');
      setAiResult('');
      setMessage('');
      return;
    }
    const file = files.find(f => f.id === Number(selectedId));
    setText(file?.scanned_text || '');
    setAiResult(file?.ai_generated_text || '');
    setMessage('');
  }, [selectedId, files]);

  const handleFileChange = e => setSelectedFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!selectedFile) return setMessage("⚠️ 請先選擇檔案");
    setUploading(true);
    setMessage('');
    const uploader = localStorage.getItem("username") || "anonymous";
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("uploader", uploader);
    try {
      const res = await fetch("https://brainmaxs.zeabur.app/upload_file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✅ 上傳成功！上傳者：${uploader}`);
        setSelectedFile(null);
        fetchFiles();
      } else {
        setMessage("❌ 上傳失敗: " + data.message);
      }
    } catch (e) {
      setMessage("❌ 上傳錯誤：" + e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleScan = async () => {
    if (!selectedId) return setMessage("⚠️ 請先選擇檔案");
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`https://brainmaxs.zeabur.app/scan_pdf_ocr/${selectedId}`);
      const data = await res.json();
      if (data.success) {
        setText(data.content);
        setMessage("✅ 掃描成功");
      } else {
        setMessage('❌ 掃描失敗: ' + data.message);
      }
    } catch (e) {
      setMessage('❌ 網路錯誤: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedId || !text.trim()) return setMessage("⚠️ 請選擇檔案並填寫內容");
    setSaving(true);
    setMessage('');
    setAiResult('');
    try {
      const saveRes = await fetch('https://brainmaxs.zeabur.app/save_scanned_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: Number(selectedId), scanned_text: text }),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.message);
      setMessage('✅ 儲存成功，開始 AI 分析...');
      const aiRes = await fetch('https://brainmaxs.zeabur.app/google_generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text }),
      });
      const aiData = await aiRes.json();
      if (aiData.success) {
        const resultText = aiData.result || '';
        setAiResult(resultText);
        setMessage('✅ AI 分析完成');
        if (resultText) {
          await fetch('https://brainmaxs.zeabur.app/save_ai_result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_id: Number(selectedId), ai_generated_text: resultText }),
          });
        }
        fetchFiles();
      } else {
        setMessage('❌ AI 分析失敗: ' + aiData.message);
      }
    } catch (e) {
      setMessage('❌ 錯誤: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult).then(() => {
      setCopySuccess('✅ 已複製到剪貼簿！');
      setCopyActive(true);
      setTimeout(() => {
        setCopyActive(false);
        setCopySuccess('');
      }, 1500);
    });
  };

  const Spinner = () => (
    <span className="ml-2 inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
  );

  return (
    <div
      className="min-h-screen w-full px-2 sm:px-6 bg-cover bg-center bg-no-repeat flex justify-center py-6 overflow-y-auto"
      style={{ backgroundImage: "url('/1.png')" }}
    >
      <div className="p-6 max-w-2xl w-full bg-white/80 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">📄 PDF 上傳與 AI 分析</h2>

        {/* 上傳 */}
        <div className="mb-4 flex items-center gap-2">
          <input
            type="file"
            onChange={handleFileChange}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
          >
            {uploading ? <>上傳中... <Spinner /></> : "🚀 上傳檔案"}
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-6">💾 僅支援 PDF 檔案，大小上限 10 MB</p>

        {/* 選擇檔案 */}
        <div className="mb-4 flex items-center gap-2">
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="">請選擇 PDF 檔案</option>
            {files.map(f => (
              <option key={f.id} value={f.id}>{f.file_name}</option>
            ))}
          </select>
          <button
            onClick={handleScan}
            disabled={!selectedId || loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
          >
            {loading ? <>掃描中... <Spinner /></> : "開始掃描"}
          </button>
        </div>
        <p className="text-gray-400 text-sm mb-4">📌 上傳後請從下拉選單中選取檔案進行掃描</p>

        {/* 掃描結果 */}
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="掃描檔案過程約需幾分鐘，請耐心等候 😊掃描完成後，您可在此檢閱、修改辨識出的摘要後再點選 AI 分析"
          className="w-full border rounded p-3 mb-4 h-64 max-h-80 resize-y"
        />

        {/* 儲存 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
          <button
            onClick={handleSave}
            disabled={saving || !selectedId || !text.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 w-full sm:w-auto flex items-center justify-center"
          >
            {saving ? <>儲存中... <Spinner /></> : "儲存並開始 AI 分析"}
          </button>
          <button
            onClick={() => (window.location.href = "/home")}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 w-full sm:w-auto"
          >
            返回首頁
          </button>
        </div>

        {/* AI 分析結果 */}
        {aiResult ? (
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold">AI 分析結果</h4>
              <button
                onClick={handleCopy}
                className={`px-3 py-1 rounded text-white ${copyActive ? "bg-green-600" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {copyActive ? "已複製！" : "複製結果"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-sm">{aiResult}</pre>
          </div>
        ) : selectedId ? (
          <p className="text-gray-500 italic mb-4">尚無 AI 分析結果</p>
        ) : null}

        {/* 提示訊息 */}
        {message && (
          <p className={`font-medium ${message.includes("失敗") || message.includes("錯誤") ? "text-red-600" : "text-green-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
