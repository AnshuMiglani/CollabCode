import { LANGUAGES } from "../utils/languageUtils";

export default function Header({
  language, onLanguageChange, onRun, isRunning,
  roomId, username, onToggleSidebar, copied, onCopy,
}) {
  return (
    <div className="flex items-center gap-3 px-4 h-[48px] bg-[#323233] border-b border-[#111] shrink-0">
      <button
        onClick={onToggleSidebar}
        className="text-gray-400 hover:text-white text-lg transition-colors"
        title="Toggle Sidebar"
      >☰</button>

      <div className="flex items-center gap-2 text-[#61dafb] font-bold text-base">
  <img src="/cc.png" alt="cc" className="w-6 h-6" />
  <span>CollabCode</span>
</div>

      <select
  className="ml-2 text-xs px-2 py-1 rounded bg-[#3a3a3a] text-white border border-[#555] outline-none cursor-pointer"
  value={language}
  onChange={(e) => onLanguageChange(e.target.value)}
>
  {LANGUAGES.map((l) => (
    <option key={l.value} value={l.value}>
      {l.label}
    </option>
  ))}
</select>

      <button
        onClick={onRun}
        disabled={isRunning}
        className="px-4 py-1 rounded bg-green-600 hover:bg-green-500 disabled:bg-green-900 text-white text-xs font-bold transition-colors"
      >
        {isRunning ? " Running..." : " Run"}
      </button>

      <div className="flex items-center gap-2 ml-auto">
        <span className="text-gray-500 text-xs">Room:</span>
        <code className="text-[#61dafb] text-xs bg-[#2a2a2a] px-2 py-0.5 rounded border border-[#444]">
          {roomId.slice(0, 8)}...
        </code>
        <button
          onClick={onCopy}
          className="text-xs px-2 py-1 rounded bg-[#61dafb] text-black font-bold hover:bg-[#4fc8e8] transition-colors"
        >
          {copied ? "✅" : " Copy"}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 border border-[#444] px-2 py-1 rounded">
        <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
        {username}
      </div>
    </div>
  );
}