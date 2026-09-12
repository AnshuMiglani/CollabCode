import { useState, useRef, useEffect } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";

export default function ChatPanel({
  messages = [],
  onSendMessage,
  currentUser,
  typingUsers = [],
}) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f18] text-slate-200">
      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
            <p>No messages yet in this room.</p>
            <p className="text-[11px] opacity-60">Say hello to your collaborators!</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex items-center justify-center my-1.5">
                  <div className="text-[10px] text-slate-400 bg-white/5 border border-white/5 rounded-full px-3 py-0.5 flex items-center gap-1.5">
                    <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                    <span>{msg.text}</span>
                    <span className="text-slate-600 ml-1">{msg.time}</span>
                  </div>
                </div>
              );
            }

            const isMe = msg.user === currentUser;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: msg.color || "#38bdf8" }}
                  >
                    {isMe ? "You" : msg.user}
                  </span>
                  <span className="text-[9px] text-slate-500">{msg.time}</span>
                </div>
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs max-w-[85%] break-words ${
                    isMe
                      ? "bg-sky-500/20 text-sky-100 border border-sky-500/30 rounded-tr-none"
                      : "bg-[#161a29] text-slate-200 border border-white/10 rounded-tl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing presence */}
      {typingUsers.length > 0 && (
        <div className="px-4 py-1 text-[11px] text-sky-400 italic flex items-center gap-1 bg-[#101320] border-t border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#111422] border-t border-white/8 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to room..."
          className="flex-1 bg-[#090b14] border border-white/10 focus:border-sky-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:hover:bg-sky-500 text-slate-950 font-bold transition-all"
          title="Send"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
