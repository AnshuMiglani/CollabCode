import { useState } from "react";
import JoinRoom from "./components/JoinRoom";
import Editor from "./components/Editor";

export default function App() {
  const [room, setRoom] = useState(null);
  const [username, setUsername] = useState("");

  const handleJoin = (roomId, name) => {
    setUsername(name);
    setRoom(roomId);
  };

  return room
    ? <Editor roomId={room} username={username} />
    : <JoinRoom onJoin={handleJoin} />;
}