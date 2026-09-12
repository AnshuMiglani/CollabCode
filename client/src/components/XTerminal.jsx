import { useEffect, useRef } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

export default function XTerminal({ socket, roomId }) {
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const fitAddonRef = useRef(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: "bar",
      fontSize: 12,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      lineHeight: 1.25,
      theme: {
        background: "#090b14",
        foreground: "#f1f5f9",
        cursor: "#38bdf8",
        selectionBackground: "rgba(56, 189, 248, 0.25)",
        black: "#1e2230",
        red: "#f43f5e",
        green: "#10b981",
        yellow: "#f59e0b",
        blue: "#38bdf8",
        magenta: "#a855f7",
        cyan: "#06b6d4",
        white: "#f8fafc",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);

    termInstance.current = term;
    fitAddonRef.current = fitAddon;

    // Safe fit function
    const safeFit = () => {
      try {
        const el = terminalRef.current;
        if (el && el.clientWidth > 30 && el.clientHeight > 30) {
          fitAddon.fit();
          if (term.cols > 0 && term.rows > 0) {
            socket.emit("terminal:resize", {
              roomId,
              cols: term.cols,
              rows: term.rows,
            });
          }
        }
      } catch (e) {}
    };

    // Initial fit with slight delay for container layout
    const timer = setTimeout(safeFit, 200);

    // Terminal data from server
    const handleData = (data) => {
      term.write(data);
    };

    socket.on("terminal:data", handleData);

    // Terminal input to server
    const dataDisposable = term.onData((data) => {
      socket.emit("terminal:input", {
        roomId,
        input: data,
      });
    });

    // Resize observer
    const resizeObserver = new ResizeObserver(() => {
      safeFit();
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    // Start terminal session on mount
    socket.emit("terminal:start", { roomId });

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      socket.off("terminal:data", handleData);
      dataDisposable.dispose();
      term.dispose();
    };
  }, [socket, roomId]);

  return (
    <div className="h-full w-full bg-[#090b14] p-2 overflow-hidden">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
}