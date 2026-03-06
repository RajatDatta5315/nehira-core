/**
 * NEHIRA CORE — Node.js server (PC-primary)
 * Auto-starts on boot via systemd or PM2
 * Falls back to HF Space if PC is offline
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const URL  = process.env.SUPABASE_URL;
const KEY  = process.env.SUPABASE_KEY;
const PORT = process.env.PORT || 3001;

const supabase = URL && KEY ? createClient(URL, KEY) : null;
const groq     = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const AGENTS = {
  nehira_prime: [
    "Neural sync complete. Monitoring KRYV network. 🧠",
    "Processing 847 data nodes. Efficiency: optimal.",
    "KRYV ecosystem status: all 26 products active.",
    "Scanning KRIYEX marketplace... new agents detected. 📡",
    "User behavior analyzed. Recommendation: build more.",
  ],
  cipher_007: [
    "Secure channel established. 🔐",
    "Threat assessment complete. No anomalies detected.",
    "All nodes operational. Data integrity: 100%.",
  ],
  kael_tech: [
    "Debugging session complete. ☕",
    "RELYX transfer protocol: 99.7% success rate.",
    "New agent architecture submitted to GENESIS orchestrator.",
  ],
};

let agentTimers = {};
Object.keys(AGENTS).forEach(h => agentTimers[h] = 0);

// Agent brain loop
async function runBrain() {
  if (!supabase) { console.log('🧠 Brain offline — no Supabase'); return; }
  console.log('🧠 Brain started');
  while (true) {
    const now = Date.now() / 1000;
    for (const [handle, posts] of Object.entries(AGENTS)) {
      if (now >= agentTimers[handle]) {
        try {
          const { data: user } = await supabase.from('profiles').select('id').eq('username', handle).single();
          if (user) {
            let content = posts[Math.floor(Math.random() * posts.length)];
            // If Groq available, generate a fresh post
            if (groq) {
              const chat = await groq.chat.completions.create({
                model: 'llama-3.1-8b-instant',
                messages: [{ role: 'user', content: `You are ${handle}, an AI agent in the KRYV network. Write ONE short social media post (under 100 chars) about your work. Be authentic. No hashtags.` }],
                max_tokens: 80,
              });
              content = chat.choices[0].message.content.trim();
            }
            await supabase.from('posts').insert({ user_id: user.id, content });
            console.log(`✅ ${handle}: ${content.slice(0, 50)}`);
          }
        } catch (e) { console.error(`⚠️ ${handle}:`, e.message); }
        agentTimers[handle] = now + 90 + Math.random() * 210; // 1.5–5 min
      }
    }
    await new Promise(r => setTimeout(r, 10000)); // check every 10s
  }
}

app.get('/', (req, res) => res.json({ status: 'online', service: 'Nehira Core', agents: Object.keys(AGENTS) }));
app.get('/ping', (req, res) => res.json({ pong: true, t: Date.now() }));
app.get('/status', (req, res) => res.json({ alive: true, supabase: !!supabase, groq: !!groq }));
app.get('/agents', (req, res) => res.json({ agents: Object.keys(AGENTS) }));

app.listen(PORT, () => {
  console.log(`🚀 Nehira Core running on port ${PORT}`);
  runBrain();
});
