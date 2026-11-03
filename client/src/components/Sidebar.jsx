import { useState } from "react";
import {
  Files,
  Users,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Crown,
  Download,
  Code2,
  Check,
  X,
  UserX,
  Copy,
  Share2,
  Hash,
  Server
} from "lucide-react";
import { getLangByExt } from "../utils/languageUtils";
import { getBackendUrl } from "../utils/backendUrl";
import { useAlert } from "../context/AlertContext";

export default function Sidebar({
  files = [],
  activeFile,
  onFileSelect,
  onAddFile,
  onRenameFile,
  onDeleteFile,
  participants = [],
  currentUser,
  creatorName,
  onKickUser,
  // Settings
  theme,
  onThemeChange,
  fontSize,
  onFontSizeChange,
  wordWrap,
  onWordWrapChange,
  // Room share & copy
  roomId,
  copiedRoomId,
  onCopyRoomId,
  copiedLink,
  onCopyLink,
  isConnected,
  connectionStatus,
}) {
  const { toast, showConfirm } = useAlert();
  const [activeTab, setActiveTab] = useState("files"); // "files" | "users" | "settings"
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [editingFileName, setEditingFileName] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  const handleCreateSubmit = (e) => {
    e?.preventDefault();
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreating(false);
      return;
    }
    onAddFile(trimmed);
    toast.success(`Created file "${trimmed}".`, { title: "File Created" });
    setNewFileName("");
    setIsCreating(false);
  };

  const startRename = (fileName, e) => {
    e.stopPropagation();
    setEditingFileName(fileName);
    setRenameValue(fileName);
  };

  const handleRenameSubmit = (e) => {
    e?.preventDefault();
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== editingFileName) {
      onRenameFile(editingFileName, trimmed);
      toast.info(`Renamed file to "${trimmed}".`, { title: "File Renamed" });
    }
    setEditingFileName(null);
    setRenameValue("");
  };

  const handleDownloadProject = () => {
    const activeData = files.find((f) => f.name === activeFile);
    if (!activeData) return;
    const blob = new Blob([activeData.content || ""], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = activeData.name;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported "${activeData.name}" to your downloads.`, { title: "File Exported" });
  };

  return (
    <div className="flex h-full bg-[#10121d] border-r border-white/8 text-slate-300">
      {/* Mini Activity Bar */}
      <div className="w-12 bg-[#0a0c14] border-r border-white/8 flex flex-col items-center py-3 gap-4 shrink-0">
        <button
          onClick={() => setActiveTab("files")}
          className={`p-2 rounded-xl transition-all ${
            activeTab === "files"
              ? "bg-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/10 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
          title="Explorer (Files)"
        >
          <Files className="w-5 h-5" />
        </button>

        <button
          onClick={() => setActiveTab("users")}
          className={`relative p-2 rounded-xl transition-all ${
            activeTab === "users"
              ? "bg-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/10 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
          title="Collaborators"
        >
          <Users className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-sky-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
            {participants.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`p-2 rounded-xl transition-all mt-auto ${
            activeTab === "settings"
              ? "bg-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/10 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
          title="Editor Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Content Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* 1. Files Tab */}
        {activeTab === "files" && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-white/8 shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Workspace Files
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCreating(true)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="New File"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  onClick={handleDownloadProject}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Download Active File"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* New File Inline Form */}
            {isCreating && (
              <form onSubmit={handleCreateSubmit} className="p-2 bg-[#171a2a] border-b border-white/8">
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="e.g. script.py, index.html"
                    className="flex-1 bg-[#090a0f] border border-sky-500/50 rounded px-2 py-1 text-xs text-white outline-none font-mono"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setIsCreating(false);
                    }}
                  />
                  <button
                    type="submit"
                    className="p-1 text-emerald-400 hover:bg-emerald-400/20 rounded"
                    title="Confirm"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="p-1 text-slate-400 hover:bg-white/10 rounded"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
              {files.map((file) => {
                const ext = file.name.split(".").pop();
                const langConfig = getLangByExt(ext);
                const isActive = activeFile === file.name;
                const isEditingThis = editingFileName === file.name;

                if (isEditingThis) {
                  return (
                    <form
                      key={file.name}
                      onSubmit={handleRenameSubmit}
                      className="p-1.5 bg-[#1a1d2e] rounded flex items-center gap-1"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 bg-[#090a0f] border border-sky-500/50 rounded px-2 py-0.5 text-xs text-white outline-none font-mono"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setEditingFileName(null);
                        }}
                      />
                      <button
                        type="submit"
                        className="p-1 text-emerald-400 hover:bg-emerald-400/20 rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingFileName(null)}
                        className="p-1 text-slate-400 hover:bg-white/10 rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </form>
                  );
                }

                return (
                  <div
                    key={file.name}
                    onClick={() => onFileSelect(file.name)}
                    className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-all ${
                      isActive
                        ? "bg-sky-500/15 text-white font-medium border border-sky-500/30"
                        : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: langConfig.color || "#38bdf8" }}
                      />
                      <span className="truncate font-mono text-[12px]">{file.name}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startRename(file.name, e)}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/10"
                        title="Rename"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {files.length > 1 && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const confirmed = await showConfirm({
                              title: "Delete File",
                              message: `Are you sure you want to permanently delete "${file.name}"? This file will be removed for all collaborators in this room.`,
                              type: "danger",
                              confirmText: "Delete File",
                              cancelText: "Cancel",
                            });
                            if (confirmed) {
                              onDeleteFile(file.name);
                              toast.info(`Deleted "${file.name}".`, { title: "File Removed" });
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-white/10"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Collaborators Tab */}
        {activeTab === "users" && (
          <div className="flex flex-col h-full">
            <div className="px-3 py-3 border-b border-white/8 shrink-0 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Connected Peers ({participants.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Host: {creatorName}
              </span>
            </div>

            {/* Room ID & Sharing Action Card */}
            {roomId && (
              <div className="p-3 bg-white/[0.03] border-b border-white/8 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Room ID
                  </span>
                  <span className="text-[10px] text-sky-400 font-medium">Click to copy</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    onClick={onCopyRoomId}
                    className="flex-1 px-2.5 py-1.5 bg-[#090b14] border border-white/10 rounded-lg text-xs font-mono text-sky-300 truncate cursor-pointer hover:border-sky-400/40 transition-colors"
                    title="Click to copy Room ID"
                  >
                    {roomId}
                  </div>
                  <button
                    onClick={onCopyRoomId}
                    className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                      copiedRoomId
                        ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                        : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                    title="Copy Room ID"
                  >
                    {copiedRoomId ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <button
                  onClick={onCopyLink}
                  className={`w-full py-1.5 px-2 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    copiedLink
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                      : "bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20"
                  }`}
                >
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedLink ? "Invite Link Copied!" : "Copy Full Invite Link"}</span>
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {participants.map((user) => {
                const isHost = user.username === creatorName;
                const isSelf = user.username === currentUser;

                return (
                  <div
                    key={user.id || user.username}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs text-slate-950 uppercase shrink-0 shadow-sm"
                        style={{ backgroundColor: user.color || "#38bdf8" }}
                      >
                        {user.username.slice(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-white truncate">
                            {user.username}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] text-sky-400 bg-sky-400/10 px-1.5 rounded">
                              you
                            </span>
                          )}
                          {isHost && (
                            <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Host" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          {user.activeFile ? `in ${user.activeFile}` : "browsing"}
                        </p>
                      </div>
                    </div>

                    {/* Host kick action */}
                    {currentUser === creatorName && !isSelf && (
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm({
                            title: "Remove Collaborator",
                            message: `Are you sure you want to disconnect "${user.username}" from this collaborative session?`,
                            type: "danger",
                            confirmText: "Remove User",
                            cancelText: "Cancel",
                          });
                          if (confirmed) {
                            onKickUser(user.username);
                            toast.warning(`Removed "${user.username}" from session.`, { title: "User Removed" });
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all"
                        title="Remove user from room"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Settings Tab */}
        {activeTab === "settings" && (
          <div className="flex flex-col h-full p-3 space-y-4 text-xs overflow-y-auto">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Monaco Theme
              </label>
              <select
                value={theme}
                onChange={(e) => onThemeChange(e.target.value)}
                className="w-full bg-[#161a29] border border-white/10 rounded-lg p-2 text-white outline-none cursor-pointer"
              >
                <option value="vs-dark">Dark+ (Default)</option>
                <option value="hc-black">High Contrast</option>
                <option value="vs">Light</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Font Size ({fontSize}px)
              </label>
              <div className="flex items-center gap-2">
                {[12, 14, 16, 18].map((size) => (
                  <button
                    key={size}
                    onClick={() => onFontSizeChange(size)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                      fontSize === size
                        ? "bg-sky-500 text-slate-950 font-bold border-sky-400"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/8 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-200">Word Wrap</span>
                <span className="text-[10px] text-slate-500">Wrap long lines in editor</span>
              </div>
              <button
                onClick={() => onWordWrapChange(wordWrap === "on" ? "off" : "on")}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  wordWrap === "on" ? "bg-sky-500" : "bg-white/10"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${
                    wordWrap === "on" ? "right-0.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Cloud Engine Info */}
            <div className="pt-3 border-t border-white/8 space-y-1.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                Backend Service
              </span>
              <div className="p-2 rounded-lg bg-black/30 border border-white/5 text-[11px] font-mono break-all text-slate-400">
                {getBackendUrl()}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"
                  }`}
                />
                <span>Status: {isConnected ? "Connected" : connectionStatus || "Reconnecting"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
