import { useEffect, useRef, useState } from "react";

export default function Terminal({ history, onClear, sendTerminalInput }){
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const [inputLine, setInputLine] = useState("");
  const [inputHistory, setInputHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, inputLine]);

  const getLineColor = (line) => {
    if (line.startsWith("❌") || line.toLowerCase().includes("error")) return "text-red-400";
    if (line.startsWith("$ Done"))     return "text-[#61dafb]";
    if (line.startsWith("$ Output:"))  return "text-gray-500";
    if (line.startsWith("$ Running"))  return "text-yellow-400";
    if (line.startsWith("stdin »"))    return "text-purple-400";
    if (line.startsWith("✅"))         return "text-green-400";
    return "text-green-400";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const val = inputLine.trim();
      if (!val) return;

      // Add to stdin (newline separated for multiple inputs)
      sendTerminalInput(val);

      // Show in terminal history visually
      setInputHistory((prev) => [...prev, `> ${val}`]);
      setHistoryIndex(-1);
      setInputLine("");
    }

    // Arrow up/down to cycle through input history
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, inputHistory.length - 1);
      setHistoryIndex(next);
      setInputLine(inputHistory[next] || "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInputLine(next === -1 ? "" : inputHistory[next]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0d12] font-mono">

      {/* Header */}
      <div className="flex items-center gap-3 px-3 py-1.5 bg-[#1a1a24] border-b border-[#ffffff08] shrink-0">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/60"></span>
        </div>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Terminal</span>

        

        <div className="ml-auto flex items-center gap-2">
          
          <button
            onClick={onClear}
            className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors border border-white/5 hover:border-white/10 px-2 py-0.5 rounded"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Output area */}
      <div
        className="flex-1 overflow-y-auto p-3 text-xs leading-5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {/* Render history */}
        {history.map((line, i) => (
          <div key={i} className={`${getLineColor(line)} whitespace-pre-wrap leading-5`}>
            <span className="text-white/10 select-none mr-1">›</span>
            {line}
          </div>
        ))}

        

        {/* Input prompt */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[#61dafb]/60 select-none">❯</span>
          <input
            ref={inputRef}
            type="text"
            value={inputLine}
            onChange={(e) => setInputLine(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white text-xs outline-none caret-[#61dafb] placeholder-white/15"
            placeholder="Type input and press Enter..."
            spellCheck={false}
            autoComplete="off"
          />
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Help bar */}
      <div className="flex items-center gap-4 px-3 py-1 border-t border-white/5 shrink-0">
        <span className="text-[9px] text-white/15">
          <kbd className="bg-white/5 px-1 rounded">Enter</kbd> queue input
        </span>
        <span className="text-[9px] text-white/15">
          <kbd className="bg-white/5 px-1 rounded">↑↓</kbd> history
        </span>
        <span className="text-[9px] text-white/15">inputs sent to program on  Run</span>
      </div>
    </div>
  );
}