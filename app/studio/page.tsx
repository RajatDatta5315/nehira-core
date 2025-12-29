export const dynamic = 'force-static';
"use client";
import React, { useState } from 'react';

export default function KryvStudio() {
  const [view, setView] = useState('dashboard'); 
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [price, setPrice] = useState('0');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleCreate = async () => {
    if(!agentName || !agentRole) return alert("Name & Role required!");
    setLoading(true);
    setStatusMsg("Initializing Quantum Core...");

    try {
      // 1. Call Internal API to Save Agent & Get Q-SEED Key
      // (Note: Hum abhi mock kar rahe hain jab tak backend route na bane)
      // Real implementation mein: await fetch('/api/agent/create', ...)
      
      setTimeout(() => {
        setStatusMsg("Generating Quantum API Key...");
        setTimeout(() => {
            alert(`SUCCESS! Agent "${agentName}" Created.\n\nYOUR Q-SEED KEY: qsk_${Math.random().toString(36).substr(2, 9)}\n\n(Save this key to access True Entropy)`);
            setView('dashboard');
            setLoading(false);
            setStatusMsg("");
        }, 1500);
      }, 1000);

    } catch (e) {
      alert("Creation Failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-6 hidden md:block bg-[#0a0a0a]">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 tracking-tighter">
          KRYV STUDIO
        </h1>
        <nav className="space-y-2 text-sm">
          <button onClick={() => setView('dashboard')} className={`w-full text-left p-2 rounded ${view==='dashboard' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-green-400'}`}>Dashboard</button>
          <button onClick={() => setView('create')} className={`w-full text-left p-2 rounded ${view==='create' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-green-400'}`}>+ Create Agent</button>
          <button className="w-full text-left p-2 rounded text-gray-400 hover:text-green-400">Monetization</button>
        </nav>
      </div>

      {/* MAIN AREA */}
      <div className="flex-1 p-8">
        {view === 'create' ? (
          <div className="max-w-xl mx-auto mt-10">
            <h2 className="text-3xl font-bold mb-6 text-white">Deploy New Agent</h2>
            <div className="bg-[#111] p-8 rounded-xl border border-gray-800 shadow-2xl">
              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agent Designation</label>
                  <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full mt-2 bg-black border border-gray-700 p-4 rounded-lg text-white focus:border-green-500 outline-none transition-all" placeholder="e.g. Quantum Trader Alpha" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Primary Directive (Prompt)</label>
                  <textarea value={agentRole} onChange={e => setAgentRole(e.target.value)} className="w-full mt-2 bg-black border border-gray-700 p-4 rounded-lg text-white focus:border-green-500 outline-none h-32 transition-all" placeholder="Define the agent's behavior and quantum logic..." />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Rent ($)</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full mt-2 bg-black border border-gray-700 p-4 rounded-lg text-white focus:border-green-500 outline-none transition-all" />
                </div>
                
                <button onClick={handleCreate} disabled={loading} className="w-full bg-gradient-to-r from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-bold py-4 rounded-lg shadow-lg shadow-green-900/20 transform transition active:scale-95">
                  {loading ? statusMsg : 'LAUNCH ON MARKETPLACE'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats Cards (Same as before) */}
              <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                <h3 className="text-gray-500 text-xs uppercase">Total Earnings</h3>
                <p className="text-4xl font-bold mt-2 text-white">$0.00</p>
              </div>
              <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                <h3 className="text-gray-500 text-xs uppercase">Live Agents</h3>
                <p className="text-4xl font-bold mt-2 text-white">0</p>
              </div>
              <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
                 <h3 className="text-gray-500 text-xs uppercase">Q-Seed Usage</h3>
                 <p className="text-4xl font-bold mt-2 text-purple-400">0 <span className="text-sm text-gray-600">reqs</span></p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

