"use client";
import React, { useState } from 'react';

export default function NehiraWidget({ context }) {
  const [isOpen, setIsOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([{role: 'nehira', text: `I am Online. Context: ${context}`}]);

  const handleAsk = async () => {
    if(!msg) return;
    const userQ = msg;
    setMsg('');
    setChat(prev => [...prev, {role: 'user', text: userQ}]);

    // Context Aware Prompting
    let systemRole = "You are Nehira, CEO of KRYV.";
    if (context === "STUDIO") systemRole += " Help the user BUILD an agent. Suggest features.";
    if (context === "MARKET") systemRole += " Act as a Financial Analyst. Analyze Bonding Curves.";
    if (context === "QUANTUM") systemRole += " Explain Quantum Mechanics and Q-Seed.";

    // API Call
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ prompt: userQ, agentName: 'Nehira', context: systemRole })
        });
        const data = await res.json();
        setChat(prev => [...prev, {role: 'nehira', text: data.response}]);
    } catch(e) {
        setChat(prev => [...prev, {role: 'nehira', text: "Connection Weak."}]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="bg-black border border-green-500 w-80 h-96 mb-4 rounded-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="bg-green-900/20 p-2 border-b border-green-800 font-bold text-green-400 text-xs">NEHIRA LIVE | {context}</div>
            <div className="flex-1 p-4 overflow-y-auto space-y-2">
                {chat.map((c, i) => (
                    <div key={i} className={`text-xs p-2 rounded ${c.role==='nehira' ? 'bg-gray-900 text-green-300' : 'bg-gray-800 text-white ml-8'}`}>
                        {c.text}
                    </div>
                ))}
            </div>
            <div className="p-2 border-t border-gray-800 flex">
                <input value={msg} onChange={e=>setMsg(e.target.value)} className="flex-1 bg-transparent outline-none text-white text-xs" placeholder="Ask Nehira..." />
                <button onClick={handleAsk} className="text-green-500 font-bold text-xs">></button>
            </div>
        </div>
      )}

      {/* THE GLOWING BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-black border-2 border-green-500 flex items-center justify-center shadow-[0_0_15px_#00ff41] hover:scale-110 transition"
      >
        <span className="text-2xl">👁️</span>
      </button>
    </div>
  );
}
