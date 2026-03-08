"use client";

import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, Paperclip, FileText } from "lucide-react";
import { uploadPdf, askQuestion, addMessage } from "../../store/slices/chatSlice";

export default function ChatInput() {
    const dispatch = useDispatch();
    const { isUploading, isAsking, isIndexing, uploadedFile } = useSelector((state) => state.chat);

    const [input, setInput] = useState("");
    const fileInputRef = useRef(null);

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
        <footer className="w-full bg-gradient-to-t from-stone-50 via-stone-50 to-transparent pt-6 pb-6 px-4 shrink-0">
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
                            disabled={isAsking || isUploading || isIndexing}
                            className="flex-1 px-2 py-3 bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none text-[15px] disabled:opacity-50 min-w-0"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isAsking || isUploading || isIndexing}
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
    );
}
