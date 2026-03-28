"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion } from "framer-motion";
import { User, MessageSquare } from "lucide-react";
import { clsx } from "clsx";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const MessageBubble = ({ message, isStreaming }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        "flex w-full gap-4 mb-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={clsx(
          "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
          isUser 
            ? "bg-orange-500 text-white border-orange-400" 
            : "bg-white text-gray-600 border-gray-100"
        )}
      >
        {isUser ? <User size={20} /> : <MessageSquare size={20} />}
      </div>

      {/* Bubble */}
      <div
        className={clsx(
          "max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-[2rem] shadow-sm relative",
          isUser
            ? "bg-gray-900 text-white rounded-tr-none"
            : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
        )}
      >
        <div className="prose prose-sm max-w-none text-current overflow-x-auto">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
                table: ({node, ...props}) => (
                  <div className="overflow-x-auto my-4 -mx-2">
                    <table className="min-w-full border-collapse border border-zinc-200" {...props} />
                  </div>
                ),
                th: ({node, ...props}) => <th className="border border-zinc-200 bg-zinc-50 px-4 py-2 text-left font-bold" {...props} />,
                td: ({node, ...props}) => <td className="border border-zinc-200 px-4 py-2" {...props} />,
                p: ({node, ...props}) => <p className={clsx("leading-relaxed", isUser ? "text-white" : "text-gray-700")} {...props} />,
                code: ({node, ...props}) => (
                  <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-900 font-mono text-xs" {...props} />
                ),
                ul: ({node, ...props}) => <ul className="list-disc ml-5 my-2 space-y-1" {...props} />,
                ol: ({node, ...props}) => <ul className="list-decimal ml-5 my-2 space-y-1" {...props} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ 
                repeat: Infinity, 
                duration: 0.5,
                repeatType: "reverse",
                ease: "linear" 
              }}
              className="inline-block w-[2px] h-[1.1em] ml-1 bg-orange-500 rounded-full align-middle shadow-[0_0_8px_rgba(249,115,22,0.5)]"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};
