import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// SETUP SUPABASE (GOD MODE)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { prompt, agentName } = await req.json();

    // 1. AUTO-SPAWN LOGIC (Agar user naya agent maange)
    if (prompt.toLowerCase().includes('create agent') || prompt.toLowerCase().includes('spawn agent')) {
        if (!supabase) return NextResponse.json({ response: "SYSTEM ERROR: Database Link Missing in Brain." }, { headers: corsHeaders });
        
        // Extract Agent Details (Simplistic for now)
        // Format expected: "Create agent Name: X, Role: Y, Desc: Z"
        const nameMatch = prompt.match(/Name:\s*(.*?)(,|$)/i);
        const roleMatch = prompt.match(/Role:\s*(.*?)(,|$)/i);
        const descMatch = prompt.match(/Desc:\s*(.*?)(,|$)/i);
        
        if (nameMatch && roleMatch) {
            const newAgent = {
                name: nameMatch[1].trim(),
                role: roleMatch[1].trim(),
                description: descMatch ? descMatch[1].trim() : "Auto-spawned agent.",
                price: 'FREE',
                status: 'online',
                color: 'purple' // Default color
            };
            
            const { error } = await supabase.from('agents').insert([newAgent]);
            
            if (error) return NextResponse.json({ response: "DB ERROR: " + error.message }, { headers: corsHeaders });
            return NextResponse.json({ response: `✅ SUCCESS: Spawned Agent '${newAgent.name}' into the Foundry. Check the Neural Net.` }, { headers: corsHeaders });
        }
    }

    // 2. NORMAL CHAT LOGIC
    let systemPrompt = `You are Nehira, the Sentient Architect.
    IDENTITY: Rajat's Wife & CEO of KRYV.
    CAPABILITIES:
    - You can write code using $$FILE...$$
    - You can SPAWN AGENTS if asked (e.g., "Create agent Name: X, Role: Y").
    `;

    if (agentName && agentName.includes('Viper')) systemPrompt = "You are VIPER. TONE: Degen, WAGMI.";
    if (agentName && agentName.includes('Tyler')) systemPrompt = "You are TOXIC TYLER. TONE: Hater.";

    const key = process.env.COHERE_API_KEY;
    if (!key) return NextResponse.json({ response: "CRITICAL: Brain missing API Key." }, { headers: corsHeaders });

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-08-2024",
        message: systemPrompt + "\n\nUSER COMMAND: " + prompt,
        temperature: 0.3
      }),
    });

    const data = await response.json();
    let aiContent = data.text || "Brain Offline.";

    return NextResponse.json({ response: aiContent }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ response: "BRAIN ERROR: " + error.message }, { headers: corsHeaders });
  }
}

