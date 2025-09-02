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
  const [selectedModel, setSelectedModel] = useState("1");
  const chatEndRef = useRef(null);

  const AVAILABLE_MODELS = {
    "1": "Deepseek-R1",
    "2": "Gemini2.0",
    "3": "Claude4.0",
    "4": "ChatGPT4o",
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    navigate("/"); // 登出跳轉
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { text: input, sender: "user" }];
    setMessages(newMessages);
    setLastUserMessage(input);
    setInput("");

    if (!selectedModel) {
      alert("⚠️ 請選擇模型！");
      return;
    }

    const conversationText = newMessages
      .map((msg) =>
        `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`
      )
      .join("\n");

    try {
      const response = await fetch("https://brainmaxs.zeabur.app/generate_copy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: conversationText,
          models: [selectedModel],
          username: fullName, // ✅ 傳 fullName 當 username
        }),
      });

      const data = await response.json();
      console.log("🧠 API 回傳：", data);

      let botText =
        data.generated_results?.[AVAILABLE_MODELS[selectedModel]] ||
        data.generated_results?.[selectedModel] ||
        Object.values(data.generated_results || {})[0] ||
        "⚠️ 無法解析回應";

      setMessages((prev) => [...prev, { text: botText, sender: "bot" }]);
      setLastBotResponse(botText);
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

  const closeSaveModal = () => {
    setShowSaveModal(false);
  };

  const confirmSave = async () => {
    try {
      const response = await fetch(
        "https://brainmaxs.zeabur.app/save_generated_copy",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            question: lastUserMessage,
            answer: lastBotResponse,
          }),
        }
      );

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

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gradient-to-b from-[#d2b3ff] to-[#dae7ff] text-gray-900 p-5 flex flex-col">
        <div className="flex items-center mb-6">
          <img src="/LOGO_Brainmax.png" alt="Logo" className="w-13 h-12 mr-2" />
          <h2 className="text-xl font-bold">Brainmax</h2>
        </div>

        <ul className="flex-1">
          <li className="font-bold text-sm mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded">🏠 首頁</li>
          <li className="font-bold text-sm mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded">⚙ 設定</li>
          <li
            className="font-bold text-sm mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded"
            onClick={() => navigate("/newpage")}
          >
            📄 Ai上傳檔案
          </li>
          <li
            className="font-bold text-sm mb-4 p-3 hover:bg-gray-700 cursor-pointer rounded"
            onClick={() => navigate("/Reads")}
          >
            📄 歷史紀錄
          </li>
        </ul>
        <button
          className="bg-[#8342f6] text-white mt-auto bg-red-600 p-3 rounded-lg hover:bg-red-700"
          onClick={handleLogout}
        >
          🚪 登出
        </button>
      </aside>

      <div className="flex flex-1 flex-col h-screen overflow-hidden">
      <header className="bg-[#e4def1] text-white p-4 flex justify-between items-center">
          {fullName && <p className="from-[#1B210E] text-sm">👤 {fullName}</p>}
        </header>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-100 w-full">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="relative group max-w-[80%]">
                <div
                  className={`p-3 rounded-2xl whitespace-pre-wrap break-words ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {msg.text || "（無內容）"}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(msg.text || "")}
                  className="absolute top-0 right-0 mt-1 mr-1 opacity-0 group-hover:opacity-100 text-xs bg-black text-white px-2 py-1 rounded"
                  title="複製"
                >
                  複製
                </button>
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
                  type="radio"
                  name="model"
                  value={key}
                  checked={selectedModel === key}
                  onChange={() => setSelectedModel(key)}
                  className="h-5 w-5"
                />
                {model}
              </label>
            ))}
          </div>
        </div>

        <div className="p-4 bg-white flex flex-col shadow-md">
          <textarea
            rows={1}
            className="w-full p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="輸入訊息（最多1000字）..."
            value={input}
            maxLength={1000}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <p className="text-sm text-gray-500 ml-3 mt-1">{input.length}/1000</p>

          <div className="mt-3 flex justify-end">
            <button
              className="bg-[#cb6ce6] bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700"
              onClick={sendMessage}
            >
              送出
            </button>
            <button
              className="bg-[#8342f6] ml-3 bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700"
              onClick={openSaveModal}
            >
              保存
            </button>
          </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <h3 className="text-lg font-semibold mb-4">確認儲存對話</h3>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 p-3 border rounded-md bg-gray-100 overflow-y-auto max-h-40">
                <h4 className="font-bold mb-2">📌 問題：</h4>
                <p className="whitespace-pre-wrap break-words">{lastUserMessage || "（無內容）"}</p>
              </div>
              <div className="flex-1 p-3 border rounded-md bg-gray-100 overflow-y-auto max-h-40">
                <h4 className="font-bold mb-2">🤖 回應：</h4>
                <p className="whitespace-pre-wrap break-words">{lastBotResponse || "（無內容）"}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button className="mr-4 text-gray-600 hover:underline" onClick={closeSaveModal}>
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
