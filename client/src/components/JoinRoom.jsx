import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

const CODE_SNIPPETS = [
  // JavaScript
  { code: "const sum = (a, b) => a + b;", lang: "JS", color: "#f7df1e", tip: "Arrow function — defines a reusable sum function" },
  { code: "fetch('/api').then(r => r.json())", lang: "JS", color: "#f7df1e", tip: "Fetch API — makes an HTTP request and parses JSON response" },
  { code: "arr.filter(x => x % 2 === 0)", lang: "JS", color: "#f7df1e", tip: "Array filter — returns only even numbers from an array" },
  { code: "const [state, setState] = useState(0)", lang: "JS", color: "#f7df1e", tip: "React Hook — declares a state variable with initial value 0" },
  // Python
  { code: "def greet(name): return f'Hi {name}'", lang: "PY", color: "#3776ab", tip: "f-string — defines a function using formatted string interpolation" },
  { code: "nums = [x**2 for x in range(10)]", lang: "PY", color: "#3776ab", tip: "List comprehension — generates squares of 0–9 in one line" },
  { code: "with open('file.txt') as f:", lang: "PY", color: "#3776ab", tip: "Context manager — opens a file and auto-closes it when done" },
  { code: "print('Hello, World!')", lang: "PY", color: "#3776ab", tip: "Built-in print — outputs text to the console" },
  // TypeScript
  { code: "interface User { name: string; }", lang: "TS", color: "#3178c6", tip: "Interface — defines a type contract for a User object" },
  { code: "type Props = { onClick: () => void }", lang: "TS", color: "#3178c6", tip: "Type alias — describes a component's prop with a click handler" },
  { code: "const fn = <T>(arg: T): T => arg", lang: "TS", color: "#3178c6", tip: "Generic function — works with any type, returns same type as input" },
  // Java
  { code: 'System.out.println("Hello!");', lang: "JAVA", color: "#ed8b00", tip: "Standard output — prints a line to the console in Java" },
  { code: "List<String> list = new ArrayList<>();", lang: "JAVA", color: "#ed8b00", tip: "Generics — creates a type-safe dynamic list of strings" },
  { code: "public static void main(String[] args)", lang: "JAVA", color: "#ed8b00", tip: "Entry point — every Java program starts execution here" },
  // C
  { code: 'printf("Hello, World!\\n");', lang: "C", color: "#a8b9cc", tip: "printf — formatted output function from stdio.h" },
  { code: "int arr[5] = {1, 2, 3, 4, 5};", lang: "C", color: "#a8b9cc", tip: "Array declaration — fixed-size integer array with 5 elements" },
  { code: "malloc(sizeof(struct Node));", lang: "C", color: "#a8b9cc", tip: "Dynamic memory — allocates heap memory for a struct Node" },
  // C++
  { code: 'std::cout << "Hello" << std::endl;', lang: "C++", color: "#00599c", tip: "Stream output — prints to console using the C++ output stream" },
  { code: "vector<int> v = {1, 2, 3, 4, 5};", lang: "C++", color: "#00599c", tip: "STL vector — dynamic array that grows automatically" },
  { code: "auto lambda = [](int x) { return x*x; };", lang: "C++", color: "#00599c", tip: "Lambda — anonymous inline function that squares its input" },
];

