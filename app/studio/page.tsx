"use client";
import React, { useState } from 'react';
import NehiraWidget from '../../components/NehiraWidget'; // Import Widget

export const dynamic = 'force-static'; // Cloudflare Fix

export default function KryvStudio() {
  const [view, setView] = useState('dashboard'); 
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if(!agentName || !agentRole) return alert("Details missing!");
    setLoading(true);
    // Simulation of API Call
    setTimeout(() => {
        alert("Agent Created! Check Dashboard.");
        setLoading(false);
        setView('dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-6 hidden md:block bg-[#0a0a0a]">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-500 mb-8 tracking-tighter">
          KRYV STUDIO
        </h1>
        <nav className="space-y-2 text-sm">
          <button onClick={() => setView('dashboard')} className={`w-full text-left p-2 rounded ${view==='dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-green-400'}`}>Dashboard</button>
          <button onClick={() => setView('create')} className={`w-full text-left p-2 rounded ${view==='create' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-green-400'}`}>+ Create Agent</button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        {view === 'create' ? (
          <div className="max-w-xl mx-auto mt-10">
            <h2 className="text-3xl font-bold mb-6">Deploy New Agent</h2>
            <div className="bg-[#111] p-8 rounded-xl border border-gray-800">
               <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full mb-4 bg-black border border-gray-700 p-4 rounded text-white" placeholder="Agent Name" />
               <textarea value={agentRole} onChange={e => setAgentRole(e.target.value)} className="w-full mb-4 bg-black border border-gray-700 p-4 rounded text-white h-32" placeholder="Agent Role & Prompt" />
               <button onClick={handleCreate} className="w-full bg-green-600 text-black font-bold py-4 rounded hover:bg-green-500">
                 {loading ? 'BUILDING...' : 'LAUNCH AGENT'}
               </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Studio Dashboard</h2>
            <div className="p-6 bg-[#111] border border-gray-800 rounded">
                <p className="text-gray-400">Total Agents: 0 | Credits: 500</p>
            </div>
          </div>
        )}
      </div>

      {/* 👁️ OMNIPRESENT NEHIRA */}
      <NehiraWidget context="STUDIO" />
    </div>
  );
}

