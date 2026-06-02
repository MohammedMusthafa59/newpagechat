import React, { useState, useEffect, useRef } from "react";
import { Send, LogOut, MessageSquare, AlertCircle, RefreshCw, Smile } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Room, Message } from "../types";

interface ChatScreenProps {
  socket: any; // SocketIOClient.Socket
  room: Room;
  ownId: string;
  isPartnerLeft: boolean;
  onLeaveRoom: () => void;
}

export default function ChatScreen({
  socket,
  room,
  ownId,
  isPartnerLeft,
  onLeaveRoom,
}: ChatScreenProps) {
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [room.messages, isPartnerLeft]);

  // Handle send message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    socket.emit("send-message", { text: inputText.trim() });
    setInputText("");
  };

  // Find friend info
  const partner = room.users.find((u) => u.id !== ownId);
  const ownUser = room.users.find((u) => u.id === ownId);
  const partnerName = partner ? partner.name : "Friend";
  const ownName = ownUser ? ownUser.name : "Me";

  return (
    <div className="w-full max-w-4xl h-[650px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl dark:shadow-none flex flex-col md:flex-row overflow-hidden" id="chat-screen-console">
      
      {/* SIDEBAR (Visible on medium screens and larger) */}
      <aside className="hidden md:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 flex-col gap-6" id="chat-sidebar">
        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-4">Room Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium font-sans">Status</span>
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${isPartnerLeft ? "text-amber-650 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10" : "text-green-600 bg-green-50 dark:text-green-450 dark:bg-green-500/10"}`}>
                {isPartnerLeft ? "Waiting" : "Active"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium font-sans">Capacity</span>
              <span className="text-xs font-mono font-semibold text-slate-600 dark:text-slate-400">
                {room.users.length} / 2 Users
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium font-sans">Invitation</span>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded">
                #{room.code}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800" />

        <div>
          <h3 className="text-[11px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-4">Participants</h3>
          <ul className="space-y-3">
            {room.users.map((user) => {
              const isMe = user.id === ownId;
              const isHost = user.id === room.users[0]?.id;
              return (
                <li key={user.id} className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {user.name} {isMe && <span className="text-slate-400 dark:text-slate-500 font-normal text-[10px]">(Me)</span>} {isHost && !isMe && <span className="text-slate-400 dark:text-slate-500 font-normal text-[10px]">(Host)</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-auto p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-bold uppercase mb-1.5 tracking-wider">End-To-End Security</p>
          <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-normal">
            All chats are ephemeral, lightweight, and secured via private WebSockets.
          </p>
        </div>
      </aside>

      {/* CHAT CONTENT STAGE */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {/* HEADER SECTION */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between" id="chat-header">
          <div className="flex items-center gap-3" id="chat-header-profile">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-550 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md text-sm select-none">
                {partnerName.slice(0, 2).toUpperCase()}
              </div>
              {/* Real-time status dot */}
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 transition-colors ${isPartnerLeft ? "bg-slate-350 dark:bg-slate-600 animate-none" : "bg-emerald-500 animate-pulse"}`} />
            </div>

            <div id="chat-header-meta">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {ownName} & {partnerName}
              </h3>
              <p className="text-xxs text-slate-400 dark:text-slate-500 tracking-wide font-medium capitalize">
                {isPartnerLeft ? "Partner left standard session" : `Session Code: ${room.code}`}
              </p>
            </div>
          </div>

          {/* Leave/Logout button */}
          <button
            id="chat-leave-btn"
            onClick={onLeaveRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/25 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Leave Room
          </button>
        </div>

      {/* DISCONNECTED PARTNER TOP BANNER NOTIFICATION */}
      <AnimatePresence>
        {isPartnerLeft && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-100 dark:border-amber-500/25 px-6 py-2.5 flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs"
            id="partner-disconnect-banner"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{partnerName} disconnected. Session is locked.</span>
            </span>
            <button
              id="return-menu-banner-btn"
              onClick={onLeaveRoom}
              className="text-[10px] uppercase font-bold tracking-wider hover:underline"
            >
              Back to Menu
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLLABLE MESSAGE TIMELINE AREA */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30 dark:bg-slate-900/10 custom-scrollbar" id="messages-container">
        {room.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-600" id="empty-messages-badge">
            <MessageSquare className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">No messages yet.</p>
            <p className="text-xxs max-w-xs mt-1">
              Your connection is secure and private. Say Hi! to start chatting.
            </p>
          </div>
        ) : (
          room.messages.map((msg: Message) => {
            // System Notification Bubble
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2" id={`sys-msg-${msg.id}`}>
                  <span className="inline-block px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-medium rounded-full shadow-sm text-center border border-slate-200/50 dark:border-slate-800">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isOwnMessage = msg.senderId === ownId;
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                id={`user-msg-${msg.id}`}
              >
                {/* Profile short indicator on Left-aligned messages */}
                {!isOwnMessage && (
                  <div className="w-7 h-7 shrink-0 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold text-xxs select-none">
                    {msg.senderName.slice(0, 1).toUpperCase()}
                  </div>
                )}

                <div className={`flex flex-col max-w-[75%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                  {/* Sender nickname label if from other */}
                  {!isOwnMessage && (
                    <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-0.5 ml-1">
                      {msg.senderName}
                    </span>
                  )}

                  {/* Text bubble */}
                  <div
                    className={`px-4.5 py-2.5 rounded-2xl text-sm shadow-sm leading-relaxed ${
                      isOwnMessage
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/80 rounded-tl-none"
                    }`}
                  >
                    <p className="break-all whitespace-pre-wrap">{msg.text}</p>
                  </div>

                  {/* Timestamp alignment below bubble */}
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 mx-1 font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER MESSAGE INPUT SECTION */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800" id="chat-footer-controls">
        <form onSubmit={handleSend} className="flex gap-2 items-center" id="message-send-form">
          <div className="flex-1 relative flex items-center">
            <input
              id="chat-message-input"
              type="text"
              placeholder={isPartnerLeft ? "Chatting is locked..." : "Type your message here..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isPartnerLeft}
              className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              maxLength={1000}
              autoComplete="off"
            />
            
            {/* Pure visual decor button (smile) */}
            <button
              id="emoji-decor-btn"
              type="button"
              disabled={isPartnerLeft}
              className="absolute right-3.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <button
            id="chat-submit-send-btn"
            type="submit"
            disabled={isPartnerLeft || !inputText.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 text-white rounded-2xl font-semibold transition-all shadow-md shadow-indigo-600/15 disabled:shadow-none cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </form>
      </div>
    </div>
  </div>
  );
}
