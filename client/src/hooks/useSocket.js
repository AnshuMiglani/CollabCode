import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { getBackendUrl } from "../utils/backendUrl";

// Persistent socket instance across renders
let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const backendUrl = getBackendUrl();
    socketInstance = io(backendUrl, {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 30000,
    });
  }
  return socketInstance;
}

export default function useSocket({
  roomId,
  username,
  onSyncRoomState,
  onCodeUpdate,
  onRemoteCursorUpdate,
  onRemoteCursorRemove,
  onFileCreated,
  onFileRenamed,
  onFileDeleted,
  onChatMessage,
  onUserTyping,
  onParticipantsUpdate,
  onKicked,
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [selfColor, setSelfColor] = useState("#38bdf8");
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    const handleConnect = () => {
      setIsConnected(true);
      setConnectionStatus("connected");
      if (roomId && username) {
        socket.emit("join-room", roomId, username);
      }
    };

    const handleDisconnect = (reason) => {
      setIsConnected(false);
      setConnectionStatus(reason === "io client disconnect" ? "disconnected" : "reconnecting");
    };

    const handleConnectError = () => {
      setIsConnected(false);
      setConnectionStatus("reconnecting");
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.io.on("reconnect_attempt", () => setConnectionStatus("reconnecting"));

    // Synchronize full room
    socket.on("sync-room-state", (state) => {
      if (state.self?.color) {
        setSelfColor(state.self.color);
      }
      if (onSyncRoomState) onSyncRoomState(state);
    });

    // Code updates from peers
    socket.on("code-update", ({ fileName, code, updatedBy }) => {
      if (onCodeUpdate) onCodeUpdate({ fileName, code, updatedBy });
    });

    // Remote cursors
    socket.on("remote-cursor-update", (data) => {
      if (onRemoteCursorUpdate) onRemoteCursorUpdate(data);
    });

    socket.on("remote-cursor-remove", ({ socketId }) => {
      if (onRemoteCursorRemove) onRemoteCursorRemove(socketId);
    });

    // File operations
    socket.on("file-created", (data) => {
      if (onFileCreated) onFileCreated(data);
    });

    socket.on("file-renamed", (data) => {
      if (onFileRenamed) onFileRenamed(data);
    });

    socket.on("file-deleted", (data) => {
      if (onFileDeleted) onFileDeleted(data);
    });

    // Chat messages
    socket.on("chat-message", (msg) => {
      if (onChatMessage) onChatMessage(msg);
    });

    // Typing presence
    socket.on("user-typing-update", (data) => {
      if (onUserTyping) onUserTyping(data);
    });

    // Participants list
    socket.on("participants-update", (users) => {
      if (onParticipantsUpdate) onParticipantsUpdate(users);
    });

    // Kicked
    socket.on("kicked", () => {
      if (onKicked) {
        onKicked();
      } else {
        alert("You have been removed from this room by the host.");
        window.location.href = "/";
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("sync-room-state");
      socket.off("code-update");
      socket.off("remote-cursor-update");
      socket.off("remote-cursor-remove");
      socket.off("file-created");
      socket.off("file-renamed");
      socket.off("file-deleted");
      socket.off("chat-message");
      socket.off("user-typing-update");
      socket.off("participants-update");
      socket.off("kicked");
    };
  }, [roomId, username]);

  // Emitter functions
  const emitCodeChange = useCallback((fileName, code) => {
    if (!roomId || !fileName) return;
    socketRef.current.emit("code-change", { roomId, fileName, code });
  }, [roomId]);

  const emitCursorMove = useCallback((fileName, cursor, selection) => {
    if (!roomId || !fileName) return;
    socketRef.current.emit("cursor-move", { roomId, fileName, cursor, selection });
  }, [roomId]);

  const emitFileCreate = useCallback((file) => {
    if (!roomId || !file) return;
    socketRef.current.emit("file-create", { roomId, file });
  }, [roomId]);

  const emitFileRename = useCallback((oldName, newName, language) => {
    if (!roomId || !oldName || !newName) return;
    socketRef.current.emit("file-rename", { roomId, oldName, newName, language });
  }, [roomId]);

  const emitFileDelete = useCallback((fileName) => {
    if (!roomId || !fileName) return;
    socketRef.current.emit("file-delete", { roomId, fileName });
  }, [roomId]);

  const emitSendMessage = useCallback((text) => {
    if (!roomId || !text) return;
    socketRef.current.emit("send-chat-message", { roomId, text });
  }, [roomId]);

  const emitUserTyping = useCallback((fileName, isTyping) => {
    if (!roomId) return;
    socketRef.current.emit("user-typing", { roomId, fileName, isTyping });
  }, [roomId]);

  const emitKickUser = useCallback((targetUsername) => {
    if (!roomId || !targetUsername) return;
    socketRef.current.emit("kick-user", { roomId, username: targetUsername });
  }, [roomId]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    selfColor,
    emitCodeChange,
    emitCursorMove,
    emitFileCreate,
    emitFileRename,
    emitFileDelete,
    emitSendMessage,
    emitUserTyping,
    emitKickUser,
  };
}
