// app/search/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

import { useTheme } from "../lib/hooks/useTheme";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
import { alice, vastago } from "../fonts";

type Msg = { sender: "user" | "assistant"; text: string };

export default function SearchPage() {
  const { isDark, setIsDark } = useTheme();

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [needProfessors, setNeedProfessors] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // auto‑scroll when messages or loading change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Msg = { sender: "user", text: input };
    setMessages((m) => [...m, userMsg]);
    setLoading(true);

    // flatten current conversation for context
    const contextText = [...messages, userMsg]
      .map((m) => `${m.sender}: ${m.text}`)
      .join("\n");

    try {
      const res = await fetch("/api/supabase-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          context: contextText,
          needProfessors,
        }),
      });
      const { output } = await res.json();

      if (needProfessors) setNeedProfessors(false);
      setMessages((m) => [...m, { sender: "assistant", text: output }]);
    } catch (err) {
      console.error(err);
      setMessages((m) => [
        ...m,
        { sender: "assistant", text: "⚠️ Something went wrong." },
      ]);
    } finally {
      setInput("");
      setLoading(false);
    }
  };

  const startNew = () => {
    setMessages([]);
    setInput("");
    setNeedProfessors(true);
  };

  // SPLASH VIEW
  if (messages.length === 0) {
    return (
      <div
        className={`min-h-screen ${
          isDark ? "bg-[#1a1a1a] text-[#d1cfbf]" : "bg-[#e8e6d9] text-black"
        } ${alice.variable} ${vastago.variable} flex flex-col`}
      >
        <Navbar isDark={isDark} setIsDark={setIsDark} />

        <main className="w-full max-w-3xl mx-auto px-4 py-12 flex-grow">
          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-10 text-center ${
              isDark ? "text-[#d1cfbf]" : "text-gray-900"
            } font-alice`}
          >
            What are&nbsp;
            <span className="text-claude-orange italic underline">you</span>
            &nbsp;interested in?
          </h1>

          <div className="max-w-xl mx-auto">
            <PlaceholdersAndVanishInput
              placeholders={[
                "Search for research opportunities…",
                "Find professors to work with…",
                "Discover ongoing projects…",
              ]}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
        </main>

        <Footer isDark={isDark} />
      </div>
    );
  }

  // CHAT VIEW
  return (
    <div
      className={`flex flex-col h-screen ${
        isDark ? "bg-[#1a1a1a] text-[#d1cfbf]" : "bg-[#e8e6d9] text-black"
      } ${alice.variable} ${vastago.variable}`}
    >
      {/* centred column */}
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col">
  
        {/* ──────────────────────────────────────────────────────── */}
        {/* STICKY HEADER */}
        <div
          className={`sticky top-0 z-20 ${
            isDark ? "bg-[#1a1a1a]" : "bg-[#e8e6d9]"
          }`}
        >
          <Navbar isDark={isDark} setIsDark={setIsDark} />
        </div>
        {/* ──────────────────────────────────────────────────────── */}
  
        {/* message list */}
        <div
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-4 space-y-4"
        >
          {messages.map((m, i) =>
            m.sender === "user" ? (
              <div key={i} className="text-right">
                <span className="inline-block bg-claude-orange text-white px-4 py-2 rounded-xl max-w-[90%] break-words">
                  {m.text}
                </span>
              </div>
            ) : (
              <div
                key={i}
                className="prose prose-sm max-w-none dark:prose-invert"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                  {m.text}
                </ReactMarkdown>
              </div>
            )
          )}
  
          {loading && (
            <div className="flex justify-center text-gray-500 animate-pulse">
              <span>Thinking</span>
              <span className="mx-0.5">.</span>
              <span className="mx-0.5">.</span>
              <span className="mx-0.5">.</span>
            </div>
          )}
        </div>
  
        {/* ──────────────────────────────────────────────────────── */}
        {/* STICKY INPUT BAR */}
        <div
          className={`sticky bottom-0 z-20 border-t p-4 flex items-center gap-2 ${
            isDark ? "bg-[#1a1a1a]" : "bg-[#e8e6d9]"
          }`}
        >
          <div className="flex-1">
            <PlaceholdersAndVanishInput
              placeholders={["Type your question…"]}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              startNew();
              setNeedProfessors(true);
            }}
            className="text-xs underline text-gray-500 whitespace-nowrap"
          >
            New chat
          </button>
        </div>
        {/* ──────────────────────────────────────────────────────── */}
      </div>
    </div>
  );
}
