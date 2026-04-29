export default function OutputPanel({ output, onClear }) {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-[#252526] border-b border-[#333] shrink-0">
        <span className="text-xs text-gray-400 uppercase tracking-wider">Output</span>
        <button onClick={onClear} className="text-xs text-gray-500 hover:text-gray-300">Clear</button>
      </div>
      <pre className="flex-1 overflow-auto p-3 text-xs font-mono text-green-400 leading-relaxed whitespace-pre-wrap">
        {output
          ? output
          : <span className="text-gray-600">Run your code to see output here...</span>
        }
      </pre>
    </div>
  );
}