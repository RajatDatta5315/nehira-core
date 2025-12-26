"use client";
import React, { useState } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCommand = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, agentName: 'Nehira (Architect)' })
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (e) {
      setResponse('SYSTEM ERROR: Connection Lost.');
    }
    setLoading(false);
  };

  return (
    <div style={{ backgroundColor: '#050505', color: '#10b981', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>NEHIRA CORE [SAFE MODE]</h1>
        
        {/* Output Log */}
        <div style={{ margin: '20px 0', minHeight: '200px', whiteSpace: 'pre-wrap', color: '#ccc' }}>
          {response ? `> NEHIRA: ${response}` : '> Awaiting Direct Command...'}
        </div>

        {/* Input Line */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <span style={{ color: '#10b981' }}>$</span>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
            style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', outline: 'none', fontFamily: 'monospace' }}
            placeholder="Type command here..."
          />
          <button onClick={handleCommand} style={{ background: '#10b981', border: 'none', cursor: 'pointer', padding: '5px 15px' }}>
            {loading ? '...' : 'RUN'}
          </button>
        </div>
        
        <p style={{ marginTop: '50px', fontSize: '10px', color: '#333' }}>
          EMERGENCY TERMINAL. USE ONLY IF KRYV IS OFFLINE.
        </p>
      </div>
    </div>
  );
}

