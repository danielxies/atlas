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

// Interface matching the API and DB structure
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string; // Use string to match JSON/API
}

// Interface for conversation list items
interface ConversationSummary {
  id: string;
  name: string; // Renamed from title to match DB/API
  updated_at: string;
}

// Interface for a newly created conversation from the API
interface Conversation extends ConversationSummary {
  messages: Message[];
}

export default function ChatPage() {
  const { isDark, setIsDark } = useTheme();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");
  const [inChatMode, setInChatMode] = useState(false);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]); // Use ConversationSummary
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

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

  // Research-focused suggested questions (can still be used)
  const suggestedQuestions = [
    "How can I find research opportunities in machine learning?",
    "Which professors at Purdue work on graphic design research?",
    "What research areas are available in biotechnology?",
    "How do I approach professors about research collaborations?"
  ];

  // Fetch conversations on initial load
  useEffect(() => {
    const fetchConversations = async () => {
      setLoadingConversations(true);
      setApiError(null);
      try {
        const response = await fetch('/api/conversations');
        if (!response.ok) {
          throw new Error(`Failed to fetch conversations: ${response.statusText}`);
        }
        const data: ConversationSummary[] = await response.json();
        setConversations(data);
      } catch (error: any) {
        console.error("Error fetching conversations:", error);
        setApiError(error.message || "Failed to load conversations.");
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []); // Runs once on mount

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]); // Clear messages if no conversation is selected
      return;
    }

    const fetchMessages = async () => {
      setLoadingMessages(true);
      setApiError(null);
      try {
        const response = await fetch(`/api/conversations/${currentConversationId}/messages`);
        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }
        const data: Message[] = await response.json();
        setMessages(data);
      } catch (error: any) {
        console.error("Error fetching messages:", error);
        setApiError(error.message || "Failed to load messages.");
        setMessages([]); // Clear messages on error
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [currentConversationId]); // Runs when currentConversationId changes

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedResponse]);
  
  // Effect for rotating search suggestions (unchanged, runs only when !inChatMode)
  useEffect(() => {
    if (inChatMode) return;
    
    const interval = setInterval(() => {
      if (inputRef.current) {
        inputRef.current.classList.add('placeholder-fade-out');
      }
      
      setTimeout(() => {
        setSearchSuggestion(prev => {
          const currentIndex = searchSuggestions.indexOf(prev);
          const nextIndex = (currentIndex + 1) % searchSuggestions.length;
          return searchSuggestions[nextIndex];
        });
        
        if (inputRef.current) {
          inputRef.current.classList.remove('placeholder-fade-out');
          inputRef.current.classList.add('placeholder-fade-in');
          
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.classList.remove('placeholder-fade-in');
            }
          }, 500);
        }
      }, 500);
    }, 3000);
    
    if (!searchSuggestion) {
      setSearchSuggestion(searchSuggestions[0]);
    }
    
    return () => clearInterval(interval);
  }, [searchSuggestion, inChatMode, searchSuggestions]); // Keep this dependency array
  
  // Smooth scrolling for conversations (unchanged)
  useEffect(() => {
    const container = conversationsContainerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const containerHeight = container.clientHeight;
      const itemHeight = containerHeight / 3;
      const scrollAmount = e.deltaY > 0 ? itemHeight : -itemHeight;
      const targetScrollTop = container.scrollTop + scrollAmount;
      const roundedScrollTop = Math.round(targetScrollTop / itemHeight) * itemHeight;
      container.scrollTo({ top: roundedScrollTop, behavior: 'smooth' });
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => { container.removeEventListener('wheel', handleWheel); };
  }, []); // Keep this

  // Helper function to save a message to the backend
  const saveMessage = async (conversationId: string, message: Message) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save message: ${response.statusText}`);
      }
      // Optionally update local state optimistically or refetch, 
      // but simulateStreaming already adds the assistant message locally.
      // For user messages, handleAskQuestion adds it locally.
    } catch (error: any) {
      console.error("Error saving message:", error);
      setApiError(error.message || "Failed to save message.");
      // Handle message saving failure (e.g., show error to user, revert optimistic update)
    }
  };

  // Modified simulateStreaming to save the final message
  const simulateStreaming = async (content: string, convId: string) => {
    setStreaming(true);
    setStreamedResponse("");
    
    const words = content.split(" ");
    for (let i = 0; i < words.length; i++) {
      setStreamedResponse(prev => prev + (i > 0 ? " " : "") + words[i]);
      await new Promise(resolve => setTimeout(resolve, Math.random() * 20 + 10));
    }
    
    setStreaming(false);
    
    const assistantMessage: Message = {
      role: "assistant",
      content,
      timestamp: new Date().toISOString() // Use ISO string
    };
    
    // Add the complete response locally AND save to backend
    setMessages(prev => [...prev, assistantMessage]);
    await saveMessage(convId, assistantMessage); 
    
    setStreamedResponse("");
  };

  // Refactored handleAskQuestion to use API routes
  const handleAskQuestion = async (questionText: string) => {
    if (!questionText.trim()) return;

    setLoading(true); // Start loading early
    setApiError(null);
    setQuery(""); // Clear input immediately

    let activeConversationId = currentConversationId;

    const userMessage: Message = {
      role: "user",
      content: questionText,
      timestamp: new Date().toISOString() // Use ISO string
    };

    // 1. Handle conversation creation if necessary
    if (!activeConversationId) {
      try {
        console.log('[ChatPage] Attempting to create a new conversation...');
        const response = await fetch('/api/conversations', { method: 'POST' });
        console.log('[ChatPage] Create conversation response status:', response.status);

        if (!response.ok) {
          let errorBody = 'Unknown error';
          try {
            errorBody = await response.text();
            console.error('[ChatPage] Create conversation failed response body:', errorBody);
            if (errorBody.trim().startsWith('{')) {
               const jsonError = JSON.parse(errorBody);
               errorBody = jsonError.error || errorBody;
            }
          } catch (parseError) {
             console.error('[ChatPage] Could not parse error response body:', parseError);
          }
          throw new Error(`Failed to create conversation: ${response.statusText} (${response.status}) - ${errorBody}`);
        }
        
        const newConv: Conversation = await response.json();
        console.log('[ChatPage] New conversation created:', newConv);
        activeConversationId = newConv.id;
        setCurrentConversationId(newConv.id);
        setConversations(prev => [newConv, ...prev]); // Add new conversation to the top of the list
        setMessages([userMessage]); // Start with the user message locally
        setInChatMode(true);
      } catch (error: any) {
        console.error("[ChatPage] Error during conversation creation fetch:", error);
        setApiError(error.message || "Failed to start chat.");
        setLoading(false);
        return;
      }
    } else {
      // If already in a conversation, just add the message locally first
      setMessages(prev => [...prev, userMessage]);
      // Ensure inChatMode is true if continuing an existing chat
      if (!inChatMode) setInChatMode(true); 
    }
    
    // Ensure we have an ID before proceeding
    if (!activeConversationId) {
        console.error("No active conversation ID after creation/check");
        setApiError("Could not establish a conversation session.");
        setLoading(false);
        return;
    }

    // 2. Save the user message
    await saveMessage(activeConversationId, userMessage);

    // 3. Call the AI backend (existing logic, maybe adapt context later)
    try {
      // TODO: Adapt how context is passed to the backend if needed.
      // Currently, the backend doesn't seem to use the passed context string anymore.
      // It might fetch history itself based on conversation ID if it were adapted.
      const needProfessors = messages.length <= 1; // Rough check if it's the first *real* interaction
      
      const response = await fetch("/api/supabase-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: questionText,
          // context: buildContextString(messages), // Pass current messages if needed by backend
          needProfessors: needProfessors,
          conversationId: activeConversationId // Pass conversation ID
        })
      });
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      // 4. Stream and save the assistant response
      await simulateStreaming(data.output, activeConversationId);

      // Optional: Update conversation title based on first interaction?
      if (needProfessors && activeConversationId) {
          // Maybe call PUT /api/conversations/:id to update name?
      }

    } catch (error: any) {
      console.error("Error during AI interaction:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message || 'Please try again.'}`, 
        timestamp: new Date().toISOString()
      };
      // Add error message locally and save it
      setMessages(prev => [...prev, errorMessage]);
      if (activeConversationId) { 
          await saveMessage(activeConversationId, errorMessage); 
      }
      setStreaming(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleAskQuestion(query);
  };

  // Select an existing conversation
  const selectConversation = (id: string) => {
    if (id === currentConversationId) return; // Avoid refetching if already selected
    setCurrentConversationId(id);
    setInChatMode(true);
    setMessages([]); // Clear old messages before loading new ones
    setLoadingMessages(true); // Show loading state for messages
  };

  // Reset state when going back to search view
  const resetChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInChatMode(false);
    setQuery("");
    setApiError(null);
    // No need to remove from localStorage
    // Optionally refetch conversations if a new one was added but not shown?
    // const fetchConversations = async () => { ... }; fetchConversations();
  };

  // Handler for deleting a conversation
  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }
      
      // Remove the deleted conversation from state
      setConversations(prev => prev.filter(convo => convo.id !== id));
      
      // If this was the currently active conversation, reset
      if (id === currentConversationId) {
        resetChat();
      }
    } catch (error: any) {
      console.error("Error deleting conversation:", error);
      setApiError(error.message || "Failed to delete conversation.");
    }
  };

  // Handler for renaming a conversation
  const handleRenameConversation = async (id: string, newName: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to rename conversation: ${response.statusText}`);
      }
      
      // Update the conversation name in state
      setConversations(prev => 
        prev.map(convo => 
          convo.id === id ? { ...convo, name: newName } : convo
        )
      );
    } catch (error: any) {
      console.error("Error renaming conversation:", error);
      setApiError(error.message || "Failed to rename conversation.");
    }
  };

  return (
    <div className={`h-screen flex flex-col ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-[#e8e6d9] text-black'} font-vastago ${vastago.variable} overflow-hidden text-sm`}>
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {!inChatMode ? (
          /* Initial view with centered search */
          <div className="max-w-4xl mx-auto px-4 w-full flex flex-col items-center justify-center h-full overflow-hidden">
            <h1 className="text-4xl md:text-5xl font-bold mb-16 text-center">
              What do you want to know?
            </h1>
            
            <div className="w-full overflow-hidden">
              <form onSubmit={handleSubmit} className="relative mb-10">
                <div className={`flex items-center p-4 border rounded-xl ${isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-[#f5f3e6] border-gray-300'}`}>
                  <input
                    type="text"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={searchSuggestion}
                    className={`w-full bg-transparent border-none focus:outline-none text-base font-vastago ${isDark ? 'text-white placeholder:text-gray-400' : 'text-black placeholder:text-gray-500'}`}
                  />
                  <div className="flex items-center gap-2 ml-2">
                    <button type="button" className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}><Globe size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} /></button>
                    <button type="button" className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}><Paperclip size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} /></button>
                    <button type="button" className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200'}`}><Mic size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} /></button>
                    <button type="submit" disabled={!query.trim()} className={`ml-2 p-3 rounded-lg flex items-center justify-center ${query.trim() ? 'bg-claude-orange hover:bg-claude-orange/90' : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'}`}>
                      <Search size={16} className="text-white" />
                    </button>
                  </div>
                </div>
                <div className="flex mt-4 gap-2 justify-center">
                  <button type="button" className={`px-3 py-1.5 rounded-full text-xs ${isDark ? 'bg-[#2a2a2a] text-gray-300 border border-gray-700' : 'bg-[#f5f3e6] text-gray-600 border border-gray-300'}`}>
                    <div className="flex items-center gap-2"><Search size={12} /><span>Search</span></div>
                  </button>
                </div>
              </form>
              
              {/* Recent conversations section */} 
              <div className="relative">
                <h2 className={`text-lg font-semibold mb-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recent Conversations</h2>
                {loadingConversations && <p className="text-center">Loading conversations...</p>}
                {apiError && !loadingConversations && <p className="text-center text-red-500">Error: {apiError}</p>}
                
                {/* No conversations state - render differently */}
                {!loadingConversations && !apiError && conversations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No conversations yet.</p>
                    <p className={`text-center text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Start a new chat to see it here.
                    </p>
                  </div>
                )}
                
                {!loadingConversations && !apiError && conversations.length > 0 && (
                  <div className="relative">
                    <div 
                      ref={conversationsContainerRef}
                      className="flex flex-col gap-2 mb-12 h-60 overflow-y-auto custom-scrollbar hide-scrollbar snap-y snap-mandatory"
                    >
                      {conversations.map(convo => (
                        <div 
                          key={convo.id}
                          className={`p-2 rounded-lg flex items-center justify-between transition-colors duration-200 ${isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white' : 'bg-[#f5f3e6] hover:bg-[#eae8db] text-black'}`}
                        >
                          <div 
                            onClick={() => selectConversation(convo.id)}
                            className="flex-1 cursor-pointer overflow-hidden"
                          >
                            <p className="font-medium truncate text-sm">{convo.name}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                const newName = prompt("Enter new name for conversation:", convo.name);
                                if (newName && newName.trim() !== "" && newName !== convo.name) {
                                  handleRenameConversation(convo.id, newName.trim());
                                }
                              }}
                              className={`p-1.5 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                              title="Rename"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm("Are you sure you want to delete this conversation?")) {
                                  handleDeleteConversation(convo.id);
                                }
                              }}
                              className={`p-1.5 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
                              title="Delete"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Only show bottom blur if there are 5+ conversations */}
                    {conversations.length >= 5 && (
                      <div className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10" 
                        style={{ background: isDark ? 'linear-gradient(to top, rgba(26, 26, 26, 1), rgba(26, 26, 26, 0))' : 'linear-gradient(to top, rgba(232, 230, 217, 1), rgba(232, 230, 217, 0))' }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Chat view */
          <div className="flex flex-col h-full max-w-4xl mx-auto w-full px-4 py-6 overflow-hidden">
            {/* Chat messages display (mostly unchanged logic, uses `messages` state) */} 
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {loadingMessages && <p className="text-center">Loading messages...</p>}
              {apiError && !loadingMessages && <p className="text-center text-red-500">Error: {apiError}</p>}
              {!loadingMessages && messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} w-full`}>
                  {message.role === "assistant" && (
                    <div className={`w-7 h-7 rounded-full mr-3 overflow-hidden bg-claude-orange flex-shrink-0 flex items-center justify-center text-white`}>
                      <div className="flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>
                    </div>
                  )}
                  <div className={`${message.role === "user" ? "max-w-[80%]" : "max-w-[90%]"} ${ message.role === "user" ? (isDark ? "bg-claude-orange text-white" : "bg-claude-orange text-white") : (isDark ? "bg-[#2a2a2a] text-white" : "bg-[#f5f3e6] text-black") } rounded-lg p-4`}>
                    {message.role === "assistant" ? (
                      <div className={`prose prose-sm max-w-none font-vastago ${isDark ? 'text-white prose-invert' : 'text-black'}`}>
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
                        <button className={`p-1 rounded hover:bg-gray-700`}><Copy size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} /></button>
                        <button className={`p-1 rounded hover:bg-gray-700`}><ThumbsUp size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} /></button>
                        <button className={`p-1 rounded hover:bg-gray-700`}><ThumbsDown size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} /></button>
                        <button className={`p-1 rounded hover:bg-gray-700`}><RotateCcw size={14} className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`} /></button>
                        <span className={`text-xs ml-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Atlas can make mistakes. Please double-check responses.</span>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className={`w-7 h-7 rounded-full ml-3 overflow-hidden bg-gray-700 flex-shrink-0 flex items-center justify-center text-white`}>D</div>
                  )}
                </div>
              ))}
              
              {/* Streaming response display (unchanged) */} 
              {streaming && (
                <div className="flex justify-start w-full">
                   <div className={`w-7 h-7 rounded-full mr-3 overflow-hidden bg-claude-orange flex-shrink-0 flex items-center justify-center text-white`}>
                     <div className="flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>
                   </div>
                   <div className={`max-w-[90%] ${ isDark ? "bg-[#2a2a2a] text-white" : "bg-[#f5f3e6] text-black" } rounded-lg p-4`}>
                    <div className={`prose prose-sm max-w-none font-vastago ${isDark ? 'text-white prose-invert' : 'text-black'}`}>
                      <ReactMarkdown>{streamedResponse}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading dots display (unchanged) */} 
              {loading && !streaming && !loadingMessages && (
                <div className="flex justify-start">
                  <div className={`w-7 h-7 rounded-full mr-3 overflow-hidden bg-claude-orange flex-shrink-0 flex items-center justify-center text-white`}>
                    <div className="flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-white"></div></div>
                  </div>
                  <div className={`max-w-[90%] ${ isDark ? "bg-[#2a2a2a]" : "bg-[#f5f3e6]" } rounded-lg p-4`}>
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
            
            {/* Chat input section (mostly unchanged) */} 
            <div className="sticky bottom-0 z-10 bg-inherit pt-2">
              <form onSubmit={handleSubmit} className="relative">
                <div className={`flex items-center p-3 border rounded-xl ${ isDark ? 'bg-[#2a2a2a] border-gray-700' : 'bg-[#f5f3e6] border-gray-300' }`}>
                  <input
                    type="text"
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Reply to Atlas..."
                    className={`w-full bg-transparent border-none focus:outline-none font-vastago ${ isDark ? 'text-white' : 'text-black' }`}
                  />
                  <div className="flex items-center gap-2 ml-2">
                    <button type="submit" disabled={!query.trim() || loading || loadingMessages} className={`p-2 rounded-full ${ query.trim() && !loading && !loadingMessages ? 'bg-claude-orange hover:bg-claude-orange/90 text-white' : isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400' }`}>
                      <ArrowUp size={16} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Back button (uses resetChat) */} 
              <div className="flex justify-center mt-4">
                <button onClick={resetChat} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${ isDark ? 'bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300' : 'bg-[#f5f3e6] hover:bg-[#eae8db] text-gray-700' }`}>
                  <ArrowLeft size={14} />
                  <span>Back to Search</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Global styles (unchanged) */} 
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: ${isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'}; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .placeholder-fade-out::placeholder { opacity: 0; filter: blur(4px); transform: translateY(5px); transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease; }
        .placeholder-fade-in::placeholder { opacity: 1; filter: blur(0); transform: translateY(0); transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease; }
        input::placeholder { transition: opacity 0.5s ease, filter 0.5s ease, transform 0.5s ease; }
      `}</style>
    </div>
  );
}

/* Removed old INSTRUCTIONS FOR API ROUTE IMPLEMENTATION comment block */