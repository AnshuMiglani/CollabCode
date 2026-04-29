import { useEffect, useRef } from "react";

export default function Terminal({ history, onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-[#0d0d0d]">
      <div className="flex items-center px-3 py-1 bg-[#252526] border-b border-[#333] shrink-0">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Terminal</span>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-300 ml-auto">Clear</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 font-mono text-xs text-green-400">
        {history.map((line, i) => (
          <div key={i} className="leading-5">
            <span className="text-gray-600">›</span> {line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}