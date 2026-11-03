import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { prewarmBackend } from "../utils/backendUrl";
import {
  Code2,
  Terminal,
  Zap,
  Sparkles,
  ArrowRight,
  Dice5,
  Users,
  Cpu,
  Layers,
  CheckCircle2,
  Globe,
  Radio,
  Flame,
  ClipboardPaste
} from "lucide-react";

// Interactive Cyber Particle Network Canvas Component
function CyberMatrixCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Particle nodes
    const particleCount = Math.min(50, Math.floor((width * height) / 25000));
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2 + 1,
        color: i % 3 === 0 ? "rgba(56, 189, 248, " : i % 3 === 1 ? "rgba(168, 85, 247, " : "rgba(16, 185, 129, ",
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and connect particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Draw particle dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color + "0.7)";
        ctx.fill();

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-60" />;
}

// Live Typing Animated Coder Terminal Mockup
function AnimatedTerminalMockup() {
  const [lines, setLines] = useState([]);
  const [activeStep, setActiveStep] = useState(0);

  const TERMINAL_STEPS = [
    { text: "$ collabcode daemon --init", color: "text-slate-400" },
    { text: "[ok] Synchronous WebSocket bus established (0ms)", color: "text-emerald-400" },
    { text: "[ok] Monaco multi-cursor presence engine mounted", color: "text-sky-400" },
    { text: "[ok] Compilers online: GCC 9.2, Python 3.13, Node 22", color: "text-purple-400" },
    { text: "✓ Workspace ready. Waiting for collaborators...", color: "text-emerald-300 font-bold" },
  ];

  useEffect(() => {
    if (activeStep < TERMINAL_STEPS.length) {
      const timeout = setTimeout(() => {
        setLines((prev) => [...prev, TERMINAL_STEPS[activeStep]]);
        setActiveStep((s) => s + 1);
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [activeStep]);

  return (
    <div className="w-full rounded-2xl bg-[#090b14]/90 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden font-mono text-xs">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#121524] border-b border-white/10 select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">
          collabcode-daemon — 80x24
        </span>
        <div className="w-12 text-right">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping" />
        </div>
      </div>

      {/* Terminal Stream */}
      <div className="p-4 space-y-2 min-h-[160px] leading-relaxed">
        {lines.map((line, idx) => (
          <div key={idx} className={`${line.color} flex items-start gap-1.5`}>
            <span className="text-slate-600 select-none">›</span>
            <span>{line.text}</span>
          </div>
        ))}
        {activeStep >= TERMINAL_STEPS.length && (
          <div className="flex items-center gap-2 text-sky-400 pt-1">
            <span className="text-slate-600 select-none">›</span>
            <span>session active</span>
            <span className="w-2 h-4 bg-sky-400 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}

export default function JoinRoom({ onJoin, initialRoomId = "" }) {
  const [roomId, setRoomId] = useState(initialRoomId);
  const [username, setUsername] = useState("");
  const [selectedColor, setSelectedColor] = useState("#38bdf8");
  const [usernameError, setUsernameError] = useState("");
  const [roomError, setRoomError] = useState("");
  const [activeTab, setActiveTab] = useState(initialRoomId ? "join" : "create"); // "create" | "join"
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    prewarmBackend(); // Wake up Render backend immediately
    if (initialRoomId) {
      setRoomId(initialRoomId);
      setActiveTab("join");
    }
  }, [initialRoomId]);

  const USER_COLORS = ["#38bdf8", "#10b981", "#a855f7", "#f43f5e", "#f59e0b", "#06b6d4"];

  const generateRoomSlug = () => {
    const prefixes = ["quantum", "cyber", "hyper", "matrix", "vector", "turbo", "orbit"];
    const nouns = ["core", "nexus", "pulse", "stream", "forge", "byte", "compiler"];
    const num = Math.floor(10 + Math.random() * 90);
    const slug = `${prefixes[Math.floor(Math.random() * prefixes.length)]}-${nouns[Math.floor(Math.random() * nouns.length)]}-${num}`;
    setRoomId(slug);
    setRoomError("");
  };

  const validate = () => {
    let valid = true;
    setUsernameError("");
    setRoomError("");

    if (!username.trim()) {
      setUsernameError("Enter your coder alias or name.");
      valid = false;
    } else if (username.trim().length < 2) {
      setUsernameError("Name must be at least 2 characters.");
      valid = false;
    }
    return valid;
  };

  const handleLaunch = () => {
    if (!validate()) return;
    const finalRoom = (activeTab === "create" && !roomId.trim())
      ? `room-${uuidv4().slice(0, 6)}`
      : roomId.trim();

    if (activeTab === "join" && !roomId.trim()) {
      setRoomError("Please enter a Room ID to join.");
      return;
    }

    onJoin(finalRoom, username.trim());
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#07080f] text-slate-100 overflow-hidden font-sans p-4">
      {/* 1. Animated Canvas Matrix */}
      <CyberMatrixCanvas />

      {/* 2. Cyber Grid Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(56, 189, 248, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* 3. Ambient Glow Circles */}
      <div
        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 65%)",
        }}
      />

      {/* 4. Main Two-Column Container */}
      <div
        className={`relative z-10 w-full max-w-5xl transition-all duration-700 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Left Column: Brand Hero + Animated Terminal */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-sky-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>CollabCode 2.0 • Real-Time Cloud IDE</span>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Code Together.{" "}
              <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                In Real-Time.
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
              Synchronous multi-file pair-programming with live Monaco cursors, Judge0 CE cloud compilers, in-room chat, and interactive shell terminals.
            </p>
          </div>

          {/* Live Terminal Simulation */}
          <AnimatedTerminalMockup />

          {/* Feature Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Instant Sync</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
              <Users className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Live Cursors</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Lang</span>
            </div>
          </div>
        </div>

        {/* Right Column: Coder Login & Workspace Card */}
        <div className="lg:col-span-6">
          <div
            className="rounded-3xl p-6 sm:p-8 backdrop-blur-2xl border transition-all"
            style={{
              background: "rgba(13, 16, 28, 0.88)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Card Header with Tabs */}
            <div className="flex items-center justify-between border-b border-white/8 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center font-black text-slate-950 shadow-md shadow-sky-500/20">
                  CC
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Join Workspace</h2>
                  <p className="text-[11px] text-slate-400">Collaborative Coding Session</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("create")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "create"
                      ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("join")}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    activeTab === "join"
                      ? "bg-sky-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Join
                </button>
              </div>
            </div>

            {/* Invited to Room Alert */}
            {initialRoomId && activeTab === "join" && (
              <div className="mb-4 p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                <span>
                  Invited to workspace: <strong className="font-mono text-white underline">{initialRoomId}</strong>
                </span>
              </div>
            )}

            {/* Coder Alias Input */}
            <div className="mb-4">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Developer Alias
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-slate-500 font-mono text-sm select-none">
                  &gt;_
                </span>
                <input
                  type="text"
                  autoFocus
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameError("");
                  }}
                  placeholder="e.g. Neo, Alan, Ada..."
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090b14] text-white text-sm font-mono outline-none transition-all placeholder-slate-600 border ${
                    usernameError
                      ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500"
                      : "border-white/10 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20"
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
                />
              </div>
              {usernameError && (
                <p className="text-[11px] text-rose-400 mt-1">{usernameError}</p>
              )}
            </div>

            {/* Room ID Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeTab === "create" ? "Workspace Name (Optional)" : "Target Room ID"}
                </label>
                {activeTab === "create" ? (
                  <button
                    type="button"
                    onClick={generateRoomSlug}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Dice5 className="w-3.5 h-3.5" />
                    Shuffle Name
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const clip = await navigator.clipboard.readText();
                        if (clip) {
                          let id = clip.trim();
                          if (id.includes("room=")) {
                            const match = id.match(/[?&]room=([^&]+)/);
                            if (match) id = decodeURIComponent(match[1]);
                          }
                          setRoomId(id);
                          setRoomError("");
                        }
                      } catch (e) {}
                    }}
                    className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    Paste
                  </button>
                )}
              </div>
              <input
                type="text"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value);
                  setRoomError("");
                }}
                placeholder={
                  activeTab === "create"
                    ? "Leave blank to auto-generate..."
                    : "Paste Room ID here..."
                }
                className={`w-full px-4 py-2.5 rounded-xl bg-[#090b14] text-white font-mono text-sm outline-none transition-all placeholder-slate-600 border ${
                  roomError
                    ? "border-rose-500/60 focus:ring-1 focus:ring-rose-500"
                    : "border-white/10 focus:border-sky-400/60 focus:ring-1 focus:ring-sky-400/20"
                }`}
                onKeyDown={(e) => e.key === "Enter" && handleLaunch()}
              />
              {roomError && (
                <p className="text-[11px] text-rose-400 mt-1">{roomError}</p>
              )}
            </div>

            {/* Launch Primary Button */}
            <button
              onClick={handleLaunch}
              className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 hover:from-sky-300 hover:to-indigo-300 shadow-lg shadow-sky-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>
                {activeTab === "create" ? "Launch Synchronous Workspace" : "Connect to Session"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Fast Starter Language Templates */}
            <div className="mt-6 pt-5 border-t border-white/8">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block mb-2 text-center">
                Supported Compilers & Runtimes
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {[
                  { name: "C++ (GCC 9.2)", color: "#00599c" },
                  { name: "Python 3.13", color: "#3776ab" },
                  { name: "JavaScript", color: "#f7df1e" },
                  { name: "Java 17", color: "#ed8b00" },
                  { name: "TypeScript", color: "#3178c6" },
                  { name: "C (GCC)", color: "#a8b9cc" },
                ].map((tech) => (
                  <span
                    key={tech.name}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-slate-300 flex items-center gap-1"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: tech.color }}
                    />
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}