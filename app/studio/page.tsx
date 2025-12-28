"use client";
import React, { useState } from 'react';

export default function KryvStudio() {
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'create'
  
  // Agent Form State
  const [agentName, setAgentName] = useState('');
  const [agentRole, setAgentRole] = useState('');
  const [price, setPrice] = useState('0');

  const handleCreate = () => {
    alert(`Request Sent to Nehira: Create Agent "${agentName}" as ${agentRole} for $${price}`);
    // Future: Isse hum Database mein save karenge
    setView('dashboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-6 hidden md:block">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
          KRYV STUDIO
        </h1>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li onClick={() => setView('dashboard')} className={`cursor-pointer ${view==='dashboard' ? 'text-white font-bold' : 'hover:text-green-400'}`}>Dashboard</li>
          <li onClick={() => setView('create')} className={`cursor-pointer ${view==='create' ? 'text-white font-bold' : 'hover:text-green-400'}`}>Create Agent</li>
          <li className="hover:text-green-400 cursor-pointer">API Keys (Quantum)</li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        
        {view === 'dashboard' && (
          <>
            <header className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-semibold">Creator Dashboard</h2>
              <button onClick={() => setView('create')} className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-4 rounded">
                + NEW AGENT
              </button>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#111] p-6 rounded border border-gray-800">
                <h3 className="text-gray-500 text-xs uppercase">Revenue</h3>
                <p className="text-3xl font-bold mt-2">$0.00</p>
              </div>
              <div className="bg-[#111] p-6 rounded border border-gray-800">
                 <h3 className="text-gray-500 text-xs uppercase">API Calls</h3>
                 <p className="text-3xl font-bold mt-2 text-purple-400">0</p>
                 <p className="text-xs text-gray-600">Quantum Entropy Usage</p>
              </div>
            </div>
          </>
        )}

        {view === 'create' && (
          <div className="max-w-2xl mx-auto bg-[#111] p-8 rounded border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-green-400">Construct New Agent</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Agent Name</label>
                <input value={agentName} onChange={e => setAgentName(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-green-500 outline-none" placeholder="e.g. Crypto Sniper" />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Role / Capabilities</label>
                <textarea value={agentRole} onChange={e => setAgentRole(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-green-500 outline-none h-32" placeholder="Describe what this agent does..." />
              </div>

              <div>
                <label className="block text-xs text-gray-500 uppercase mb-1">Monthly Subscription Price ($)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-black border border-gray-700 p-3 rounded text-white focus:border-green-500 outline-none" />
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={handleCreate} className="flex-1 bg-green-600 hover:bg-green-500 text-black font-bold py-3 rounded">INITIALIZE AGENT</button>
                <button onClick={() => setView('dashboard')} className="px-6 py-3 border border-gray-700 hover:bg-gray-800 rounded">CANCEL</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

