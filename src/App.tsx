import React, { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

import LandingScreen from "./LandingScreen";
import WaitingScreen from "./WaitingScreen";
import ChatScreen from "./ChatScreen";
import ThemeToggle from "./ThemeToggle";

import { Room, ChatScreenState } from "./types";
import { MessageSquareCode, Sparkles } from "lucide-react";

export default function App() {
  const [screen, setScreen] = useState<ChatScreenState>("landing");
  const [userName, setUserName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isPartnerLeft, setIsPartnerLeft] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ownId, setOwnId] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  // Theme support
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("chat-theme");
    return saved ? saved === "dark" : true; // Standardize on modern dark default
  });

  useEffect(() => {
    localStorage.setItem("chat-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Clean socket connections on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  // Listeners registration whenever socket instance changes
  useEffect(() => {
    if (!socket) return;

    // Capture standard socket connection details
    socket.on("connect", () => {
      console.log(`Socket connection ready: ${socket.id}`);
      setOwnId(socket.id || "");
    });

    socket.on("room-created", ({ code, room }: { code: string; room: Room }) => {
      setRoomCode(code);
      setCurrentRoom(room);
      setScreen("waiting");
      setErrorMsg(null);
    });

    socket.on("room-joined", ({ code, room }: { code: string; room: Room }) => {
      setRoomCode(code);
      setCurrentRoom(room);
      setErrorMsg(null);
    });

    socket.on("room-updated", ({ room }: { room: Room }) => {
      setCurrentRoom(room);
      setIsPartnerLeft(false);
      setScreen("active");
    });

    // Handle message receipts with duplicate key guard for idempotency
    socket.on("message-received", (message: any) => {
      setCurrentRoom((prevRoom) => {
        if (!prevRoom) return prevRoom;
        
        const exists = prevRoom.messages.some((m) => m.id === message.id);
        if (exists) return prevRoom;

        return {
          ...prevRoom,
          messages: [...prevRoom.messages, message],
        };
      });
    });

    // Notify whenever other user terminates session or exits
    socket.on("user-left", ({ name, room }: { name: string; room: Room }) => {
      setIsPartnerLeft(true);
      setCurrentRoom(room);
    });

    socket.on("join-error", (msg: string) => {
      setErrorMsg(msg);
      socket.disconnect();
      setSocket(null);
    });

    socket.on("room-error", (msg: string) => {
      setErrorMsg(msg);
      socket.disconnect();
      setSocket(null);
    });

    return () => {
      socket.off("connect");
      socket.off("room-created");
      socket.off("room-joined");
      socket.off("room-updated");
      socket.off("message-received");
      socket.off("user-left");
      socket.off("join-error");
      socket.off("room-error");
    };
  }, [socket]);

  // Lazy instantiate socket.io when creating a room
  const handleCreateRoom = (name: string) => {
    setUserName(name);
    // Explicitly connect to host domain/port relatively
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit("create-room", { name });
  };

  // Lazy instantiate socket.io when joining a room
  const handleJoinRoom = (name: string, code: string) => {
    setUserName(name);
    setRoomCode(code);
    const newSocket = io();
    setSocket(newSocket);
    newSocket.emit("join-room", { name, code });
  };

  // Gracefully terminate active session and return back to choices
  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leave-room");
      socket.disconnect();
    }
    setSocket(null);
    setScreen("landing");
    setCurrentRoom(null);
    setRoomCode("");
    setIsPartnerLeft(false);
    setErrorMsg(null);
    setOwnId("");
  };

  return (
    <div className={`w-full min-h-screen transition-all duration-300 ${darkMode ? "dark bg-slate-950" : "bg-slate-50"}`} id="root-theme-wrapper">
      {/* Top Navbar / Branding Panel */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" id="app-branding-header">
        <div className="flex items-center gap-2" id="logo-block">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/10">
            <MessageSquareCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-none">
              Pristine
            </h2>
            <span className="text-[10px] text-slate-500 dark:text-slate-500 font-medium whitespace-nowrap">
              Secure 1-on-1 Chat
            </span>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3" id="header-widgets">
          <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        </div>
      </header>

      {/* Main Container Stage */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-center min-h-[calc(100vh-140px)]" id="page-grid-stage">
        {screen === "landing" && (
          <LandingScreen
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            errorMsg={errorMsg}
            setErrorMsg={setErrorMsg}
          />
        )}

        {screen === "waiting" && (
          <WaitingScreen
            name={userName}
            roomCode={roomCode}
            onLeave={handleLeaveRoom}
          />
        )}

        {screen === "active" && currentRoom && (
          <ChatScreen
            socket={socket}
            room={currentRoom}
            ownId={ownId}
            isPartnerLeft={isPartnerLeft}
            onLeaveRoom={handleLeaveRoom}
          />
        )}
      </main>

      {/* Humble Footer */}
      <footer className="w-full text-center py-4 text-[11px] text-slate-400 dark:text-slate-600 tracking-wide font-medium" id="app-footer">
        1-on-1 Chat app — Built with React & Socket.io
      </footer>
    </div>
  );
}
