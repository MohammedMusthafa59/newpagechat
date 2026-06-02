import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, ArrowRight, User, Hash, Sparkles } from "lucide-react";

interface LandingScreenProps {
  onCreateRoom: (name: string) => void;
  onJoinRoom: (name: string, code: string) => void;
  errorMsg: string | null;
  setErrorMsg: (err: string | null) => void;
}

export default function LandingScreen({
  onCreateRoom,
  onJoinRoom,
  errorMsg,
  setErrorMsg,
}: LandingScreenProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Name is required to create a chat room.");
      return;
    }
    setErrorMsg(null);
    onCreateRoom(name.trim());
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Name is required to join a chat room.");
      return;
    }
    if (!code.trim()) {
      setErrorMsg("Please enter a valid 6-char Room Code.");
      return;
    }
    setErrorMsg(null);
    onJoinRoom(name.trim(), code.trim().toUpperCase());
  };

  return (
    <div className="w-full max-w-md" id="landing-container">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-100/40 dark:shadow-none p-8"
        id="landing-card"
      >
        {/* Header Visual */}
        <div className="flex flex-col items-center text-center mb-8" id="landing-header">
          <div className="w-14 h-14 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            1-on-1 Chat Room
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 matches-sans">
            Connect instantly with a unique code. Private & real-time.
          </p>
        </div>

        {/* Universal Validation Error */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              className="mb-5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2"
              id="landing-err-alert"
            >
              <div className="w-1.5 h-1.5 bg-rose-600 dark:bg-rose-400 rounded-full shrink-0 animate-ping" />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Landing Flow Options */}
        <div className="space-y-6" id="landing-flow-forms">
          {/* Section 1: Enter Name (Required for both) */}
          <div className="relative" id="name-input-group">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Your Display Name
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                <User className="w-4.5 h-4.5" />
              </span>
              <input
                id="user-name-input"
                type="text"
                placeholder="e.g., Alex"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-sans"
                maxLength={20}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 my-6" />

          {/* Action Choice Button Panels */}
          <AnimatePresence mode="wait">
            {!isJoining ? (
              <motion.div
                key="menu-choices"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-3.5"
                id="choices-panel"
              >
                <button
                  id="create-room-btn"
                  onClick={handleCreate}
                  className="w-full flex items-center justify-between px-5 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-medium text-sm transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    Create New Room
                  </span>
                  <ArrowRight className="w-4.5 h-4.5 text-indigo-200" />
                </button>

                <button
                  id="toggle-join-mode-btn"
                  onClick={() => {
                    setErrorMsg(null);
                    setIsJoining(true);
                  }}
                  className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-2xl font-medium text-sm transition-all cursor-pointer"
                >
                  <span>Join Existing Room</span>
                  <ArrowRight className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="join-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleJoinSubmit}
                className="space-y-4"
                id="join-code-entry"
              >
                <div id="join-code-group">
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Room Code
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                      <Hash className="w-4.5 h-4.5" />
                    </span>
                    <input
                      id="room-code-input"
                      type="text"
                      placeholder="Enter 6-character code"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        if (errorMsg) setErrorMsg(null);
                      }}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-slate-100 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all font-sans uppercase"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2" id="join-actions">
                  <button
                    id="back-to-menu-btn"
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setIsJoining(false);
                    }}
                    className="py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 rounded-2xl text-xs font-semibold tracking-wide uppercase transition-all cursor-pointer text-center"
                  >
                    Go Back
                  </button>
                  <button
                    id="submit-join-btn"
                    type="submit"
                    className="py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold tracking-wide uppercase transition-all shadow-md shadow-indigo-600/15 cursor-pointer text-center"
                  >
                    Connect
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
