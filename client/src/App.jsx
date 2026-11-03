import { useState, useEffect } from "react";
import JoinRoom from "./components/JoinRoom";
import Editor from "./components/Editor";
import { prewarmBackend } from "./utils/backendUrl";

export default function App() {
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState("");
  const [initialRoomId, setInitialRoomId] = useState("");

  useEffect(() => {
    // Warm up the Render backend as early as possible
    prewarmBackend();

    // Parse URL query parameter for direct room link (e.g. ?room=abc-123)
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room") || params.get("join");
    if (urlRoom) {
      setInitialRoomId(urlRoom);
    }

    // Check session storage for auto-reconnect on refresh
    const savedRoom = sessionStorage.getItem("collab_room");
    const savedUser = sessionStorage.getItem("collab_username");

    // If an explicit invite link room is in the URL and differs from savedRoom, prioritize invite
    if (urlRoom && savedRoom && urlRoom !== savedRoom) {
      sessionStorage.removeItem("collab_room");
      if (savedUser) setUsername(savedUser);
    } else if (savedRoom && savedUser) {
      setRoom(savedRoom);
      setUsername(savedUser);
    }
  }, []);

  const handleJoin = (roomId, name) => {
    setUsername(name);
    setRoom(roomId);
    sessionStorage.setItem("collab_room", roomId);
    sessionStorage.setItem("collab_username", name);

    // Update URL without page reload so it can be shared or bookmarked
    const newUrl = `${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
    window.history.pushState({ path: newUrl }, "", newUrl);
  };

  const handleLeave = () => {
    setRoom(null);
    sessionStorage.removeItem("collab_room");
    window.history.pushState({}, "", window.location.pathname);
  };

  return room ? (
    <Editor roomId={room} username={username} onLeaveRoom={handleLeave} />
  ) : (
    <JoinRoom onJoin={handleJoin} initialRoomId={initialRoomId} />
  );
}