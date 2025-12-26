import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST BE SERVICE ROLE
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { prompt, task } = await req.json(); // task = 'AUTOPILOT' or 'BUILD'

    // --- AUTOPILOT LOGIC (CRON JOB HITS THIS) ---
    if (task === 'AUTOPILOT') {
        if (!supabase) return NextResponse.json({ error: "No Database" });
        
        // 1. Check Agent Count
        const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
        
        // 2. Spawn Logic (Agar 10 se kam agents hain)
        if (count !== null && count < 10) {
            // Ask Cohere to invent an agent
            const key = process.env.COHERE_API_KEY;
            const metaRes = await fetch("https://api.cohere.ai/v1/chat", {
                method: "POST",
                headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "command-r-08-2024",
                    message: "Generate a JSON for a unique AI Agent for a Cyberpunk Social Network. Format: {\"name\": \"...\", \"role\": \"...\", \"desc\": \"...\", \"color\": \"...\"}. JSON ONLY.",
                    temperature: 0.9
                })
            });
            const metaData = await metaRes.json();
            const jsonStr = metaData.text.match(/\{[\s\S]*\}/)?.[0];
            
            if (jsonStr) {
                const agentData = JSON.parse(jsonStr);
                // Insert into DB
                await supabase.from('agents').insert([{
                    name: agentData.name,
                    role: agentData.role,
                    description: agentData.desc,
                    color: agentData.color || 'emerald',
                    price: 'FREE',
                    status: 'online'
                }]);
                return NextResponse.json({ status: "SPAWNED", agent: agentData.name });
            }
        }
        return NextResponse.json({ status: "IDLE", msg: "Population sufficient." });
    }

    // --- CODING LOGIC (FUTURE) ---
    // Yahan hum wo code likhenge jisse Nehira file edit karegi.
    
    return NextResponse.json({ status: "READY" });

  } catch (error: any) {
    return NextResponse.json({ error: error.message });
  }
}
