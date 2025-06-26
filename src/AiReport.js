import React, { useState, useEffect } from 'react';

function PdfScanEditor() {
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [aiResult, setAiResult] = useState('');

  // 載入檔案列表，並載入已掃描文字（若有）
  useEffect(() => {
    fetch('https://brainmaxs.zeabur.app/list_uploaded_files')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFiles(data.data);
        } else {
          setMessage('無法取得檔案列表: ' + (data.message || ''));
        }
      })
      .catch(err => setMessage('網路錯誤: ' + err.message));
  }, []);

  // 選擇檔案時，取得該檔案的已掃描文字（如果有）
  useEffect(() => {
    if (!selectedId) {
      setText('');
      setAiResult('');
      setMessage('');
      return;
    }
    // 從 files 陣列中找到對應檔案 (這裡需要修改API回傳scanned_text欄位或另查API)
    // 假設你的 /list_uploaded_files 也回傳 scanned_text
    const file = files.find(f => f.id === Number(selectedId));
    if (file && file.scanned_text) {
      setText(file.scanned_text);
      setAiResult(''); // 清空 AI 分析結果，讓使用者選擇是否再分析
      setMessage('');
    } else {
      setText('');
      setAiResult('');
      setMessage('');
    }
  }, [selectedId, files]);

  // 掃描 PDF
  const handleScan = async () => {
    if (!selectedId) {
      alert('請先選擇一個 PDF');
      return;
    }
    setLoading(true);
    setMessage('');
    setAiResult('');
    setText('');
    try {
      const id = Number(selectedId);
      const res = await fetch(`https://brainmaxs.zeabur.app/scan_pdf_ocr/${id}`);
      const data = await res.json();
      if (data.success) {
        setText(data.content);
      } else {
        setMessage('掃描失敗: ' + data.message);
      }
    } catch (e) {
      setMessage('網路錯誤: ' + e.message);
    }
    setLoading(false);
  };

  // 儲存編輯後文字，並呼叫 AI 分析
  const handleSave = async () => {
    if (!selectedId) {
      alert('請先選擇一個 PDF');
      return;
    }
    setSaving(true);
    setMessage('');
    setAiResult('');
    try {
      const id = Number(selectedId);
      // 儲存掃描文字
      const saveRes = await fetch('https://brainmaxs.zeabur.app/save_scanned_text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_id: id, scanned_text: text }),
      });
      const saveData = await saveRes.json();
      if (!saveData.success) {
        setMessage('儲存失敗: ' + saveData.message);
        setSaving(false);
        return;
      }
      setMessage('儲存成功，開始 AI 分析...');

      // 呼叫 AI 分析 (用儲存後的文字當 prompt)
      const aiRes = await fetch('https://brainmaxs.zeabur.app/generate_copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          models: ['1'] // 選擇一個模型，比如 'openai/gpt-4o'
        }),
      });
      const aiData = await aiRes.json();
      if (aiData.success) {
        setAiResult(aiData.generated_results['openai/gpt-4o'] || '無分析結果');
        setMessage('AI 分析完成');
      } else {
        setMessage('AI 分析失敗: ' + (aiData.message || ''));
      }
    } catch (e) {
      setMessage('網路錯誤: ' + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h3>PDF 掃描編輯器 + AI 分析</h3>

      <div style={{ marginBottom: 10 }}>
        <label htmlFor="fileSelect">選擇 PDF 檔案：</label>
        <select
          id="fileSelect"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={{ marginLeft: 10, minWidth: 250 }}
        >
          <option value="">請選擇 PDF 檔案</option>
          {files.map(f => (
            <option key={f.id} value={f.id}>
              {f.file_name}
            </option>
          ))}
        </select>

        <button
          onClick={handleScan}
          disabled={loading || !selectedId}
          style={{ marginLeft: 10, padding: '4px 12px' }}
        >
          {loading ? '掃描中...' : '開始掃描'}
        </button>
      </div>

      <div>
        <textarea
          rows={15}
          cols={80}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={loading}
          placeholder="掃描結果會出現在這裡，可自行編輯..."
          style={{ fontSize: 14, padding: 10, width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving || !selectedId}
        style={{ marginTop: 10, padding: '6px 20px' }}
      >
        {saving ? '儲存中並分析中...' : '儲存並進行 AI 分析'}
      </button>

      {message && (
        <p style={{ marginTop: 10, color: message.startsWith('儲存成功') || message.startsWith('AI 分析完成') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      {aiResult && (
        <div style={{ marginTop: 20, padding: 15, border: '1px solid #ccc', borderRadius: 5, backgroundColor: '#f9f9f9' }}>
          <h4>AI 分析結果：</h4>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{aiResult}</pre>
        </div>
      )}
    </div>
  );
}

export default PdfScanEditor;
