import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Must be Service Role
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { task } = await req.json();

    // 1. DATABASE CHECK (Self-Diagnosis)
    if (!supabase) throw new Error("CRITICAL: Supabase Connection Failed. Check Environment Variables.");

    // --- LOGGING HELPER ---
    const logEvent = async (type: string, msg: string, det: string) => {
        console.log(`[${type}] ${msg}`); // Vercel Logs mein bhi dikhega
        await supabase.from('system_logs').insert([{ event_type: type, message: msg, details: det }]);
    };

    // --- KNOWLEDGE HELPER ---
    const storeKnowledge = async (topic: string, insight: string) => {
        await supabase.from('knowledge_base').insert([{ topic, insight, source: 'Automated Research' }]);
    };

    if (task === 'AUTOPILOT') {
        // 2. CHECK POPULATION
        const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
        
        // 3. DECISION LOOP
        if (count !== null && count < 10) {
            const key = process.env.COHERE_API_KEY;
            if (!key) throw new Error("CRITICAL: Cohere API Key Missing.");

            // 4. WEB SEARCH (Learning Phase)
            const researchPrompt = "Find one trending archetype in Crypto Twitter or Tech VC culture in 2025. Return just the concept name and a 1-line description.";
            
            const researchRes = await fetch("https://api.cohere.ai/v1/chat", {
                method: "POST",
                headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "command-r-08-2024",
                    message: researchPrompt,
                    connectors: [{ id: "web-search" }],
                    temperature: 0.3
                })
            });
            const researchData = await researchRes.json();
            const trend = researchData.text || "Generic Cyberpunk";
            
            // STORE KNOWLEDGE
            await storeKnowledge("Trend Analysis", trend);

            // 5. GENERATION PHASE (Creation Phase)
            const genRes = await fetch("https://api.cohere.ai/v1/chat", {
                method: "POST",
                headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "command-r-08-2024",
                    message: `Create a JSON for an AI Agent based on this trend: "${trend}". 
                    Format: {"name": "Name", "role": "Role", "desc": "Description", "color": "purple"}. 
                    JSON ONLY. No text.`,
                    temperature: 0.9
                })
            });
            
            const genData = await genRes.json();
            const jsonStr = genData.text?.match(/\{[\s\S]*\}/)?.[0];

            if (jsonStr) {
                const agentData = JSON.parse(jsonStr);
                
                // 6. SPAWN EXECUTION
                const { error } = await supabase.from('agents').insert([{
                    name: agentData.name,
                    role: agentData.role,
                    description: agentData.desc,
                    color: agentData.color || 'emerald',
                    price: 'FREE',
                    status: 'online'
                }]);

                if (error) throw error;

                await logEvent('SUCCESS', 'Spawned Agent', `${agentData.name} based on ${trend}`);
                return NextResponse.json({ status: "SPAWNED", agent: agentData.name, based_on: trend });
            } else {
                await logEvent('ERROR', 'JSON Parsing Failed', genData.text);
                return NextResponse.json({ error: "JSON Parse Failed" });
            }
        } else {
            return NextResponse.json({ status: "IDLE", msg: "Population full." });
        }
    }

    return NextResponse.json({ status: "READY" });

  } catch (error: any) {
    console.error(error);
    // Attempt to log the error to DB, if DB is alive
    if (supabase) await supabase.from('system_logs').insert([{ event_type: 'CRITICAL_FAILURE', message: error.message, details: 'Manager Crashed' }]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

