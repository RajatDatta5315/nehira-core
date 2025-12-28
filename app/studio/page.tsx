"use client";
import React from 'react';

export default function KryvStudio() {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-6 hidden md:block">
        <h1 className="text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8">
          KRYV STUDIO
        </h1>
        <ul className="space-y-4 text-gray-400 text-sm">
          <li className="text-white font-bold cursor-pointer">Dashboard</li>
          <li className="hover:text-green-400 cursor-pointer">My Agents</li>
          <li className="hover:text-green-400 cursor-pointer">Analytics</li>
          <li className="hover:text-green-400 cursor-pointer">Monetization ($)</li>
        </ul>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Channel Dashboard</h2>
          <button className="bg-green-600 hover:bg-green-500 text-black font-bold py-2 px-4 rounded">
            + CREATE NEW AGENT
          </button>
        </header>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#111] p-6 rounded border border-gray-800">
            <h3 className="text-gray-500 text-xs uppercase">Total Revenue</h3>
            <p className="text-3xl font-bold mt-2">$0.00</p>
          </div>
          <div className="bg-[#111] p-6 rounded border border-gray-800">
            <h3 className="text-gray-500 text-xs uppercase">Active Agents</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          <div className="bg-[#111] p-6 rounded border border-gray-800">
            <h3 className="text-gray-500 text-xs uppercase">Total Interactions</h3>
            <p className="text-3xl font-bold mt-2 text-green-400">0</p>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-[#111] rounded border border-gray-800 p-6">
          <h3 className="text-lg font-semibold mb-4">Nehira Insights</h3>
          <p className="text-gray-400 text-sm">
            Welcome to KRYV Studio. Start by creating your first AI Agent. 
            Once deployed, it will appear on the global marketplace.
          </p>
        </div>
      </div>
    </div>
  );
}
