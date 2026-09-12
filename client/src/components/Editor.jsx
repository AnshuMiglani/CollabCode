import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import Header from "./Header";
import Sidebar from "./Sidebar";
import EditorPanel from "./EditorPanel";
import ResizableDivider from "./ResizableDivider";
import OutputPanel from "./OutputPanel";
import XTerminal from "./XTerminal";
import ChatPanel from "./ChatPanel";
import useSocket from "../hooks/useSocket";
import {
  LANGUAGES,
  DEFAULT_TEMPLATES,
  JUDGE0_LANGUAGES,
  getLangByExt,
  getLangByValue,
  renameFileExt,
} from "../utils/languageUtils";
import { Terminal, MessageSquare, TerminalSquare, Eye, X, Maximize2, Minimize2 } from "lucide-react";

export default function Editor({ roomId, username, onLeaveRoom }) {
  // Panel Layout Dimensions
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [bottomPanelHeight, setBottomPanelHeight] = useState(200);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isBottomMinimized, setIsBottomMinimized] = useState(false);
  const [bottomTab, setBottomTab] = useState("output"); // "output" | "terminal" | "chat"

  // Files State
  const [files, setFiles] = useState([
    { name: "main.js", language: "javascript", content: DEFAULT_TEMPLATES.javascript },
    { name: "index.html", language: "html", content: DEFAULT_TEMPLATES.html },
    { name: "styles.css", language: "css", content: DEFAULT_TEMPLATES.css },
  ]);
  const [activeFile, setActiveFile] = useState("main.js");
  const [codeMap, setCodeMap] = useState({
    "main.js": DEFAULT_TEMPLATES.javascript,
    "index.html": DEFAULT_TEMPLATES.html,
    "styles.css": DEFAULT_TEMPLATES.css,
  });

  // Room Participants & Chat
  const [participants, setParticipants] = useState([{ username, color: "#38bdf8" }]);
  const [creatorName, setCreatorName] = useState(username);
  const [messages, setMessages] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});

  // Editor Preferences
  const [editorTheme, setEditorTheme] = useState("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState("on");

  // Runner & Terminal
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState("");
  const [outputError, setOutputError] = useState("");
  const [exitCode, setExitCode] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);
  const [stdin, setStdin] = useState("");

  // Web Preview Modal
  const [showWebPreview, setShowWebPreview] = useState(false);
  const [previewSrcDoc, setPreviewSrcDoc] = useState("");

  // UI state
  const [copied, setCopied] = useState(false);

  // Active File & Language
  const currentFileData = files.find((f) => f.name === activeFile) || files[0] || {
    name: "main.js",
    language: "javascript",
  };
  const activeLanguage = currentFileData.language || "javascript";
  const activeCode = codeMap[activeFile] ?? currentFileData.content ?? "";

  // ── WebSockets Hook ──
  const {
    socket,
    isConnected,
    selfColor,
    emitCodeChange,
    emitCursorMove,
    emitFileCreate,
    emitFileRename,
    emitFileDelete,
    emitSendMessage,
    emitUserTyping,
    emitKickUser,
  } = useSocket({
    roomId,
    username,
    onSyncRoomState: (state) => {
      if (state.files) {
        const fileList = Object.values(state.files);
        setFiles(fileList);
        const map = {};
        fileList.forEach((f) => {
          map[f.name] = f.content || "";
        });
        setCodeMap(map);
        if (!map[activeFile] && fileList[0]) {
          setActiveFile(fileList[0].name);
        }
      }
      if (state.creator) setCreatorName(state.creator);
      if (state.users) setParticipants(state.users);
      if (state.messages) setMessages(state.messages);
    },
    onCodeUpdate: ({ fileName, code, updatedBy }) => {
      setCodeMap((prev) => ({
        ...prev,
        [fileName]: code,
      }));
    },
    onRemoteCursorUpdate: (data) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [data.socketId]: data,
      }));
    },
    onRemoteCursorRemove: (socketId) => {
      setRemoteCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    },
    onFileCreated: ({ file, files: newFiles }) => {
      if (newFiles) {
        setFiles(Object.values(newFiles));
      } else {
        setFiles((prev) => [...prev.filter((f) => f.name !== file.name), file]);
      }
      setCodeMap((prev) => ({ ...prev, [file.name]: file.content || "" }));
    },
    onFileRenamed: ({ oldName, newName, language, files: newFiles }) => {
      if (newFiles) {
        setFiles(Object.values(newFiles));
      }
      setCodeMap((prev) => {
        const next = { ...prev };
        next[newName] = next[oldName] || "";
        delete next[oldName];
        return next;
      });
      if (activeFile === oldName) {
        setActiveFile(newName);
      }
    },
    onFileDeleted: ({ fileName, files: newFiles }) => {
      if (newFiles) {
        setFiles(Object.values(newFiles));
      } else {
        setFiles((prev) => prev.filter((f) => f.name !== fileName));
      }
      setCodeMap((prev) => {
        const next = { ...prev };
        delete next[fileName];
        return next;
      });
      if (activeFile === fileName) {
        const remaining = files.filter((f) => f.name !== fileName);
        if (remaining.length > 0) {
          setActiveFile(remaining[0].name);
        }
      }
    },
    onChatMessage: (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (bottomTab !== "chat") {
        setUnreadChatCount((c) => c + 1);
      }
    },
    onUserTyping: ({ username: typer, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping && !prev.includes(typer)) return [...prev, typer];
        if (!isTyping) return prev.filter((u) => u !== typer);
        return prev;
      });
    },
    onParticipantsUpdate: (list) => {
      setParticipants(list);
    },
    onKicked: () => {
      alert("You have been removed from the session by the host.");
      if (onLeaveRoom) onLeaveRoom();
    },
  });

  // ── Code Change Handler ──
  const typingTimeoutRef = useRef(null);
  const handleCodeChange = (newCode) => {
    setCodeMap((prev) => ({
      ...prev,
      [activeFile]: newCode,
    }));
    emitCodeChange(activeFile, newCode);

    // Typing presence indicator
    emitUserTyping(activeFile, true);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitUserTyping(activeFile, false);
    }, 1200);
  };

  // ── Cursor Movement Handler ──
  const handleCursorChange = ({ cursor, selection }) => {
    emitCursorMove(activeFile, cursor, selection);
  };

  // ── Language Change Handler ──
  const handleLanguageChange = (newLang) => {
    const langObj = getLangByValue(newLang);
    const newName = renameFileExt(activeFile, langObj.ext);

    emitFileRename(activeFile, newName, newLang);

    setFiles((prev) =>
      prev.map((f) => (f.name === activeFile ? { ...f, name: newName, language: newLang } : f))
    );
    setCodeMap((prev) => {
      const next = { ...prev };
      next[newName] = next[activeFile] || "";
      delete next[activeFile];
      return next;
    });
    setActiveFile(newName);
  };

  // ── File Management ──
  const handleFileSelect = (name) => {
    setActiveFile(name);
  };

  const handleAddFile = (name) => {
    if (files.find((f) => f.name === name)) {
      setActiveFile(name);
      return;
    }
    const ext = name.split(".").pop();
    const langObj = getLangByExt(ext);
    const initialContent = DEFAULT_TEMPLATES[langObj.value] || `// ${name}\n`;

    const newFile = {
      name,
      language: langObj.value,
      content: initialContent,
    };

    emitFileCreate(newFile);
    setFiles((prev) => [...prev, newFile]);
    setCodeMap((prev) => ({ ...prev, [name]: initialContent }));
    setActiveFile(name);
  };

  const handleRenameFile = (oldName, newName) => {
    const ext = newName.split(".").pop();
    const langObj = getLangByExt(ext);

    emitFileRename(oldName, newName, langObj.value);
    setFiles((prev) =>
      prev.map((f) =>
        f.name === oldName ? { ...f, name: newName, language: langObj.value } : f
      )
    );
    setCodeMap((prev) => {
      const next = { ...prev };
      next[newName] = next[oldName] || "";
      delete next[oldName];
      return next;
    });
    if (activeFile === oldName) setActiveFile(newName);
  };

  const handleDeleteFile = (fileName) => {
    if (files.length <= 1) return;
    emitFileDelete(fileName);
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setCodeMap((prev) => {
      const next = { ...prev };
      delete next[fileName];
      return next;
    });
    if (activeFile === fileName) {
      const remaining = files.filter((f) => f.name !== fileName);
      if (remaining[0]) setActiveFile(remaining[0].name);
    }
  };

  // ── Helper to safely encode/decode Base64 for UTF-8 code and compiler outputs ──
  const toBase64 = (str) => {
    try {
      return btoa(unescape(encodeURIComponent(str || "")));
    } catch (e) {
      return btoa(str || "");
    }
  };

  const fromBase64 = (b64) => {
    if (!b64) return "";
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (e) {
      try {
        return atob(b64);
      } catch (e2) {
        return b64;
      }
    }
  };

  // ── Run Code (Judge0 CE Cloud Online Compiler with Stdin Support) ──
  const handleRunCode = async () => {
    const langConfig = getLangByValue(activeLanguage);

    // Open Output tab and clear previous run
    setBottomTab("output");
    setIsBottomMinimized(false);
    setIsRunning(true);
    setOutput("");
    setOutputError("");
    setExitCode(null);
    setExecutionTime(null);

    const startTime = performance.now();

    // For HTML / CSS, launch Web Preview automatically
    if (langConfig.value === "html" || langConfig.value === "css") {
      handleOpenWebPreview();
      setIsRunning(false);
      setOutput("Generated live HTML/CSS web preview.");
      setExitCode(0);
      return;
    }

    const judge0Id = JUDGE0_LANGUAGES[langConfig.value];

    if (!judge0Id) {
      setOutputError(`Language '${activeLanguage}' does not support serverless cloud execution. Please run your code using the interactive Terminal below.`);
      setIsRunning(false);
      setExitCode(1);
      return;
    }

    try {
      const response = await axios.post(
        "https://ce.judge0.com/submissions?base64_encoded=true&wait=true",
        {
          source_code: toBase64(activeCode),
          language_id: judge0Id,
          stdin: toBase64(stdin || ""),
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const resData = response.data || {};
      const elapsed = resData.time
        ? Math.round(parseFloat(resData.time) * 1000)
        : Math.round(performance.now() - startTime);

      setExecutionTime(elapsed);

      const stdout = fromBase64(resData.stdout);
      const compileOutput = fromBase64(resData.compile_output);
      const stderr = fromBase64(resData.stderr);
      const message = fromBase64(resData.message);
      const statusId = resData.status?.id;
      const statusDesc = resData.status?.description || "";

      setOutput(stdout);

      if (statusId && statusId !== 3) {
        // Status 3 is Accepted. Show full compiler diagnostic or runtime error
        const errorDetails = compileOutput || stderr || message || `Execution finished with: ${statusDesc}`;
        setOutputError(errorDetails);
        setExitCode(statusId);
      } else {
        setOutputError(stderr || compileOutput);
        setExitCode(0);
      }
    } catch (err) {
      // If cloud fails, try fallback to backend /api/run
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      try {
        const localRes = await axios.post(`${backendUrl}/api/run`, {
          language: langConfig.value,
          code: activeCode,
          stdin: stdin || "",
        });
        const elapsed = Math.round(performance.now() - startTime);
        setExecutionTime(elapsed);
        setOutput(localRes.data.stdout || "");
        setOutputError(localRes.data.stderr || "");
        setExitCode(localRes.data.exitCode ?? 0);
        return;
      } catch (localErr) {}

      const elapsed = Math.round(performance.now() - startTime);
      setExecutionTime(elapsed);
      setOutputError(
        `Execution request failed: ${err.response?.data?.error || err.response?.data?.message || err.message}. You can also run code through the interactive Terminal.`
      );
      setExitCode(1);
    } finally {
      setIsRunning(false);
    }
  };

  // ── Live Web Preview ──
  const handleOpenWebPreview = () => {
    const htmlFile = files.find((f) => f.name.endsWith(".html"));
    const cssFile = files.find((f) => f.name.endsWith(".css"));
    const jsFile = files.find((f) => f.name.endsWith(".js"));

    const htmlContent = htmlFile ? codeMap[htmlFile.name] || htmlFile.content : "<div style='padding:2rem;font-family:sans-serif;'>No index.html file found in project.</div>";
    const cssContent = cssFile ? codeMap[cssFile.name] || cssFile.content : "";
    const jsContent = jsFile ? codeMap[jsFile.name] || jsFile.content : "";

    const combinedDoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>${jsContent}<\/script>
        </body>
      </html>
    `;
    setPreviewSrcDoc(combinedDoc);
    setShowWebPreview(true);
  };

  // ── Share Room Link ──
  const copyRoomLink = () => {
    const shareUrl = `${window.location.origin}/?room=${encodeURIComponent(roomId)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // ── Resizers ──
  const resizeSidebar = useCallback((delta) => {
    setSidebarWidth((w) => Math.max(180, Math.min(450, w + delta)));
  }, []);

  const resizeBottomPanel = useCallback((delta) => {
    setBottomPanelHeight((h) => Math.max(100, Math.min(600, h - delta)));
  }, []);

  // Keyboard shortcut Ctrl+Enter / Cmd+Enter to Run
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeLanguage, activeCode, stdin]);

  return (
    <div className="flex flex-col h-screen bg-[#090a0f] text-slate-100 overflow-hidden select-none font-sans">
      {/* 1. Header Bar */}
      <Header
        language={activeLanguage}
        onLanguageChange={handleLanguageChange}
        onRun={handleRunCode}
        isRunning={isRunning}
        onFormat={() => {
          // Trigger format on Monaco via CustomEvent or shortcut
          window.dispatchEvent(new CustomEvent("format-code-request"));
        }}
        onToggleWebPreview={handleOpenWebPreview}
        roomId={roomId}
        username={username}
        creatorName={creatorName}
        participants={participants}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        copied={copied}
        onCopy={copyRoomLink}
        isConnected={isConnected}
      />

      {/* 2. Main IDE Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Collapsible Sidebar */}
        {showSidebar && (
          <>
            <div style={{ width: sidebarWidth }} className="shrink-0 overflow-hidden">
              <Sidebar
                files={files}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
                onAddFile={handleAddFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
                participants={participants}
                currentUser={username}
                creatorName={creatorName}
                onKickUser={emitKickUser}
                theme={editorTheme}
                onThemeChange={setEditorTheme}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
                wordWrap={wordWrap}
                onWordWrapChange={setWordWrap}
              />
            </div>
            <ResizableDivider onResize={resizeSidebar} direction="horizontal" />
          </>
        )}

        {/* Center: Editor Canvas + Bottom Panel */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top: Monaco Editor Panel */}
          <div className="flex-1 overflow-hidden">
            <EditorPanel
              files={files}
              activeFile={activeFile}
              onFileSelect={handleFileSelect}
              onAddFile={handleAddFile}
              onCloseFile={handleDeleteFile}
              code={activeCode}
              language={activeLanguage}
              onChange={handleCodeChange}
              onCursorChange={handleCursorChange}
              remoteCursors={remoteCursors}
              theme={editorTheme}
              fontSize={fontSize}
              wordWrap={wordWrap}
              isConnected={isConnected}
            />
          </div>

          {/* Bottom Panel Resizer */}
          {!isBottomMinimized && (
            <ResizableDivider onResize={resizeBottomPanel} direction="vertical" />
          )}

          {/* Bottom Tabbed Panel */}
          <div
            style={{ height: isBottomMinimized ? 32 : bottomPanelHeight }}
            className="flex flex-col bg-[#090b14] border-t border-white/8 shrink-0 transition-all duration-150 overflow-hidden"
          >
            {/* Bottom Tabs Header */}
            <div className="flex items-center justify-between px-3 h-8 bg-[#0c0e17] border-b border-white/8 shrink-0">
              <div className="flex items-center gap-1">
                {/* Output Tab */}
                <button
                  onClick={() => {
                    setBottomTab("output");
                    setIsBottomMinimized(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                    bottomTab === "output" && !isBottomMinimized
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-sky-400" />
                  <span>Output</span>
                </button>

                {/* Terminal Tab */}
                <button
                  onClick={() => {
                    setBottomTab("terminal");
                    setIsBottomMinimized(false);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                    bottomTab === "terminal" && !isBottomMinimized
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <TerminalSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terminal</span>
                </button>

                {/* Live Chat Tab */}
                <button
                  onClick={() => {
                    setBottomTab("chat");
                    setIsBottomMinimized(false);
                    setUnreadChatCount(0);
                  }}
                  className={`relative flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
                    bottomTab === "chat" && !isBottomMinimized
                      ? "bg-white/10 text-white font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Room Chat</span>
                  {unreadChatCount > 0 && (
                    <span className="w-4 h-4 bg-sky-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center animate-pulse">
                      {unreadChatCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Minimize / Maximize toggle */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsBottomMinimized(!isBottomMinimized)}
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  title={isBottomMinimized ? "Expand Panel" : "Minimize Panel"}
                >
                  {isBottomMinimized ? (
                    <Maximize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Minimize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Bottom Tab Active Content */}
            {!isBottomMinimized && (
              <div className="flex-1 overflow-hidden">
                {bottomTab === "output" && (
                  <OutputPanel
                    output={output}
                    error={outputError}
                    isRunning={isRunning}
                    executionTime={executionTime}
                    exitCode={exitCode}
                    stdin={stdin}
                    onStdinChange={setStdin}
                    onClear={() => {
                      setOutput("");
                      setOutputError("");
                      setExitCode(null);
                    }}
                  />
                )}

                {bottomTab === "terminal" && (
                  <XTerminal socket={socket} roomId={roomId} />
                )}

                {bottomTab === "chat" && (
                  <ChatPanel
                    messages={messages}
                    onSendMessage={emitSendMessage}
                    currentUser={username}
                    typingUsers={typingUsers}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Live Web Preview Modal */}
      {showWebPreview && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-4xl h-[80vh] bg-[#0d0f18] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#131625] border-b border-white/8 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Live Web Preview (HTML / CSS / JS)</span>
              </div>
              <button
                onClick={() => setShowWebPreview(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Modal Iframe */}
            <iframe
              title="Preview"
              srcDoc={previewSrcDoc}
              className="flex-1 w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>
      )}
    </div>
  );
}