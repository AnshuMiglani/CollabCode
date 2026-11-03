import { useState } from "react";
import { Play, Copy, Check, Trash2, Clock, AlertCircle, CheckCircle2, Terminal as TerminalIcon, CornerDownLeft } from "lucide-react";
import { copyToClipboard } from "../utils/clipboard";
import { useAlert } from "../context/AlertContext";

export default function OutputPanel({
  output = "",
  error = "",
  isRunning = false,
  executionTime = null,
  exitCode = null,
  stdin = "",
  onStdinChange,
  onClear,
}) {
  const { toast } = useAlert();
  const [copied, setCopied] = useState(false);
  const [showStdin, setShowStdin] = useState(true); // default visible for immediate access

  const handleCopy = async () => {
    const textToCopy = output || error || "";
    if (!textToCopy) {
      toast.warning("Output is empty. Run your code first!", { title: "No Output" });
      return;
    }
    const ok = await copyToClipboard(textToCopy);
    if (ok) {
      setCopied(true);
      toast.success("Execution output copied to clipboard!", { title: "Copied" });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090b14] text-slate-200">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#101320] border-b border-white/8 shrink-0 text-xs select-none">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-slate-300">
            <TerminalIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>Program Output</span>
          </div>

          {isRunning && (
            <span className="flex items-center gap-1.5 text-amber-400 text-[11px] bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Compiling & Running...
            </span>
          )}

          {!isRunning && exitCode !== null && (
            <span
              className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border font-mono ${
                exitCode === 0
                  ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  : "text-rose-400 bg-rose-400/10 border-rose-400/20"
              }`}
            >
              {exitCode === 0 ? (
                <CheckCircle2 className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              Exit: {exitCode}
            </span>
          )}

          {executionTime !== null && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <Clock className="w-3 h-3" />
              {executionTime}ms
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Stdin Panel */}
          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
              showStdin
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
            }`}
            title="Toggle Program Input (stdin)"
          >
            <CornerDownLeft className="w-3 h-3 text-sky-400" />
            <span>Stdin {stdin ? "✓" : ""}</span>
          </button>

          <button
            onClick={handleCopy}
            disabled={!output && !error}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors"
            title="Copy Output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClear}
            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
            title="Clear Console"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area: Split Output and Input if Stdin Open */}
      <div className="flex-1 flex overflow-hidden">
        {/* Output Stream Panel */}
        <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed select-text">
          {isRunning ? (
            <div className="flex items-center gap-2 text-slate-400 py-3">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>Sending to Judge0 CE compiler & executing...</span>
            </div>
          ) : output || error ? (
            <div className="space-y-2">
              {output && (
                <pre className="text-emerald-400 whitespace-pre-wrap break-words">{output}</pre>
              )}
              {error && (
                <pre className="text-rose-400 whitespace-pre-wrap break-words bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 font-mono">
                  {error}
                </pre>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <Play className="w-6 h-6 mb-1 opacity-25" />
              <span>Press <strong className="text-slate-300">Run</strong> or <kbd className="bg-white/10 px-1 py-0.5 rounded text-white font-mono">Ctrl + Enter</kbd> to compile & execute.</span>
            </div>
          )}
        </div>

        {/* Dedicated Stdin Side Panel */}
        {showStdin && (
          <div className="w-64 bg-[#0d0f18] border-l border-white/8 flex flex-col shrink-0">
            <div className="px-3 py-1.5 bg-[#121522] border-b border-white/8 flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              <span className="flex items-center gap-1 text-sky-400">
                <CornerDownLeft className="w-3 h-3" />
                Stdin Input
              </span>
              <span className="text-[9px] font-normal text-slate-500 lowercase">
                {stdin ? `${stdin.length} chars` : "empty"}
              </span>
            </div>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Enter inputs here (e.g. for cin >> or input())..."
              className="flex-1 w-full bg-transparent p-2.5 text-xs font-mono text-sky-200 placeholder-slate-600 outline-none resize-none"
              spellCheck={false}
            />
            <div className="p-1.5 bg-[#101320] border-t border-white/5 text-[9px] text-slate-500 text-center">
              Sent to program on Run
            </div>
          </div>
        )}
      </div>
    </div>
  );
}