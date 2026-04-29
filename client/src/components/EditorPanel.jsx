import MonacoEditor from "@monaco-editor/react";
import { getFileIcon } from "../utils/languageUtils";

export default function EditorPanel({ files, activeFile, onFileSelect, code, language, onChange }) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex bg-[#2d2d2d] border-b border-[#111] overflow-x-auto shrink-0">
        {files.map((f) => (
          <div
            key={f.name}
            onClick={() => onFileSelect(f.name)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs cursor-pointer border-r border-[#111] shrink-0 transition-colors ${
              activeFile === f.name
                ? "bg-[#1e1e1e] text-white border-t-2 border-t-[#61dafb]"
                : "text-gray-500 hover:text-gray-300 hover:bg-[#252526]"
            }`}
          >
            <img
  src={getFileIcon(f.name)}
  alt="icon"
  className="w-4 h-4 object-contain"
/>
<span>{f.name}</span>
          </div>
        ))}
      </div>

      {/* Monaco */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: "on",
            automaticLayout: true,
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            formatOnType: true,
            formatOnPaste: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}