function FloatingSnippet({ snippet, style }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked((prev) => !prev);
  };

  // Auto-close tooltip after 4 seconds
  useEffect(() => {
    if (!clicked) return;
    const t = setTimeout(() => setClicked(false), 4000);
    return () => clearTimeout(t);
  }, [clicked]);

  return (
    <div
      className="absolute select-none cursor-pointer"
      style={{
        ...style,
        animation: `floatUp ${style.duration}s linear infinite`,
        animationDelay: `${style.delay}s`,
        zIndex: hovered || clicked ? 20 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Tooltip */}
      {clicked && (
        <div
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 px-3 py-2 rounded-lg text-[11px] leading-relaxed font-sans z-30 pointer-events-none"
          style={{
            background: "rgba(13,13,24,0.95)",
            border: `1px solid ${snippet.color}40`,
            color: "rgba(255,255,255,0.75)",
            boxShadow: `0 0 20px ${snippet.color}20`,
            backdropFilter: "blur(12px)",
            animation: "tooltipIn 0.15s ease",
          }}
        >
          {/* Arrow */}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: `5px solid ${snippet.color}40`,
            }}
          />
          <span style={{ color: snippet.color }} className="font-mono font-bold text-[10px]">
            {snippet.lang}
          </span>
          <span className="text-white/30 mx-1">·</span>
          {snippet.tip}
        </div>
      )}

      {/* Snippet pill */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border whitespace-nowrap"
        style={{
          background: hovered || clicked ? `${snippet.color}25` : `${snippet.color}08`,
          borderColor: hovered || clicked ? `${snippet.color}60` : `${snippet.color}18`,
          boxShadow: hovered || clicked ? `0 0 16px ${snippet.color}30, 0 0 4px ${snippet.color}20` : "none",
          transform: hovered ? "scale(1.06)" : "scale(1)",
          transition: "all 0.2s ease",
        }}
      >
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded font-mono"
          style={{
            background: hovered || clicked ? `${snippet.color}40` : `${snippet.color}20`,
            color: snippet.color,
            transition: "background 0.2s ease",
          }}
        >
          {snippet.lang}
        </span>
        <span
          className="text-[11px] font-mono"
          style={{
            color: hovered || clicked ? snippet.color : `${snippet.color}70`,
            transition: "color 0.2s ease",
          }}
        >
          {snippet.code}
        </span>
        {/* Click hint on hover */}
        {hovered && !clicked && (
          <span className="text-[9px] ml-1" style={{ color: `${snippet.color}50` }}>click</span>
        )}
      </div>
    </div>
  );
}


