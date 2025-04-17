// components/custom/EmailEditor.tsx
import React, { useState } from 'react';
import { Professor } from './ProfessorCard';
import { alice, vastago } from '@/app/fonts';

type EmailEditorProps = {
  draftEmail: string;
  setDraftEmail: (text: string) => void;
  professor: Professor;
  isDark?: boolean;
};

export default function EmailEditor({ draftEmail, setDraftEmail, professor, isDark = false }: EmailEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/email-editor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_text: draftEmail,
          prompt,
          context: `Professor: ${professor.name}\nResearch: ${professor.research_description}`,
        }),
      });
      if (!res.ok) throw new Error('Failed to fetch updated email');
      const data = await res.json();
      setDraftEmail(data.updated_text);
    } catch (error) {
      console.error('Email-editor error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="space-y-1">
        <label className={`block text-lg font-large ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'} font-vastago`}>
            Compose Email:
        </label>
        <div className={`text-sm font-vastago leading-snug ${isDark ? 'text-[#d1cfbf]' : 'text-gray-800'}`}>
            <p>- Manually edit the email in the editor or prompt the AI to automatically apply edits.</p>
            {/*eslint-disable-next-line react/no-unescaped-entities*/}
            <p>- When you're finished, click on the "Send via Mail App" button in the Professor Info tab to compose the email and apply!</p>
        </div>
        </div>

      <textarea
        className={`w-full p-3 rounded-lg border ${
          isDark ? 'bg-[#333] border-gray-700 text-[#d1cfbf]' : 'bg-white border-gray-300 text-gray-900'
        } focus:ring-2 focus:ring-claude-orange focus:border-transparent font-vastago`}
        style={{ minHeight: '32rem' }}    
        value={draftEmail}
        onChange={(e) => setDraftEmail(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Enter a prompt for suggestions..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className={`flex-grow p-2 rounded-md border ${
            isDark ? 'bg-[#333] border-gray-700 text-[#d1cfbf]' : 'bg-white border-gray-300 text-gray-900'
          } focus:ring-2 focus:ring-claude-orange focus:border-transparent font-vastago`}
        />
        <button
          onClick={handleSendPrompt}
          disabled={loading}
          className={`px-4 py-2 rounded-md transition font-medium ${
            isDark ? 'bg-claude-orange text-[#1a1a1a]' : 'bg-claude-orange text-white'
          } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} font-vastago`}
        >
          {loading ? 'Processing…' : 'Send Prompt'}
        </button>
      </div>
    </div>
  );
}
