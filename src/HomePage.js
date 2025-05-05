import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fullName } = location.state || {};

  const [messages, setMessages] = useState([
    { text: "你好！有什麼可以幫助你的嗎？", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState("");
  const [lastBotResponse, setLastBotResponse] = useState("");
  const [selectedModels, setSelectedModels] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const chatEndRef = useRef(null);

  const AVAILABLE_MODELS = {
    "1": "openai/gpt-4o",
    "2": "anthropic/claude-3.7-sonnet:beta",
    "3": "perplexity/sonar-deep-research",
    "4": "google/gemini-flash-1.5",
    "5": "deepseek/deepseek-r1:free"
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { text: input, sender: "user" }]);
    setLastUserMessage(input);
    const userMessage = input;
    setInput("");

    if (selectedModels.length === 0) {
      alert("⚠️ 請選擇至少一個模型！");
      return;
    }

    try {
      const response = await fetch("https://brainmaxs.zeabur.app/generate_copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userMessage,
          models: selectedModels
        }),
      });

      const data = await response.json();
      if (data.success) {
        const results = data.generated_results;
        const newBotMessages = Object.entries(results).map(([model, text]) => ({
          text: `[${model}] ${text}`,
          sender: "bot"
        }));
        setMessages((prev) => [...prev, ...newBotMessages]);
        setLastBotResponse(
          Object.entries(results).map(([model, text]) => `[${model}] ${text}`).join("\n\n")
        );
      } else {
        setMessages((prev) => [
          ...prev,
          { text: "⚠️ 機器人無法回應，請稍後再試。", sender: "bot" },
        ]);
      }
    } catch (error) {
      console.error("請求錯誤：", error);
      setMessages((prev) => [
        ...prev,
        { text: "❌ 伺服器發生錯誤，請稍後再試。", sender: "bot" },
      ]);
    }
  };

  const openSaveModal = () => {
    if (!lastUserMessage || !lastBotResponse) {
      alert("⚠️ 尚未發送對話，無法保存！");
      return;
    }
    setShowSaveModal(true);
  };

  const closeSaveModal = () => setShowSaveModal(false);

  const confirmSave = async () => {
    try {
      const response = await fetch("https://brainmaxs.zeabur.app/save_generated_copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          question: lastUserMessage,
          answer: lastBotResponse,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("✅ 訊息已成功保存！");
      } else {
        alert("❌ 保存失敗：" + data.message);
      }
    } catch (error) {
      console.error("保存錯誤：", error);
      alert("❌ 保存時發生錯誤，請稍後再試！");
    } finally {
      closeSaveModal();
    }
  };

  const handleModelChange = (event) => {
    const modelId = event.target.value;
    if (event.target.checked) {
      setSelectedModels((prev) => [...prev, modelId]);
    } else {
      setSelectedModels((prev) => prev.filter((id) => id !== modelId));
    }
  };

  return (
    <div className="relative h-screen bg-gray-100 flex">
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-5 z-50 transform transition-transform duration-300 flex flex-col ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold mb-6">選單</h2>
        <ul>
          <li className="mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded">🏠 首頁</li>
          <li className="mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded">⚙ 設定</li>
          <li className="mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded" onClick={() => navigate("/newpage")}>📄 上傳檔案</li>
          <li className="mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded" onClick={() => navigate("/Reads")}>📄 歷史紀錄</li>
        </ul>
        <button className="mt-auto bg-red-600 p-3 rounded-lg hover:bg-red-700">🚪 登出</button>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-md">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl font-bold">☰</button>
          <h1 className="text-lg font-bold">💬 聊天室</h1>
          {fullName && <p className="text-sm">👤 {fullName}</p>}
        </header>

        <div className="flex-1 flex justify-center items-center overflow-hidden">
          <div className="flex flex-col w-full max-w-2xl h-[80vh] bg-white shadow-lg rounded-2xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
              {messages.map((msg, index) => (
                <div key={index} className={`flex mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="relative group">
                    <div
                      className={`p-3 rounded-2xl max-w-xs shadow-md ${
                        msg.sender === "user"
                          ? "bg-blue-500 text-white rounded-br-none"
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.sender === "bot" && (
                      <button
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-sm text-gray-500 hover:text-black"
                        onClick={() => navigator.clipboard.writeText(msg.text)}
                      >📋</button>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-white shadow-md">
              <h3 className="text-lg font-bold">選擇模型</h3>
              <div className="flex flex-wrap gap-4">
                {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={key}
                      onChange={handleModelChange}
                      className="h-5 w-5"
                    />
                    {model}
                  </label>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white flex items-center shadow-md">
              <div className="flex flex-col flex-1">
                <input
                  type="text"
                  className="p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="輸入訊息..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  maxLength={500}
                />
                <span className="text-sm text-right text-gray-500 mt-1">{input.length}/500</span>
              </div>
              <button className="ml-3 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700" onClick={sendMessage}>送出</button>
              <button className="ml-3 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700" onClick={openSaveModal}>保存</button>
            </div>
          </div>
        </div>
      </div>

      {showSaveModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-[500px]">
      <h3 className="text-lg font-semibold mb-4">確認儲存對話</h3>
      
      <div className="flex flex-col space-y-4 max-h-96 overflow-y-auto">
        <div className="p-3 border rounded-md bg-gray-100">
          <h4 className="font-bold mb-1">📌 問題：</h4>
          <p className="break-words whitespace-pre-wrap">{lastUserMessage}</p>
        </div>
        <div className="p-3 border rounded-md bg-gray-100">
          <h4 className="font-bold mb-1">🤖 回應：</h4>
          <p className="break-words whitespace-pre-wrap">{lastBotResponse}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          className="mr-4 text-gray-600 hover:text-black"
          onClick={closeSaveModal}
        >
          取消
        </button>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
          onClick={confirmSave}
        >
          確定儲存
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
