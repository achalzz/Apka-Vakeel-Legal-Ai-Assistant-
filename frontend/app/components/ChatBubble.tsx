"use client";

import { motion } from "framer-motion";

function formatAndParseMarkdown(text: string) {
  if (!text) return null;

  // Pre-process inline asterisks to be newlines
  // Matches a single asterisk (not part of double asterisks)
  let processedText = text.replace(/(?<!\*)\*(?!\*)\s+/g, "\n* ");
  
  // Also clean up any double newlines + bullet points
  processedText = processedText.replace(/\n\s*\n\s*\* /g, "\n* ");

  const lines = processedText.split("\n");
  const listItems: React.ReactNode[] = [];
  const elements: React.ReactNode[] = [];

  const flushList = (keyIndex: number) => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${keyIndex}`} className="list-dash list-inside ml-2 mb-3.5 space-y-1.5">
          {[...listItems]}
        </ul>
      );
      listItems.length = 0;
    }
  };

  lines.forEach((line, index) => {
    const isBullet = line.trim().startsWith("* ") || line.trim().startsWith("- ");
    let displayLine = line;
    if (isBullet) {
      displayLine = line.trim().substring(2);
    }

    // Parse bold text
    const parts = displayLine.split(/(\*\*.*?\*\*)/g);
    const parsedLine = parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-bold text-[var(--accent-cyan)]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    if (isBullet) {
      listItems.push(
        <li key={`li-${index}`} className="text-[0.88rem] leading-relaxed text-[var(--text-secondary)]">
          {parsedLine}
        </li>
      );
    } else {
      flushList(index);
      if (line.trim() === "") {
        elements.push(<div key={`space-${index}`} className="h-2" />);
      } else {
        elements.push(
          <p key={`p-${index}`} className="mb-2 text-[0.88rem] leading-relaxed last:mb-0 text-[var(--text-primary)]">
            {parsedLine}
          </p>
        );
      }
    }
  });

  flushList(lines.length);
  return elements;
}

interface ChatBubbleProps {
  role: "user" | "assistant";
  content: string;
  index: number;
}

export default function ChatBubble({ role, content, index }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.35,
        delay: Math.min(index * 0.05, 0.3),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-3 mt-1 text-xs font-bold shadow-[0_0_12px_rgba(34,211,238,0.2)]">
          ⚖
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-[0.9rem] leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md shadow-[0_4px_16px_rgba(59,130,246,0.2)]"
            : "glass text-[var(--text-primary)] rounded-bl-md"
        }`}
      >
        <div className="space-y-1">
          {formatAndParseMarkdown(content)}
        </div>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ml-3 mt-1 text-xs font-bold shadow-[0_0_12px_rgba(99,102,241,0.2)]">
          U
        </div>
      )}
    </motion.div>
  );
}
