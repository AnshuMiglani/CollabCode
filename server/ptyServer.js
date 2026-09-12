const pty = require("node-pty");

module.exports = function setupPty(io) {
  // Map<roomId, { ptyProcess: any, clients: Set<string> }>
  const terminals = new Map();

  const getShell = () => {
    if (process.platform === "win32") {
      return process.env.COMSPEC || "powershell.exe";
    }
    return process.env.SHELL || "bash";
  };

  const getCwd = () => {
    return process.env.USERPROFILE || process.env.HOME || process.cwd();
  };

  io.on("connection", (socket) => {
    socket.on("terminal:start", ({ roomId }) => {
      if (!roomId) return;

      let term = terminals.get(roomId);

      if (!term) {
        try {
          const shell = getShell();
          const cwd = getCwd();

          const ptyProcess = pty.spawn(shell, [], {
            name: "xterm-256color",
            cols: 80,
            rows: 24,
            cwd: cwd,
            useConpty: false,
            env: { ...process.env, COLORTERM: "truecolor" },
          });

          term = {
            ptyProcess,
            clients: new Set(),
          };

          ptyProcess.onData((data) => {
            io.to(roomId).emit("terminal:data", data);
          });

          ptyProcess.onExit(() => {
            terminals.delete(roomId);
            io.to(roomId).emit("terminal:exit");
          });

          terminals.set(roomId, term);
        } catch (err) {
          console.error("Failed to spawn pty process:", err);
          socket.emit("terminal:data", `\r\n\x1b[31mTerminal initialization error: ${err.message}\x1b[0m\r\n`);
          return;
        }
      }

      term.clients.add(socket.id);
      socket.data.terminalRoomId = roomId;
    });

    socket.on("terminal:input", ({ roomId, input }) => {
      const term = terminals.get(roomId);
      if (term && term.ptyProcess) {
        try {
          term.ptyProcess.write(input);
        } catch (e) {
          console.error("Error writing to pty:", e);
        }
      }
    });

    socket.on("terminal:resize", ({ roomId, cols, rows }) => {
      const term = terminals.get(roomId);
      if (term && term.ptyProcess && cols && rows) {
        try {
          term.ptyProcess.resize(Math.max(10, cols), Math.max(5, rows));
        } catch (e) {
          // ignore resize errors
        }
      }
    });

    socket.on("terminal:restart", ({ roomId }) => {
      const term = terminals.get(roomId);
      if (term) {
        try {
          term.ptyProcess.kill();
        } catch (e) {}
        terminals.delete(roomId);
      }
      // Re-trigger start
      socket.emit("terminal:data", "\r\n\x1b[33mRestarting terminal session...\x1b[0m\r\n");
      setTimeout(() => {
        socket.emit("terminal:ready-for-start", { roomId });
      }, 300);
    });

    socket.on("disconnect", () => {
      const roomId = socket.data.terminalRoomId || socket.data.roomId;
      if (roomId && terminals.has(roomId)) {
        const term = terminals.get(roomId);
        term.clients.delete(socket.id);
        // Only kill terminal when NO participants remain in the room
        if (term.clients.size === 0) {
          try {
            term.ptyProcess.kill();
          } catch (e) {}
          terminals.delete(roomId);
        }
      }
    });
  });
};