import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function JoinRoom({ onJoin }) {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const createRoom = () => {
    const newRoomId = uuidv4();
    if (username.trim()) onJoin(newRoomId, username);
  };

  const joinRoom = () => {
    if (roomId.trim() && username.trim()) onJoin(roomId, username);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0f0f0f] text-white">
      <div className="flex items-center gap-3 mb-2">
  <img src="/cc.png" alt="logo" className="w-12 h-12 object-contain" />
  <h1 className="text-5xl font-bold text-[#61dafb]">CollabCode</h1>
</div>
      <p className="text-gray-500 mb-8 text-sm">Real-time collaborative code editor</p>

      <div className="flex flex-col gap-3 bg-[#1a1a1a] p-8 rounded-xl w-[360px] shadow-[0_0_30px_rgba(97,218,251,0.1)]">
        <input
          className="px-4 py-2 rounded-lg border border-[#333] bg-[#2a2a2a] text-white text-sm outline-none placeholder-gray-600 focus:border-[#61dafb] transition-colors"
          placeholder="Your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="px-4 py-2 rounded-lg border border-[#333] bg-[#2a2a2a] text-white text-sm outline-none placeholder-gray-600 focus:border-[#61dafb] transition-colors"
          placeholder="Room ID (leave empty to create new)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button
          className="py-2 rounded-lg bg-[#61dafb] text-black font-bold text-sm cursor-pointer hover:bg-[#4fc8e8] transition-colors"
          onClick={createRoom}
        >
          + Create New Room
        </button>
        <button
          className="py-2 rounded-lg border border-[#61dafb] bg-transparent text-[#61dafb] font-bold text-sm cursor-pointer hover:bg-[#61dafb]/10 transition-colors"
          onClick={joinRoom}
        >
          → Join Existing Room
        </button>
      </div>
    </div>
  );
}