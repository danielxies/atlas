"use client";

import { useState } from "react";
import { useTheme } from "../lib/hooks/useTheme";
import Navbar from "../components/shared/Navbar";
import { PlaceholdersAndVanishInput } from "../components/ui/placeholders-and-vanish-input";
import { alice, vastago } from "../fonts";
import { cn } from "@/lib/utils";
import Footer from "../components/shared/Footer";

export default function SearchPage() {
  const { isDark, setIsDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const searchPlaceholders = [
    "Search for research opportunities...",
    "Find professors to work with...",
    "Discover ongoing projects...",
    "Search by research field...",
    "Look up research labs..."
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Search submitted:", searchQuery);
    // Here you would typically call an API to fetch search results
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#1a1a1a] text-[#d1cfbf]' : 'bg-[#e8e6d9] text-black'} ${alice.variable} ${vastago.variable} flex flex-col`}>
      <Navbar isDark={isDark} setIsDark={setIsDark} />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center ${isDark ? 'text-[#d1cfbf]' : 'text-gray-900'} font-alice`}>
            What are <span className="text-claude-orange italic underline">you</span> interested in?
          </h1>
          
          <div className="mb-10">
            <style jsx global>{`
              .search-input-container {
                background-color: ${isDark ? '#2a2a2a' : '#f5f3e6'} !important;
                box-shadow: ${isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'} !important;
              }
              .search-input-container input {
                color: ${isDark ? '#d1cfbf' : '#333'} !important;
              }
              .search-input-container button {
                background-color: ${isDark ? '#3a3a3a' : '#ddd8c0'} !important;
              }
              .search-input-container button svg {
                color: ${isDark ? '#d1cfbf' : '#555'} !important;
              }
            `}</style>
            <div className="search-input-wrapper">
              <PlaceholdersAndVanishInput 
                placeholders={searchPlaceholders}
                onChange={handleSearchChange}
                onSubmit={handleSearchSubmit}
              />
            </div>
          </div>
          
          <div className="mt-16">
            {searchQuery ? (
              <p className={`text-center ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} font-vastago`}>
                Showing results for: {searchQuery}
              </p>
            ) : (
              <div className="text-center">
                <p className={`text-lg ${isDark ? 'text-[#d1cfbf]/80' : 'text-gray-600'} mb-3 font-vastago`}>
                  Start your search to discover research opportunities
                </p>
                <p className={`${isDark ? 'text-[#d1cfbf]/60' : 'text-gray-500'} font-vastago`}>
                  Search by research field, professor name, or keywords
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Removed Logo Ticker Section */}
      </main>
      
      <Footer isDark={isDark} />
    </div>
  );
} 