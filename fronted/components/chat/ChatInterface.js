"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/slices/authSlice";
import { checkIndexStatus } from "../../store/slices/chatSlice";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Bot, Loader2, LogOut } from "lucide-react";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";

export default function ChatInterface() {
    const dispatch = useDispatch();
    const { messages, isUploading, isAsking, isIndexing, error, uploadedFile } = useSelector((state) => state.chat);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        let interval;
        if (isIndexing && uploadedFile?._id) {
            interval = setInterval(() => {
                dispatch(checkIndexStatus(uploadedFile._id));
            }, 2000); // Check every 2 seconds
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isIndexing, uploadedFile, dispatch]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-stone-50 font-sans">
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200 z-10 hidden md:flex shrink-0">
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
            <main className="flex-1 overflow-y-auto w-full min-h-0">
                <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 flex flex-col gap-6 w-full">
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
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        {(isAsking || isUploading || isIndexing) && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                                <div className="shrink-0 w-8 h-8 rounded-full mt-1 border bg-white border-stone-200 flex items-center justify-center text-stone-500">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                                <div className="max-w-[75%] rounded-2xl px-5 py-3.5 bg-white border border-stone-200 shadow-sm">
                                    {isUploading ? "Uploading document..." : isIndexing ? "Executing background AI Indexing..." : "Searching and generating response..."}
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
                    <div ref={messagesEndRef} className="h-4 shrink-0" />
                </div>
            </main>

            {/* Input Form Footer */}
            <ChatInput />
        </div>
    );
}
