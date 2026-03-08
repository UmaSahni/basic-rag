"use client";

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register, logout, clearError as clearAuthError } from "../store/slices/authSlice";
import { uploadPdf, askQuestion, addMessage, clearError as clearChatError } from "../store/slices/chatSlice";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Send, FileText, Bot, User, Loader2, LogOut, Paperclip } from "lucide-react";

export default function Home() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token, loading: authLoading, error: authError } = useSelector((state) => state.auth);

  // Auth state
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLoginView) {
      await dispatch(login({ email, password }));
    } else {
      const res = await dispatch(register({ name, email, password }));
      if (!res.error) {
        // Auto switch to login view on success
        setIsLoginView(true);
        dispatch(clearAuthError());
      }
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 font-sans bg-stone-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
          className="w-full max-w-md p-8 bg-white border border-stone-200 shadow-xl rounded-2xl"
        >
          <div className="flex items-center justify-center mb-8 gap-2 text-stone-900">
            <Bot className="w-8 h-8 text-neutral-800" />
            <span className="text-2xl font-bold tracking-tight">QuestionAI</span>
          </div>

          <h2 className="mb-6 text-xl font-semibold text-center text-stone-800">
            {isLoginView ? "Welcome back" : "Create an account"}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLoginView && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-stone-600">Name</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-600">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-stone-600">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            {authError && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm text-red-500 font-medium pb-2">
                {authError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-2.5 mt-2 font-medium text-white transition-colors bg-stone-900 hover:bg-stone-800 rounded-lg flex justify-center items-center gap-2 disabled:bg-stone-600"
            >
              {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginView ? "Sign In" : "Sign Up")}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-stone-500">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLoginView(!isLoginView); dispatch(clearAuthError()); }}
              className="text-stone-900 hover:underline focus:outline-none font-medium"
            >
              {isLoginView ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    );
  }

  return <ChatInterface />;
}


function ChatInterface() {
  const dispatch = useDispatch();
  const { messages, isUploading, isAsking, error, uploadedFile } = useSelector((state) => state.chat);

  const [input, setInput] = useState("");
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isAsking) return;

    const userMsg = input.trim();
    setInput("");

    // Add User Message Optimistically
    dispatch(addMessage({
      id: Date.now(),
      role: "user",
      text: userMsg
    }));

    dispatch(askQuestion(userMsg));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    dispatch(uploadPdf(file));
    e.target.value = '';
  };

  return (
    <div className="flex flex-col h-screen bg-stone-50 font-sans">

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-10 hidden md:flex">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center">
            <Bot size={18} />
          </div>
          <span className="text-xl font-bold text-stone-900 tracking-tight">QuestionAI</span>
        </div>
        <button
          onClick={() => dispatch(logout())}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-stone-600 transition-colors rounded-md hover:bg-stone-100 hover:text-stone-900"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6">

        {messages.length === 1 && !uploadedFile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center mt-20"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-stone-400" />
            </div>
            <h1 className="text-3xl font-bold text-stone-800 mb-3 tracking-snug">Upload a Document</h1>
            <p className="text-stone-500 max-w-md">Our RAG connected AI will read your PDF so you can start asking questions right away.</p>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 border ${message.role === "ai"
                  ? "bg-white border-stone-200 text-stone-600"
                  : "bg-stone-800 border-none text-white shadow-sm"
                }`}>
                {message.role === "ai" ? <Bot size={18} /> : <User size={18} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 leading-relaxed text-[15px] ${message.role === "user"
                  ? "bg-stone-100 text-stone-900 border border-stone-200"
                  : "bg-white border border-stone-200 shadow-sm text-stone-800"
                }`}>
                {message.text}
              </div>
            </motion.div>
          ))}

          {(isAsking || isUploading) && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-full mt-1 border bg-white border-stone-200 flex items-center justify-center text-stone-500">
                <Loader2 size={16} className="animate-spin" />
              </div>
              <div className="max-w-[75%] rounded-2xl px-5 py-3.5 bg-white border border-stone-200 shadow-sm">
                {isUploading ? "Uploading & Indexing document..." : "Searching and generating response..."}
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-center my-2">
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg font-medium border border-red-100 flex items-center gap-2">
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Area */}
      <footer className="bg-gradient-to-t from-stone-50 via-stone-50 to-transparent pt-6 pb-6 px-4 shrink-0">
        <div className="max-w-3xl mx-auto flex flex-col gap-2 relative">

          {uploadedFile && (
            <div className="absolute -top-10 left-0 bg-stone-100 border border-stone-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs font-medium text-stone-600 shadow-sm">
              <FileText size={14} className="text-emerald-500" />
              {uploadedFile.filename || "Document uploaded"}
            </div>
          )}

          <div className="relative flex items-center bg-white border border-stone-200 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] focus-within:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.12)] focus-within:ring-1 focus-within:ring-stone-300 transition-all p-1">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="p-3 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors shrink-0 outline-none"
              title="Upload PDF Document"
            >
              <Paperclip size={20} />
            </button>

            <form onSubmit={handleSend} className="flex-1 flex items-center pr-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={uploadedFile ? "Ask me anything..." : "Upload a PDF first to ask questions..."}
                disabled={isAsking || isUploading}
                className="flex-1 px-2 py-3 bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none text-[15px] disabled:opacity-50 min-w-0"
              />
              <button
                type="submit"
                disabled={!input.trim() || isAsking || isUploading}
                className="p-2 ml-2 bg-stone-900 text-white hover:bg-stone-800 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed rounded-lg transition-colors shrink-0 flex items-center justify-center outline-none"
              >
                <Send size={18} className="translate-x-[1px]" />
              </button>
            </form>
          </div>
          <div className="text-center mt-2 text-xs text-stone-400 font-medium">
            QuestionAI can make mistakes. Verify important information.
          </div>
        </div>
      </footer>
    </div>
  );
}
