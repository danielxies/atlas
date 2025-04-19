"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "../lib/hooks/useTheme";
import Navbar from "../components/shared/Navbar";
import { cn } from "@/lib/utils";
import { alice, vastago } from "../fonts";
import { 
  Search, 
  ArrowUp, 
  Mic, 
  Globe, 
  Paperclip,
  ThumbsUp, 
  ThumbsDown, 
  Copy, 
  RotateCcw,
  PlusCircle,
  LayoutGrid,
  ArrowLeft
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
}

export default function ChatPage() {
  const { isDark, setIsDark } = useTheme();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [inChatMode, setInChatMode] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "Research opportunities in machine learning"
    },
    {
      id: "2",
      title: "Graphic design research at Purdue"
    },
    {
      id: "3",
      title: "Biotechnology research areas"
    },
    {
      id: "4",
      title: "Computer science professor recommendations"
    },
    {
      id: "5",
      title: "Research funding opportunities"
    }
  ]);
  
  const [searchSuggestion, setSearchSuggestion] = useState("");
  const searchSuggestions = [
    "I want to do graphics research at Purdue...",
    "Help me find computer science professors...",
    "What are the biotech research opportunities...",
    "I'm interested in quantum computing research...",
    "Can you recommend professors for AI research..."
  ];
  
  const conversationsContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Research-focused suggested questions
  const suggestedQuestions = [
    "How can I find research opportunities in machine learning?",
    "Which professors at Purdue work on graphic design research?",
    "What research areas are available in biotechnology?",
    "How do I approach professors about research collaborations?"
  ];

  // Load saved query from localStorage on initial render
  useEffect(() => {
    const savedQuery = localStorage.getItem('chatQuery');
    if (savedQuery) {
      setQuery(savedQuery);
    }
    
    const savedChatMode = localStorage.getItem('inChatMode');
    if (savedChatMode === 'true') {
      setInChatMode(true);
    }
  }, []);
  
  // Save query to localStorage whenever it changes in chat mode
  useEffect(() => {
    if (inChatMode) {
      localStorage.setItem('chatQuery', query);
      localStorage.setItem('inChatMode', 'true');
    }
  }, [query, inChatMode]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);
  
  // Effect for rotating search suggestions with animation
  useEffect(() => {
    // Only run the search suggestion animation if not in chat mode
    if (inChatMode) return;
    
    const interval = setInterval(() => {
      // Add a class to trigger fade-out animation
      if (inputRef.current) {
        inputRef.current.classList.add('placeholder-fade-out');
      }
      
      // Set new suggestion after fade-out animation completes
      setTimeout(() => {
        setSearchSuggestion(prev => {
          const currentIndex = searchSuggestions.indexOf(prev);
          const nextIndex = (currentIndex + 1) % searchSuggestions.length;
          return searchSuggestions[nextIndex];
        });
        
        // Add class to trigger fade-in animation and remove fade-out class
        if (inputRef.current) {
          inputRef.current.classList.remove('placeholder-fade-out');
          inputRef.current.classList.add('placeholder-fade-in');
          
          // Remove the fade-in class after animation completes
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.classList.remove('placeholder-fade-in');
            }
          }, 500);
        }
      }, 500); // Time for fade-out animation
    }, 3000);
    
    // Initialize with first suggestion
    if (!searchSuggestion) {
      setSearchSuggestion(searchSuggestions[0]);
    }
    
    return () => clearInterval(interval);
  }, [searchSuggestion, inChatMode, searchSuggestions]);
  
  // Setup smooth scrolling for conversations
  useEffect(() => {
    const container = conversationsContainerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const containerHeight = container.clientHeight;
      const itemHeight = containerHeight / 3; // Height of each visible item
      
      const scrollAmount = e.deltaY > 0 ? itemHeight : -itemHeight;
      const targetScrollTop = container.scrollTop + scrollAmount;
      
      // Round to nearest item boundary to avoid cutting off items
      const roundedScrollTop = Math.round(targetScrollTop / itemHeight) * itemHeight;
      
      container.scrollTo({
        top: roundedScrollTop,
        behavior: 'smooth'
      });
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const simulateStreaming = async (content: string) => {
    setStreaming(true);
    setStreamedResponse("");
    
    const words = content.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (i > 0) {
        setStreamedResponse(prev => prev + " " + words[i]);
      } else {
        setStreamedResponse(words[i]);
      }
      // Random delay between 10-30ms per word for natural typing effect
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
    }
    
    setStreaming(false);
    
    // Add the complete response to messages after streaming is done
    const assistantMessage: Message = {
      role: "assistant",
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setStreamedResponse("");
  };

  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;
    
    // Enter chat mode if we're not already in it
    setInChatMode(true);
    
    const userMessage: Message = {
      role: "user",
      content: questionText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setLoading(true);
    
    try {
      // First conversation or continuation
      const needProfessors = messages.length === 0;
      
      const response = await fetch("/api/supabase-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: questionText,
          context: context,
          needProfessors: needProfessors
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update context for follow-up questions
      if (needProfessors && data.professors) {
        // Add first response to context
        const newContext = `
User: ${questionText}

AI: ${data.output}
        `.trim();
        setContext(newContext);
      } else {
        // Add to existing context
        const newContext = `
${context}

User: ${questionText}

AI: ${data.output}
        `.trim();
        setContext(newContext);
      }
      
      // Use simulated streaming for the response
      await simulateStreaming(data.output);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAskQuestion(query);
  };

  const resetChat = () => {
    setMessages([]);
    setContext("");
    setInChatMode(false);
    setQuery("");
    localStorage.removeItem('chatQuery');
    localStorage.removeItem('inChatMode');
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-[#e8e6d9] text-black'} font-vastago ${vastago.variable} overflow-hidden text-sm`}>
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {!inChatMode ? (
          /* Perplexity-like initial view with centered search */
          <div className="max-w-4xl mx-auto px-4 w-full flex flex-col items-center justify-center h-full overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">
              What do you want to know?
            </h1>
            
            <div className="w-full overflow-hidden">
              <form onSubmit={handleSubmit} className="relative mb-10">
                <div className={`flex items-center p-4 border rounded-xl ${
                  isDark 
                    ? 'bg-[#2a2a2a] border-gray-700' 
                    : 'bg-[#f5f3e6] border-gray-300'
                }`}>
                  <input
                    type="text"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchSuggestion}
                    className={`w-full bg-transparent border-none focus:outline-none text-base font-vastago ${
                      isDark ? 'text-white placeholder:text-gray-400' : 'text-black placeholder:text-gray-500'
                    }`}
                  />
                  
                  <div className="flex items-center gap-2 ml-2">
                    <button type="button" className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
                      <Globe size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                    <button type="button" className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
                      <Paperclip size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                    <button type="button" className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}>
                      <Mic size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    </button>
                    <button
                      type="submit"
                      disabled={!query.trim()}
                      className={`ml-2 p-3 rounded-lg flex items-center justify-center ${
                        query.trim() 
                          ? 'bg-claude-orange hover:bg-claude-orange/90' 
                          : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Search size={16} className="text-white" />
                    </button>
                  </div>
                </div>
                
                <div className="flex mt-4 gap-2 justify-center">
                  <button type="button" className={`px-3 py-1.5 rounded-full text-xs ${isDark ? 'bg-[#2a2a2a] text-gray-300 border border-gray-700' : 'bg-[#f5f3e6] text-gray-600 border border-gray-300'}`}>
                    <div className="flex items-center gap-2">
                      <Search size={12} />
                      <span>Search</span>
                    </div>
                  </button>
                </div>
              </form>
              
              {/* Recent conversations container with blur effect */}
              <div className="relative">
                <div 
                  ref={conversationsContainerRef}
                  className="flex flex-col gap-2 mb-12 h-36 overflow-y-auto custom-scrollbar hide-scrollbar snap-y snap-mandatory"
                >
                  {conversations.map(convo => (
                    <div 
                      key={convo.id}
                      onClick={() => {
                        setInChatMode(true);
                        // You can optionally load conversation data here
                      }}
                      className={`p-2 rounded-lg cursor-pointer flex items-center transition-colors duration-200 ${
                        isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white' : 'bg-[#f5f3e6] hover:bg-[#eae8db] text-black'
                      }`}
                    >
                      <p className="font-medium truncate text-sm">{convo.title}</p>
                    </div>
                  ))}
                </div>
                
                {/* Bottom blur gradient only */}
                <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none z-10" 
                  style={{
                    background: isDark 
                      ? 'linear-gradient(to top, rgba(26, 26, 26, 1), rgba(26, 26, 26, 0))' 
                      : 'linear-gradient(to top, rgba(232, 230, 217, 1), rgba(232, 230, 217, 0))'
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Claude-like chat view once conversation starts */
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 py-6 overflow-hidden">
            {/* Chat messages with more space */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}
                >
                  {message.role === "assistant" && (
                    <div className={`w-7 h-7 rounded-full mr-3 overflow-hidden bg-claude-orange flex-shrink-0 flex items-center justify-center text-white`}>
                      <div className="flex items-center justify-center">
                        {/* Orange dot animation like in layout.tsx */}
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className={`${message.role === "user" ? "max-w-[80%]" : "max-w-[90%]"} ${
                      message.role === "user" 
                        ? isDark 
                          ? "bg-claude-orange text-white" 
                          : "bg-claude-orange text-white"
                        : isDark 
                          ? "bg-[#2a2a2a] text-white" 
                          : "bg-[#f5f3e6] text-black"
                    } rounded-lg p-4`}
                  >
                    {message.role === "assistant" ? (
                      <div className={`prose prose-sm max-w-none font-vastago ${isDark ? 'text-white prose-invert' : 'text-black'}`}>
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
                        <button className={`p-1 rounded hover:bg-gray-700`}>
                          <Copy size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                        </button>
                        <button className={`p-1 rounded hover:bg-gray-700`}>
                          <ThumbsUp size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                        </button>
                        <button className={`p-1 rounded hover:bg-gray-700`}>
                          <ThumbsDown size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                        </button>
                        <button className={`p-1 rounded hover:bg-gray-700`}>
                          <RotateCcw size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                        </button>
                        <span className={`text-xs ml-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Atlas can make mistakes. Please double-check responses.
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {message.role === "user" && (
                    <div className={`w-7 h-7 rounded-full ml-3 overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center text-white`}>
                      D
                    </div>
                  )}
                </div>
              ))}
              
              {/* Streaming response */}
              {streaming && (
                <div className="flex justify-start w-full">
                  <div className={`w-7 h-7 rounded-full mr-3 overflow-hidden bg-claude-orange flex-shrink-0 flex items-center justify-center text-white`}>
                    <div className="flex items-center justify-center">
                      {/* Orange dot animation like in layout.tsx */}
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  <div className={`max-w-[90%] ${
                    isDark 
                      ? "bg-[#2a2a2a] text-white" 
                      : "bg-[#f5f3e6] text-black"
                  } rounded-lg p-4`}
                  >
                    <div className={`prose prose-sm max-w-none font-vastago ${isDark ? 'text-white prose-invert' : 'text-black'}`}>
                      <ReactMarkdown>
                        {streamedResponse}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading dots */}
              {loading && !streaming && (
                <div className="flex justify-start">
                  <div className={`w-7 h-7 rounded-full mr-3 overflow-hidden bg-claude-orange flex-shrink-0 flex items-center justify-center text-white`}>
                    <div className="flex items-center justify-center">
                      {/* Orange dot animation like in layout.tsx */}
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  
                  <div className={`max-w-[90%] ${
                    isDark 
                      ? "bg-[#2a2a2a]" 
                      : "bg-[#f5f3e6]"
                  } rounded-lg p-4`}
                  >
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-claude-orange animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-claude-orange animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-claude-orange animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat input */}
            <div className="sticky bottom-0 z-10 bg-inherit pt-2">
              <form onSubmit={handleSubmit} className="relative">
                <div className={`flex items-center p-3 border rounded-xl ${
                  isDark 
                    ? 'bg-[#2a2a2a] border-gray-700' 
                    : 'bg-[#f5f3e6] border-gray-300'
                }`}>
                  <input
                    type="text"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Reply to Atlas..."
                    className={`w-full bg-transparent border-none focus:outline-none font-vastago ${
                      isDark ? 'text-white' : 'text-black'
                    }`}
                  />
                  
                  <div className="flex items-center gap-2 ml-2">
                    <button 
                      type="submit"
                      disabled={!query.trim() || loading}
                      className={`p-2 rounded-full ${
                        query.trim() && !loading
                          ? 'bg-claude-orange hover:bg-claude-orange/90 text-white' 
                          : isDark 
                            ? 'bg-gray-800 text-gray-500' 
                            : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <ArrowUp size={16} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Alternative back button */}
              <div className="flex justify-center mt-4">
                <button 
                  onClick={resetChat}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                    isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300' : 'bg-[#f5f3e6] hover:bg-[#eae8db] text-gray-700'
                  }`}
                >
                  <ArrowLeft size={14} />
                  <span>Back to Search</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Add global styles for custom scrollbars */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'};
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Placeholder animation styles */
        .placeholder-fade-out::placeholder {
          opacity: 0;
          filter: blur(4px);
          transform: translateY(5px);
          transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
        }
        
        .placeholder-fade-in::placeholder {
          opacity: 1;
          filter: blur(0);
          transform: translateY(0);
          transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
        }
        
        input::placeholder {
          transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease;
        }
      `}</style>
    </div>
  );
}

/*
INSTRUCTIONS FOR API ROUTE IMPLEMENTATION:

To implement the supabase-search API route:

1. Create file: app/api/supabase-search/route.ts
2. Required environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - OPENAI_API_KEY

3. Set up the Supabase database:
   - Create a 'professors' table with fields:
     - name (text)
     - department (text)
     - research_areas (text[] or text)
     - preferred_majors (text[] or text)
     - research_description (text)
     - profile_link (text)
     - embedding (vector)

4. Create a stored function in Supabase called 'match_professors':
   ```sql
   create or replace function match_professors(vector_query vector, match_limit int)
   returns setof professors as $$
     select *, embedding <-> vector_query as distance
     from professors
     order by embedding <-> vector_query
     limit match_limit;
   $$ language sql;
   ```

5. API logic should:
   - Accept POST requests with JSON body: { query: string, context?: string, needProfessors?: boolean }
   - If needProfessors is false, use OpenAI to continue conversation from context
   - If needProfessors is true:
     a. Convert query to embedding using OpenAI
     b. Use Supabase RPC to find matching professors
     c. Generate response with professor recommendations 

6. Return JSON: { output: string, professors?: any[] }
*/ 