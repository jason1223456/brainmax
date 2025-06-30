import React, { useState, useEffect } from 'react';

function PdfScanEditor() {
  const [files, setFiles] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

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

  useEffect(() => {
    if (!selectedId) {
      setText('');
      setAiResult('');
      setMessage('');
      return;
    }
    const file = files.find(f => f.id === Number(selectedId));
    if (file && file.scanned_text) {
      setText(file.scanned_text);
      setAiResult('');
      setMessage('');
    } else {
      setText('');
      setAiResult('');
      setMessage('');
    }
  }, [selectedId, files]);

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

      const aiRes = await fetch('https://brainmaxs.zeabur.app/generate_copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          models: ['1'],
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

  const handleCopy = () => {
    if (!aiResult) return;
    navigator.clipboard.writeText(aiResult)
      .then(() => {
        setCopySuccess('已複製到剪貼簿！');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => {
        setCopySuccess('複製失敗，請手動複製');
        setTimeout(() => setCopySuccess(''), 2000);
      });
  };

  const handleReset = () => {
    setSelectedId('');
    setText('');
    setAiResult('');
    setMessage('');
    setCopySuccess('');
  };

  const styles = {
    container: {
      maxWidth: '960px',
      margin: '30px auto',
      padding: '24px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 600,
      marginBottom: '20px',
      color: '#333',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    select: {
      minWidth: '280px',
      padding: '6px 10px',
      fontSize: '1rem',
      border: '1px solid #ccc',
      borderRadius: '6px',
    },
    button: {
      padding: '6px 16px',
      fontSize: '0.95rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease-in-out',
    },
    buttonDisabled: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    buttonGreen: {
      backgroundColor: '#28a745',
    },
    textarea: {
      width: '100%',
      height: '300px',
      padding: '12px',
      fontSize: '1rem',
      lineHeight: 1.5,
      border: '1px solid #ccc',
      borderRadius: '6px',
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    message: {
      marginTop: '12px',
      fontWeight: 500,
    },
    success: {
      color: 'green',
    },
    error: {
      color: 'red',
    },
    resultBox: {
      marginTop: '24px',
      padding: '16px',
      backgroundColor: '#f6f8fa',
      border: '1px solid #dcdcdc',
      borderRadius: '6px',
    },
    resultHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px',
    },
    resultTitle: {
      margin: 0,
    },
    resultButtons: {
      display: 'flex',
      gap: '8px',
    },
    resultText: {
      whiteSpace: 'pre-wrap',
      fontFamily: "'Courier New', monospace",
      fontSize: '0.95rem',
    },
    copyButton: {
      padding: '6px 12px',
      fontSize: '0.9rem',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#007bff',
      color: 'white',
      cursor: 'pointer',
    },
    homeButton: {
      padding: '6px 12px',
      fontSize: '0.9rem',
      borderRadius: '6px',
      border: 'none',
      backgroundColor: '#6c757d',
      color: 'white',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>PDF 掃描編輯器 + AI 分析</h3>

      <div style={styles.row}>
        <label htmlFor="fileSelect">選擇 PDF 檔案：</label>
        <select
          id="fileSelect"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
          style={styles.select}
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
          style={{
            ...styles.button,
            ...(loading || !selectedId ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? '掃描中...' : '開始掃描'}
        </button>
      </div>

      <textarea
        style={styles.textarea}
        value={text}
        onChange={e => setText(e.target.value)}
        disabled={loading}
        placeholder="掃描結果會出現在這裡，可自行編輯..."
      />

      <button
        onClick={handleSave}
        disabled={saving || !selectedId}
        style={{
          ...styles.button,
          ...styles.buttonGreen,
          ...(saving || !selectedId ? styles.buttonDisabled : {}),
          marginTop: '16px',
        }}
      >
        {saving ? '儲存中並分析中...' : '儲存並進行 AI 分析'}
      </button>

      {message && (
        <p
          style={{
            ...styles.message,
            ...(message.startsWith('儲存成功') || message.startsWith('AI 分析完成')
              ? styles.success
              : styles.error),
          }}
        >
          {message}
        </p>
      )}

      {aiResult && (
        <div style={styles.resultBox}>
          <div style={styles.resultHeader}>
            <h4 style={styles.resultTitle}>AI 分析結果：</h4>
            <div style={styles.resultButtons}>
              <button onClick={handleCopy} style={styles.copyButton}>複製結果</button>
              <button onClick={handleReset} style={styles.homeButton}>回首頁</button>
            </div>
          </div>
          <pre style={styles.resultText}>{aiResult}</pre>
          {copySuccess && (
            <p style={{ marginTop: '8px', color: 'green', fontWeight: 'bold' }}>
              {copySuccess}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default PdfScanEditor;
