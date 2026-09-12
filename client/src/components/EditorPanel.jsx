import { useRef, useEffect, useState, useCallback } from "react";
import MonacoEditor from "@monaco-editor/react";
import { X, Plus, Sparkles, CheckCheck } from "lucide-react";
import { getLangByExt } from "../utils/languageUtils";

export default function EditorPanel({
  files = [],
  activeFile,
  onFileSelect,
  onAddFile,
  onCloseFile,
  code,
  language,
  onChange,
  onCursorChange,
  remoteCursors = {},
  theme = "vs-dark",
  fontSize = 14,
  wordWrap = "on",
  isConnected = true,
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const [cursorPos, setCursorPos] = useState({ lineNumber: 1, column: 1 });
  const isApplyingRemote = useRef(false);

  // 1. Monaco Mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Track local cursor movements
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ lineNumber: e.position.lineNumber, column: e.position.column });

      if (onCursorChange) {
        const selection = editor.getSelection();
        onCursorChange({
          cursor: {
            lineNumber: e.position.lineNumber,
            column: e.position.column,
          },
          selection: selection
            ? {
                startLineNumber: selection.startLineNumber,
                startColumn: selection.startColumn,
                endLineNumber: selection.endLineNumber,
                endColumn: selection.endColumn,
              }
            : null,
        });
      }
    });

    // Add keyboard shortcut: Ctrl+S to prevent default browser save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Auto-format document on save shortcut
      editor.getAction("editor.action.formatDocument")?.run();
    });
  };

  // 2. Render Remote Cursors and User Badges
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    // Filter cursors for the current file
    const activeRemoteCursors = Object.entries(remoteCursors).filter(
      ([, data]) => data.fileName === activeFile && data.cursor
    );

    const newDecorations = [];

    activeRemoteCursors.forEach(([socketId, data]) => {
      const { cursor, selection, username, color = "#38bdf8" } = data;
      const cleanColor = color.replace(/[^#a-fA-F0-9]/g, "");

      // 1. Remote Caret
      newDecorations.push({
        range: new monaco.Range(
          cursor.lineNumber,
          cursor.column,
          cursor.lineNumber,
          cursor.column
        ),
        options: {
          className: `remote-caret-${socketId}`,
          beforeContentClassName: `remote-label-${socketId}`,
          hoverMessage: { value: `**${username}** is editing here` },
        },
      });

      // 2. Remote Selection Range (if any)
      if (
        selection &&
        (selection.startLineNumber !== selection.endLineNumber ||
          selection.startColumn !== selection.endColumn)
      ) {
        newDecorations.push({
          range: new monaco.Range(
            selection.startLineNumber,
            selection.startColumn,
            selection.endLineNumber,
            selection.endColumn
          ),
          options: {
            className: `remote-selection-${socketId}`,
          },
        });
      }

      // Inject dynamic CSS rule for this user if not present
      const styleId = `remote-cursor-style-${socketId}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        .remote-caret-${socketId} {
          border-left: 2px solid ${cleanColor} !important;
          margin-left: -1px;
        }
        .remote-label-${socketId}::before {
          content: "${username}";
          position: absolute;
          top: -18px;
          left: 0;
          background-color: ${cleanColor};
          color: #000;
          font-size: 10px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          line-height: 14px;
          padding: 0 4px;
          border-radius: 2px 2px 2px 0;
          pointer-events: none;
          z-index: 50;
        }
        .remote-selection-${socketId} {
          background-color: ${cleanColor}25 !important;
        }
      `;
    });

    decorationsRef.current = editor.deltaDecorations(
      decorationsRef.current,
      newDecorations
    );
  }, [remoteCursors, activeFile]);

  // 3. Handle Local Code Edit
  const handleMonacoChange = (val) => {
    if (isApplyingRemote.current) return;
    onChange(val);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0f18] overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center bg-[#090b14] border-b border-white/8 overflow-x-auto shrink-0 scrollbar-none">
        {files.map((f) => {
          const ext = f.name.split(".").pop();
          const langConfig = getLangByExt(ext);
          const isActive = activeFile === f.name;

          return (
            <div
              key={f.name}
              onClick={() => onFileSelect(f.name)}
              className={`group flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-r border-white/8 shrink-0 transition-all ${
                isActive
                  ? "bg-[#0d0f18] text-white font-medium border-t-2 border-t-sky-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: langConfig.color || "#38bdf8" }}
              />
              <span className="font-mono text-[12px]">{f.name}</span>

              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCloseFile) onCloseFile(f.name);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-opacity ml-1"
                  title="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Plus Tab */}
        <button
          onClick={() => {
            const ext = prompt("Enter new filename (e.g. utils.js, test.py):");
            if (ext && ext.trim()) onAddFile(ext.trim());
          }}
          className="p-2 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="New File Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={handleMonacoChange}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            fontSize: fontSize,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: wordWrap,
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {/* Status Bar */}
      <div className="h-6 bg-[#0a0c14] border-t border-white/8 px-3 flex items-center justify-between text-[11px] text-slate-400 shrink-0 select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            {isConnected ? "Synchronized" : "Reconnecting..."}
          </span>
          <span>
            Ln {cursorPos.lineNumber}, Col {cursorPos.column}
          </span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[10px]">
          <span>UTF-8</span>
          <span>Spaces: 2</span>
          <span className="text-sky-400 uppercase font-semibold">{language}</span>
        </div>
      </div>
    </div>
  );
}