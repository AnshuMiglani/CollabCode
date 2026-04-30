import { useState, useCallback } from "react";
import axios from "axios";

import Header from "./Header";
import Sidebar from "./Sidebar";
import EditorPanel from "./EditorPanel";
import OutputPanel from "./OutputPanel";
import Terminal from "./Terminal";
import ResizableDivider from "./ResizableDivider";
import useSocket from "../hooks/useSocket";

import {
   DEFAULT_CODE,
  getLangByExt, getLangByValue,
  renameFileExt,
} from "../utils/languageUtils";

const JUDGE0_URL = "https://ce.judge0.com";

export default function Editor({ roomId, username }) {
  // Panel sizes
  const [sidebarWidth, setSidebarWidth] = useState(210);
  const [outputWidth, setOutputWidth]   = useState(300);
  const [terminalHeight, setTerminalHeight] = useState(150);
  const [showSidebar, setShowSidebar]   = useState(true);

  // Files: each file stores its OWN code per language
  // codemap: { filename: { lang: code } }
  const [files, setFiles] = useState([{ name: "main.js", language: "javascript" }]);
  const [activeFile, setActiveFile] = useState("main.js");
  const [codeMap, setCodeMap] = useState({ "main.js": { javascript: DEFAULT_CODE["javascript"] } });
  const [language, setLanguage] = useState("javascript");

  // UI state
  const [copied, setCopied] = useState(false);
  const [output, setOutput]   = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [participants, setParticipants] = useState([{ username }]);
  const [terminalHistory, setTerminalHistory] = useState(["Welcome to CollabCode Terminal ⚡", "Click ▶ Run to execute your code."]);
  const [creatorName] = useState(username); // first user = creator

  // Current code
  const code = codeMap[activeFile]?.[language] ?? DEFAULT_CODE[language];

  // ── Socket ──
  const { emitCodeChange, emitKickUser } = useSocket({
    roomId, username, activeFile,
    onLoadCode: (c) => setCodeMap((prev) => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], [language]: c }
    })),
    onCodeUpdate: (c) => setCodeMap((prev) => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], [language]: c }
    })),
    onParticipantsUpdate: (list) =>
      setParticipants(list.map((u) => (typeof u === "string" ? { username: u } : u))),
  });

  // ── Code change ──
  const handleCodeChange = (newCode) => {
    const shouldEmit = emitCodeChange(roomId, newCode);
    if (shouldEmit !== false) {
      setCodeMap((prev) => ({
        ...prev,
        [activeFile]: { ...prev[activeFile], [language]: newCode },
      }));
    }
  };

  // ── Language change → rename active file ext, preserve old code ──
  const handleLanguageChange = (newLang) => {
    const newLangObj = getLangByValue(newLang);
    const newName = renameFileExt(activeFile, newLangObj.ext);

    setFiles((prev) =>
      prev.map((f) => f.name === activeFile
        ? { name: newName, language: newLang }
        : f
      )
    );

    // Move codeMap entry to new filename
    setCodeMap((prev) => {
      const existing = prev[activeFile] || {};
      const updated = { ...prev };
      delete updated[activeFile];
      updated[newName] = existing; // preserve all lang codes under new name
      return updated;
    });

    setActiveFile(newName);
    setLanguage(newLang);
  };

  // ── File select ──
  const handleFileSelect = (name) => {
    const file = files.find((f) => f.name === name);
    if (file) {
      setActiveFile(name);
      setLanguage(file.language);
    }
  };

  // ── Add file ──
  const handleAddFile = (name) => {
    if (files.find((f) => f.name === name)) return;
    const ext = name.split(".").pop();
    const lang = getLangByExt(ext);
    setFiles((prev) => [...prev, { name, language: lang.value }]);
    setCodeMap((prev) => ({ ...prev, [name]: { [lang.value]: DEFAULT_CODE[lang.value] } }));
    setActiveFile(name);
    setLanguage(lang.value);
  };

  // ── Kick user ──
  const handleKickUser = (targetUsername) => {
    emitKickUser(roomId, targetUsername);
    setParticipants((prev) => prev.filter((p) => p.username !== targetUsername));
  };

  // ── Run code ──
  const runCode = async () => {
    setIsRunning(true);
    setOutput(" Running...");
    const lang = getLangByValue(language);
    setTerminalHistory((prev) => [...prev, `$ Running ${lang.label}...`]);

    try {
      const submitRes = await axios.post(
        `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
        { language_id: lang.id, source_code: code, stdin: "" },
        { headers: { "Content-Type": "application/json" } }
      );
      const token = submitRes.data.token;

      let result;
      for (let i = 0; i < 10; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        const res = await axios.get(`${JUDGE0_URL}/submissions/${token}?base64_encoded=false`);
        if (res.data.status.id > 2) { result = res.data; break; }
      }

      const out = result?.stdout || result?.stderr || result?.compile_output || "No output";
      setOutput(out);
      setTerminalHistory((prev) => [...prev, "$ Output:", out.trim(), "$ Done ✅"]);
    } catch (err) {
      const msg = "❌ Error: " + (err.message || "Could not run code");
      setOutput(msg);
      setTerminalHistory((prev) => [...prev, msg]);
    }
    setIsRunning(false);
  };

  // ── Copy room ID ──
  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Resizers ──
  const resizeSidebar  = useCallback((delta) => setSidebarWidth((w) => Math.max(150, Math.min(400, w + delta))), []);
  const resizeOutput   = useCallback((delta) => setOutputWidth((w) => Math.max(150, Math.min(600, w - delta))), []);
  const resizeTerminal = useCallback((delta) => setTerminalHeight((h) => Math.max(80, Math.min(400, h - delta))), []);

  return (
    <div className="flex flex-col h-screen bg-[#1e1e1e] text-white overflow-hidden select-none">

      <Header
        language={language}
        onLanguageChange={handleLanguageChange}
        onRun={runCode}
        isRunning={isRunning}
        roomId={roomId}
        username={username}
        onToggleSidebar={() => setShowSidebar((v) => !v)}
        copied={copied}
        onCopy={copyRoomId}
      />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        {showSidebar && (
          <>
            <div style={{ width: sidebarWidth }} className="shrink-0 overflow-hidden">
              <Sidebar
                files={files}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
                onAddFile={handleAddFile}
                participants={participants}
                username={username}
                creatorName={creatorName}
                onKickUser={handleKickUser}
              />
            </div>
            <ResizableDivider onResize={resizeSidebar} direction="horizontal" />
          </>
        )}

        {/* Editor + Output */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <EditorPanel
                files={files}
                activeFile={activeFile}
                onFileSelect={handleFileSelect}
                code={code}
                language={language}
                onChange={handleCodeChange}
              />
            </div>

            {/* Output */}
            <ResizableDivider onResize={resizeOutput} direction="horizontal" />
            <div style={{ width: outputWidth }} className="shrink-0 overflow-hidden">
              <OutputPanel output={output} onClear={() => setOutput("")} />
            </div>
          </div>

          {/* Terminal */}
          <ResizableDivider onResize={resizeTerminal} direction="vertical" />
          <div style={{ height: terminalHeight }} className="shrink-0 overflow-hidden">
            <Terminal
              history={terminalHistory}
              onClear={() => setTerminalHistory(["Terminal cleared."])}
            />
          </div>
        </div>
      </div>
    </div>
  );
}