export default function JoinRoom({ onJoin }) {
  const [roomId, setRoomId]           = useState("");
  const [username, setUsername]       = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [roomError, setRoomError]     = useState("");
  const [mounted, setMounted]         = useState(false);
  const [highlighted, setHighlighted] = useState(null);

  // Compute once at module level — no state needed
const SNIPPETS_DATA = Array.from({ length: 28 }, (_, i) => {
  const snippet = CODE_SNIPPETS[i % CODE_SNIPPETS.length];
  return {
    id: i,
    snippet,
    style: {
      left:     `${(i * 13.7 + (i * 7.3) % 15) % 95}%`,
      bottom:   `-${60 + (i * 11) % 40}px`,
      duration: 18 + (i * 1.3) % 20,
      delay:    -((i * 3.7) % 30),
      opacity:  0.4 + (i * 0.025) % 0.35,
    },
  };
});

// Inside component — only mounted state needed


useEffect(() => {
  setTimeout(() => setMounted(true), 50);
}, []);

  

  const validate = () => {
    let valid = true;
    setUsernameError("");
    setRoomError("");
    if (!username.trim()) {
      setUsernameError("Username is required.");
      valid = false;
    } else if (username.trim().replace(/[^a-zA-Z]/g, "").length < 6) {
      setUsernameError("Username must have at least 6 letters.");
      valid = false;
    }
    return valid;
  };

  const createRoom = () => {
    if (!validate()) return;
    onJoin(uuidv4(), username.trim());
  };

  const joinRoom = () => {
    if (!validate()) return;
    if (!roomId.trim()) { setRoomError("Please enter a Room ID to join."); return; }
    onJoin(roomId.trim(), username.trim());
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#07070f] text-white overflow-hidden">

      {/* CSS for float animation */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0px) translateX(0px);   opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-110vh) translateX(20px); opacity: 0; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.03; }
          50%       { opacity: 0.07; }
        }
        @keyframes floatUp {
    0%   { transform: translateY(0px) translateX(0px);   opacity: 0; }
    5%   { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-110vh) translateX(20px); opacity: 0; }
  }
  @keyframes floatUp {
    0%   { transform: translateY(0px) translateX(0px); opacity: 0; }
    5%   { opacity: 1; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(-110vh) translateX(20px); opacity: 0; }
  }
  @keyframes tooltipIn {
    from { opacity: 0; transform: translateX(-50%) translateY(4px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
      `}</style>

      {/* Grid background */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(97,218,251,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(97,218,251,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(97,218,251,0.04) 0%, transparent 70%)" }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(124,77,255,0.04) 0%, transparent 70%)" }} />

      {/* Floating code snippets — full screen */}
      {SNIPPETS_DATA.map((s) => (
  <FloatingSnippet
    key={s.id}
    id={s.id}
    snippet={s.snippet}
    style={s.style}
    highlighted={highlighted}
    onHighlight={setHighlighted}
  />
))}

      {/* ── Center Card ── */}
      <div className={`relative z-10 w-full max-w-md transition-all duration-700 px-4 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm text-white"
              style={{ background: "linear-gradient(135deg, #61dafb, #7c4dff)" }}>
              CC
            </div>
            <h1 className="text-4xl font-black tracking-tight" style={{
              background: "linear-gradient(90deg, #61dafb, #a78bfa, #61dafb)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              CollabCode
            </h1>
          </div>
          <p className="text-[10px] text-white/20 uppercase tracking-[3px]">Real-time collaborative IDE</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl p-8"
  style={{
    background: "rgba(13,13,24,0.85)",
    border: "1px solid rgba(97,218,251,0.12)",
    boxShadow: "0 0 40px rgba(97,218,251,0.06), inset 0 0 40px rgba(97,218,251,0.02)",
    backdropFilter: "blur(20px)",
  }}>

          {/* Username */}
          <div className="mb-4">
            <label className="text-[10px] text-white/25 uppercase tracking-[1.5px] block mb-1.5">Username</label>
            <input
              className={`w-full px-4 py-2.5 rounded-lg bg-[#13131e] text-white text-sm outline-none font-mono transition-all placeholder-white/15 ${
                usernameError
                  ? "border border-red-500/50"
                  : "border border-white/8 focus:border-[#61dafb]/40"
              }`}
              placeholder="Enter Username..."
              value={username}
              onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
              onKeyDown={(e) => e.key === "Enter" && createRoom()}
            />
            {usernameError && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1.5">
                 {usernameError}
              </p>
            )}
          </div>

          {/* Room ID */}
          <div className="mb-6">
            <label className="text-[10px] text-white/25 uppercase tracking-[1.5px] block mb-1.5">
              Room ID <span className="normal-case tracking-normal text-white/15 text-[9px]">(leave empty to create new)</span>
            </label>
            <input
              className={`w-full px-4 py-2.5 rounded-lg bg-[#13131e] text-white text-sm outline-none font-mono transition-all placeholder-white/15 ${
                roomError
                  ? "border border-red-500/50"
                  : "border border-white/8 focus:border-[#61dafb]/40"
              }`}
              placeholder="Paste room ID here..."
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value); setRoomError(""); }}
              onKeyDown={(e) => e.key === "Enter" && joinRoom()}
            />
            {roomError && (
              <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1.5">
                 {roomError}
              </p>
            )}
          </div>

          {/* Buttons */}
          <button
            onClick={createRoom}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-black mb-3 transition-all active:scale-[0.98] hover:opacity-90"
            style={{ background: "linear-gradient(90deg, #61dafb, #4fc8e8)" }}
          >
            ✦ Create New Room
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-[10px] text-white/15">or</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <button
            onClick={joinRoom}
            className="w-full py-2.5 rounded-lg font-bold text-sm text-[#61dafb] transition-all active:scale-[0.98] hover:bg-[#61dafb]/10"
            style={{ border: "1px solid rgba(97,218,251,0.2)", background: "rgba(97,218,251,0.04)" }}
          >
            → Join Existing Room
          </button>

          {/* Tech badges */}
          <div className="flex flex-wrap justify-center gap-1.5 mt-6 pt-5 border-t border-white/5">
            {[
              { name: "JavaScript", color: "#f7df1e" },
              { name: "Python",     color: "#3776ab" },
              { name: "TypeScript", color: "#3178c6" },
              { name: "Java",       color: "#ed8b00" },
              { name: "C",          color: "#a8b9cc" },
              { name: "C++",        color: "#00599c" },
            ].map((t) => (
              <span key={t.name}
                className="text-[9px] px-2 py-0.5 rounded font-mono"
                style={{ background: `${t.color}12`, color: `${t.color}80`, border: `0.5px solid ${t.color}25` }}
              >
                {t.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}