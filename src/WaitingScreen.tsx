import React, { useState } from "react";
import { Copy, Check, Loader2, User, ArrowLeft, Send } from "lucide-react";
import { motion } from "motion/react";

interface WaitingScreenProps {
  name: string;
  roomCode: string;
  onLeave: () => void;
}

export default function WaitingScreen({ name, roomCode, onLeave }: WaitingScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md flex flex-col min-h-[500px]" id="waiting-screen-container">
      {/* Upper header action */}
      <div className="flex items-center justify-between mb-4 w-full">
        <button
          id="waiting-leave-btn"
          onClick={onLeave}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Cancel
        </button>
        <span className="text-xs font-medium text-emerald-500 dark:text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Server Connected
        </span>
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-100/40 dark:shadow-none flex flex-col justify-between"
        id="waiting-card"
      >
        <div className="text-center pt-4" id="waiting-card-content">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
            Room Created!
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Waiting for a friend to join this safe zone
          </p>

          {/* User Name Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800" id="waiting-user-info">
            <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Host: {name}
            </span>
          </div>

          {/* Large Alphanumeric Room Code Visual */}
          <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-xs mx-auto" id="waiting-code-box">
            <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
              Room Invitation Code
            </span>
            <div className="text-3xl font-black font-mono tracking-wider text-slate-800 dark:text-slate-100 select-all mb-4">
              {roomCode}
            </div>

            {/* Copy Button */}
            <button
              id="copy-code-btn"
              onClick={handleCopy}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                copied
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/15"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Code Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Invitation Code
                </>
              )}
            </button>
          </div>

          {/* Connection queue alert spinner */}
          <div className="mt-8 flex flex-col items-center gap-2.5" id="waiting-spinner-zone">
            <Loader2 className="w-6 h-6 text-indigo-500 dark:text-indigo-400 animate-spin" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Waiting for your friend to join...
            </p>
          </div>
        </div>

        {/* BOTTOM: Visible but disabled chat input box */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800" id="waiting-disabled-footer">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-600 text-center mb-2.5">
            Active Chat Input (Locked)
          </p>
          <div className="flex gap-2 p-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 select-none opacity-50 cursor-not-allowed">
            <input
              id="waiting-disabled-input"
              type="text"
              placeholder="Chat input is locked until friend joins..."
              disabled
              className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-400 dark:text-slate-600 outline-none select-none cursor-not-allowed"
            />
            <button
              id="waiting-disabled-send-btn"
              disabled
              className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-xl cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
