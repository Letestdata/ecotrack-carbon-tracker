// ============================================================
// EcoTrack – AI Assistant Page (EcoBot)
// ============================================================

import { useState, useRef, useEffect, useId } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/Button';
import { generateAssistantResponse } from '../services/assistant';
import type { ChatMessage } from '../types';

// Quick-start prompts
const STARTER_PROMPTS = [
  'What\'s my carbon footprint?',
  'Give me a daily eco tip',
  'Compare me to global average',
  'How do I reach the Paris target?',
  'Transport tips',
  'Food tips',
  'Monthly summary',
  'What are my achievements?',
];

function formatContent(text: string): React.ReactNode {
  // Parse bold (**text**) and line breaks
  const lines = text.split('\n');
  return (
    <>
      {lines.map((line, li) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={li}>
            {parts.map((part, pi) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={pi}>{part.slice(2, -2)}</strong>;
              }
              return <span key={pi}>{part}</span>;
            })}
            {li < lines.length - 1 && <br />}
          </span>
        );
      })}
    </>
  );
}

interface MessageBubbleProps {
  msg: ChatMessage;
}

function MessageBubble({ msg }: MessageBubbleProps) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp).toLocaleTimeString('en', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}
      role="listitem"
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-white text-sm shrink-0 mt-1"
          aria-hidden="true"
        >
          🤖
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-green-600 text-white rounded-tr-sm'
              : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'
          }`}
        >
          {formatContent(msg.content)}
        </div>
        <span className="text-xs text-gray-400 px-1">{time}</span>
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center text-sm shrink-0 mt-1"
          aria-hidden="true"
        >
          👤
        </div>
      )}
    </div>
  );
}

export function Assistant() {
  const { state, addChatMessage, clearChat } = useApp();
  const { chatHistory, logs, profile, earnedAchievements } = state;
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  function generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput('');
    setIsTyping(true);

    // Simulate processing delay for realistic UX
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const response = generateAssistantResponse(trimmed, logs, profile, earnedAchievements);
    addChatMessage(response);
    setIsTyping(false);

    // Return focus to input
    inputRef.current?.focus();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <main
      id="main-content"
      className="flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-2rem)] pb-20 md:pb-0"
      aria-label="AI Assistant – EcoBot"
    >
      {/* ── Header ─── */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-xl" aria-hidden="true">
            🤖
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">EcoBot</h1>
            <p className="text-xs text-green-600 font-medium flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true" />
              Online · Carbon footprint assistant
            </p>
          </div>
        </div>
        {chatHistory.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            aria-label="Clear all chat messages"
          >
            🗑 Clear
          </Button>
        )}
      </div>

      {/* ── Messages area ─── */}
      <div
        className="flex-1 overflow-y-auto space-y-4 px-1 py-2 min-h-0"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        aria-relevant="additions"
      >
        {/* Welcome state */}
        {chatHistory.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <div className="text-5xl" aria-hidden="true">🌍</div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Hi! I'm EcoBot 👋</h2>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                Your AI-powered carbon footprint assistant. Ask me anything about reducing your environmental impact!
              </p>
            </div>

            {/* Starter prompts */}
            <div
              className="grid grid-cols-2 gap-2 max-w-sm mx-auto"
              role="group"
              aria-label="Quick-start conversation prompts"
            >
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  aria-label={`Ask: ${prompt}`}
                  className="text-left text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 hover:border-green-400 hover:bg-green-50 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 text-gray-700 font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        <ul className="space-y-4" role="list" aria-label="Conversation history">
          {chatHistory.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </ul>

        {/* Typing indicator */}
        {isTyping && (
          <div
            className="flex items-center gap-2"
            role="status"
            aria-label="EcoBot is typing"
          >
            <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center text-white text-sm shrink-0" aria-hidden="true">
              🤖
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 150}ms` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} aria-hidden="true" />
      </div>

      {/* ── Input area ─── */}
      <div className="shrink-0 mt-3">
        {/* Quick prompts (when chat has messages) */}
        {chatHistory.length > 0 && (
          <div
            className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
            role="group"
            aria-label="Quick reply suggestions"
          >
            {STARTER_PROMPTS.slice(0, 4).map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                disabled={isTyping}
                aria-label={`Quick reply: ${p}`}
                className="shrink-0 text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-green-100 hover:text-green-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex gap-2 mt-2"
          aria-label="Send a message to EcoBot"
        >
          <label htmlFor={inputId} className="sr-only">
            Message EcoBot
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your carbon footprint…"
            disabled={isTyping}
            aria-describedby="input-hint"
            maxLength={500}
            className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-50"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isTyping}
            loading={isTyping}
            aria-label="Send message"
            className="rounded-2xl px-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
              aria-hidden="true"
            >
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </Button>
        </form>
        <p id="input-hint" className="sr-only">
          Type your message and press Enter or click the send button.
        </p>
      </div>
    </main>
  );
}
