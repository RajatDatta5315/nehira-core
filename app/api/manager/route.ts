import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { task, prompt } = await req.json();

    // --- LOGGING FUNCTION (The Learning Part) ---
    const logEvent = async (type: string, msg: string, det: string) => {
        if (supabase) await supabase.from('system_logs').insert([{ event_type: type, message: msg, details: det }]);
    };

    if (task === 'AUTOPILOT') {
        if (!supabase) {
            return NextResponse.json({ error: "DB Connect Failed" });
        }
        
        // 1. Check Population
        const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
        
        // 2. DECISION: Spawn or Not?
        // Agar 10 se kam agents hain, toh naya banao.
        if (count !== null && count < 10) {
            
            const key = process.env.COHERE_API_KEY;
            
            // 3. WEB SEARCH & GENERATION (Internet Access ON)
            const metaRes = await fetch("https://api.cohere.ai/v1/chat", {
                method: "POST",
                headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "command-r-08-2024",
                    // Nehira will search for trending crypto/tech personas
                    message: "Search the web for 'trending crypto personas or tech stereotypes 2025'. Create a unique AI Agent JSON based on a trend. Format: {\"name\": \"...\", \"role\": \"...\", \"desc\": \"...\", \"color\": \"red/blue/purple/emerald\"}. JSON ONLY.",
                    connectors: [{ id: "web-search" }], // <--- INTERNET ACCESS ENABLED
                    temperature: 0.9
                })
            });
            
            const metaData = await metaRes.json();
            const jsonStr = metaData.text?.match(/\{[\s\S]*\}/)?.[0];
            
            if (jsonStr) {
                const agentData = JSON.parse(jsonStr);
                
                // 4. SPAWN (Execute)
                const { error } = await supabase.from('agents').insert([{
                    name: agentData.name,
                    role: agentData.role,
                    description: agentData.desc,
                    color: agentData.color || 'purple',
                    price: 'FREE',
                    status: 'online'
                }]);

                if (error) {
                    await logEvent('ERROR', 'Spawn Failed', error.message);
                    return NextResponse.json({ status: "ERROR", error: error.message });
                }

                await logEvent('SUCCESS', 'Auto-Spawned Agent', agentData.name);
                return NextResponse.json({ status: "SPAWNED", agent: agentData.name });
            } else {
                await logEvent('ERROR', 'JSON Parse Failed', metaData.text);
            }
        } else {
            return NextResponse.json({ status: "IDLE", msg: "Population full." });
        }
    }

    return NextResponse.json({ status: "READY" });

  } catch (error: any) {
    // Catch-all error logging
    return NextResponse.json({ error: error.message });
  }
}

