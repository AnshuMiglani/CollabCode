import { useState } from "react";
import { getFileIcon } from "../utils/languageUtils";

export default function Sidebar({
  files, activeFile, onFileSelect, onAddFile,
  participants, username, creatorName, onKickUser,
}) {
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleAdd = () => {
    if (!newFileName.trim()) return;
    onAddFile(newFileName.trim());
    setNewFileName("");
    setShowNewFile(false);
  };

  return (
    <div className="flex flex-col bg-[#252526] h-full overflow-hidden">

      {/* Explorer header */}
      <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 uppercase tracking-wider border-b border-[#333] shrink-0">
        <span>Explorer</span>
        <button
          onClick={() => setShowNewFile(!showNewFile)}
          className="text-gray-400 hover:text-white text-lg leading-none"
          title="New File"
        >+</button>
      </div>

      {/* New file input */}
      {showNewFile && (
        <div className="px-2 py-1 shrink-0">
          <input
            autoFocus
            className="w-full bg-[#3a3a3a] text-white text-xs px-2 py-1 rounded outline-none border border-[#61dafb]"
            placeholder="filename.js"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowNewFile(false); }}
          />
        </div>
      )}

      {/* File list */}
      <div className="flex-1 overflow-y-auto py-1">
        {files.map((f) => (
          <div
            key={f.name}
            onClick={() => onFileSelect(f.name)}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs cursor-pointer transition-colors ${
              activeFile === f.name
                ? "bg-[#37373d] text-white"
                : "text-gray-400 hover:bg-[#2a2d2e] hover:text-white"
            }`}
          >
            <img
  src={getFileIcon(f.name)}
  alt="file"
  className="w-4 h-4 object-contain shrink-0"
/>
            <span className="truncate flex-1">{f.name}</span>
          </div>
        ))}
      </div>

      {/* Participants */}
      <div className="border-t border-[#333] shrink-0">
        <div className="px-3 py-2 text-xs text-gray-400 uppercase tracking-wider">
          Participants ({participants.length})
        </div>
        <div className="pb-2 max-h-36 overflow-y-auto">
          {participants.map((p, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1 text-xs group">
              {/* Gold crown for creator, green dot for others */}
              {p.username === creatorName
                ? <span className="text-yellow-400 text-sm">👑</span>
                : <span className="w-2 h-2 rounded-full bg-green-400 shrink-0"></span>
              }
              <span className={`truncate flex-1 ${p.username === creatorName ? "text-yellow-300" : "text-gray-300"}`}>
                {p.username}
              </span>
              {p.username === username
                ? <span className="text-gray-500 text-xs">(you)</span>
                : username === creatorName && (
                  <button
                    onClick={() => onKickUser(p.username)}
                    className="hidden group-hover:block text-red-500 hover:text-red-400 text-xs ml-auto"
                    title="Remove user"
                  >✕</button>
                )
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}