import { useEffect, useRef } from "react";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ["websocket"],
});
export default function useSocket({
  roomId, username, activeFile,
  onLoadCode, onCodeUpdate, onParticipantsUpdate,
}) {
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    socket.emit("join-room", roomId, username);

    socket.on("load-code", (code) => {
      isRemoteUpdate.current = true;
      onLoadCode(code);
    });

    socket.on("code-update", (code) => {
      isRemoteUpdate.current = true;
      onCodeUpdate(code);
    });
    socket.on("kicked", () => {
  alert("You have been removed from the room.");
  window.location.href = "/";
});

    socket.on("participants-update", onParticipantsUpdate);

    return () => {
      socket.off("load-code");
      socket.off("code-update");
      socket.off("participants-update");
    };
  }, [roomId, activeFile]);

  const emitCodeChange = (roomId, code) => {
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return false; // signal: don't update local state again
    }
    socket.emit("code-change", { roomId, code });
    return true;
  };

  const emitKickUser = (roomId, username) => {
    socket.emit("kick-user", { roomId, username });
  };

  return { emitCodeChange, emitKickUser };
}