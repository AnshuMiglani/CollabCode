import { useState, useRef, useEffect } from "react";
import {
  Play,
  Share2,
  Check,
  PanelLeft,
  ExternalLink,
  Code2,
  Crown,
  ChevronDown,
  Sparkles,
  Copy,
  Hash,
  Send,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { LANGUAGES } from "../utils/languageUtils";

export default function Header({
  language,
  onLanguageChange,
  onRun,
  isRunning,
  onFormat,
  onToggleWebPreview,
  roomId,
  username,
  creatorName,
  participants = [],
  onToggleSidebar,
  copiedLink,
  onCopyLink,
  copiedRoomId,
  onCopyRoomId,
  onShareNative,
  isConnected = true,
  connectionStatus = "connected",
}) {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const currentLangObj = LANGUAGES.find((l) => l.value === language) || LANGUAGES[0];
  const isHost = username === creatorName;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target)) {
        setShowShareMenu(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <header className="flex items-center justify-between px-3 h-12 bg-[#0a0c14] border-b border-white/8 shrink-0 text-slate-200 select-none">
      {/* Left: Brand + Sidebar Toggle + Live Pulse + Room ID */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Toggle Explorer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-black text-xs text-slate-950 shadow-md shadow-sky-500/20">
            CC
          </div>
          <span className="font-black text-sm tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-300 bg-clip-text text-transparent hidden sm:inline">
            CollabCode
          </span>
        </div>

        {/* Live Pulse Indicator */}
        <div
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
            isConnected
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              : connectionStatus === "reconnecting"
              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
          }`}
          title={
            isConnected
              ? "WebSocket Synchronized"
              : "Connecting to cloud engine (Render free tier wakes in ~30s)..."
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected
                ? "bg-emerald-400 live-pulse"
                : connectionStatus === "reconnecting"
                ? "bg-amber-400 animate-pulse"
                : "bg-rose-400 animate-pulse"
            }`}
          />
          <span className="hidden md:inline">
            {isConnected
              ? "Live"
              : connectionStatus === "reconnecting"
              ? "Waking Server..."
              : "Connecting..."}
          </span>
        </div>

        {/* Room ID Badge & 1-Click Copy */}
        {roomId && (
          <button
            onClick={onCopyRoomId}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all cursor-pointer group ${
              copiedRoomId
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-slate-300 hover:text-white"
            }`}
            title="Click to copy Room ID"
          >
            <Hash className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            <span className="max-w-[110px] sm:max-w-[150px] truncate">{roomId}</span>
            {copiedRoomId ? (
              <span className="flex items-center gap-1 text-[10px] font-sans font-semibold text-emerald-400">
                <Check className="w-3 h-3" /> Copied!
              </span>
            ) : (
              <Copy className="w-3 h-3 text-slate-500 group-hover:text-slate-300 ml-0.5" />
            )}
          </button>
        )}

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Language Switcher Dropdown */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs transition-colors"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: currentLangObj.color || "#38bdf8" }}
            />
            <span className="font-medium text-slate-200">{currentLangObj.label}</span>
            <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
          </button>

          {showLangMenu && (
            <div className="absolute left-0 top-full mt-1 w-44 glass-dropdown rounded-xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 shadow-2xl bg-[#0f121d] border border-white/10">
              <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Select Language
              </div>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => {
                    onLanguageChange(lang.value);
                    setShowLangMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                    language === lang.value
                      ? "bg-sky-500/20 text-sky-300 font-medium"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lang.color }}
                    />
                    <span>{lang.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">.{lang.ext}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center / Actions: Run, Format, Preview */}
      <div className="flex items-center gap-2">
        {/* Run Button */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
          title="Run Code (Ctrl + Enter)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isRunning ? "Running..." : "Run"}</span>
          <kbd className="hidden lg:inline text-[9px] bg-black/20 px-1 rounded ml-1 font-mono">
            ⌘↵
          </kbd>
        </button>

        {/* Web Preview Button */}
        <button
          onClick={onToggleWebPreview}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          title="Open Live Web Preview"
        >
          <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
          <span>Web Preview</span>
        </button>

        {/* Format Document Button */}
        <button
          onClick={onFormat}
          className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
          title="Format Code (Ctrl + S)"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Format</span>
        </button>
      </div>

      {/* Right: Collaborators Avatar Stack + Share Menu + Self Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Collaborators Avatar Stack */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {participants.slice(0, 4).map((u, i) => (
            <div
              key={u.id || i}
              className="w-6 h-6 rounded-full border-2 border-[#0a0c14] flex items-center justify-center text-[10px] font-bold text-slate-950 uppercase shadow-sm cursor-pointer transition-transform hover:scale-110 hover:z-10"
              style={{ backgroundColor: u.color || "#38bdf8" }}
              title={`${u.username} ${u.username === creatorName ? "(Host)" : ""}`}
            >
              {u.username.slice(0, 1)}
            </div>
          ))}
          {participants.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-[#0a0c14] flex items-center justify-center text-[9px] text-slate-300 font-medium">
              +{participants.length - 4}
            </div>
          )}
        </div>

        {/* Share Dropdown / Popover */}
        <div className="relative" ref={shareMenuRef}>
          <div className="inline-flex rounded-lg shadow-sm">
            {/* Quick 1-click Copy Link button */}
            <button
              onClick={onCopyLink}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-l-lg border text-xs font-semibold transition-all cursor-pointer ${
                copiedLink
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                  : "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-300"
              }`}
              title="Copy direct invite link"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {copiedLink ? "Link Copied!" : "Share Link"}
              </span>
            </button>

            {/* Dropdown toggle for more sharing options */}
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="px-1.5 py-1 rounded-r-lg border-y border-r border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 hover:text-white transition-all cursor-pointer"
              title="More sharing options"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Share Options Dropdown Popover */}
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 rounded-xl p-3 z-50 shadow-2xl bg-[#0f121d] border border-white/10 text-xs animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Invite Collaborators
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Room: {roomId}</span>
              </div>

              <div className="space-y-1.5">
                {/* 1. Copy Room ID Option */}
                <button
                  onClick={() => {
                    onCopyRoomId();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-sky-400" />
                    <div>
                      <div className="font-medium text-white">Copy Room ID</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[150px]">
                        {roomId}
                      </div>
                    </div>
                  </div>
                  {copiedRoomId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* 2. Copy Invite Link Option */}
                <button
                  onClick={() => {
                    onCopyLink();
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-medium text-white">Copy Invite Link</div>
                      <div className="text-[10px] text-slate-400">Direct link with room query</div>
                    </div>
                  </div>
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* 3. Native Share Sheet (Mobile / Tablet / Desktop) */}
                {typeof navigator !== "undefined" && navigator.share && (
                  <button
                    onClick={() => {
                      if (onShareNative) onShareNative();
                      setShowShareMenu(false);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 transition-colors text-left"
                  >
                    <Send className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-medium text-white">Share via...</div>
                      <div className="text-[10px] text-slate-400">WhatsApp, Slack, Discord</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
          {isHost && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
          <span className="truncate max-w-[85px]">{username}</span>
        </div>
      </div>
    </header>
  );
}
