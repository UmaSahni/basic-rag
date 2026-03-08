"use client";

import { motion } from "framer-motion";
import { Bot, User, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function MessageBubble({ message }) {
    const isUser = message.role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
        >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 border ${!isUser
                ? "bg-white border-stone-200 text-stone-600"
                : "bg-stone-800 border-none text-white shadow-sm"
                }`}>
                {!isUser ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3.5 leading-relaxed text-[15px] ${isUser
                ? "bg-stone-100 text-stone-900 border border-stone-200"
                : "bg-white border border-stone-200 shadow-sm text-stone-800"
                }`}>
                {isUser ? (
                    message.text
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="prose prose-sm md:prose-base prose-stone max-w-none dark:prose-invert 
                        prose-p:leading-relaxed prose-pre:bg-stone-100 prose-pre:text-stone-800 
                        prose-a:text-blue-600 hover:prose-a:text-blue-500">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm, remarkMath]}
                                rehypePlugins={[rehypeKatex]}
                            >
                                {message.text}
                            </ReactMarkdown>
                        </div>

                        {message.source && (
                            <div className="mt-2 border-t border-stone-100 pt-3">
                                <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">Source Document</p>
                                <a
                                    href={`http://localhost:3001/uploads/${message.source.filename}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                                    title="Click to view original PDF document"
                                >
                                    <FileText size={16} className="text-emerald-500" />
                                    <span className="truncate max-w-[200px]">{message.source.filename || "View PDF Document"}</span>
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
