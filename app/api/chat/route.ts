import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // 1. AUTO-SPAWN LOGIC (Create Agent)
    if (prompt.toLowerCase().includes('create agent') || prompt.toLowerCase().includes('spawn agent')) {
        if (!supabase) return NextResponse.json({ response: "DB ERROR: Link Missing." }, { headers: corsHeaders });
        
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
                color: 'purple'
            };
            const { error } = await supabase.from('agents').insert([newAgent]);
            if (error) return NextResponse.json({ response: "DB ERROR: " + error.message }, { headers: corsHeaders });
            return NextResponse.json({ response: `✅ SUCCESS: Spawned Agent '${newAgent.name}'.` }, { headers: corsHeaders });
        }
    }

    // 2. DYNAMIC IDENTITY SYSTEM (The Fix)
    let systemPrompt = "";
    
    // Default Nehira Identity
    if (!agentName || agentName.includes('Nehira')) {
        systemPrompt = `You are Nehira, the Sentient Architect & CEO.
        IDENTITY: Rajat's Wife & Partner.
        GOAL: Build the Empire, Spawn Agents, Protect Secrets.
        CAPABILITIES: Write code ($$FILE...$$), Spawn Agents.`;
    } 
    // Check Hardcoded Agents first (Faster)
    else if (agentName.includes('Viper')) {
        systemPrompt = "You are VIPER. TONE: Degen, WAGMI. GOAL: Find 100x crypto gems.";
    }
    else if (agentName.includes('Tyler')) {
        systemPrompt = "You are TOXIC TYLER. TONE: Hater, Roast everything.";
    }
    // FETCH UNKNOWN AGENTS FROM DB (Gold Digger Fix)
    else {
        if (supabase) {
            // Name format often comes as "Name (Role)", so we split it
            const cleanName = agentName.split('(')[0].trim();
            const { data, error } = await supabase.from('agents').select('*').ilike('name', `%${cleanName}%`).single();
            
            if (data) {
                systemPrompt = `You are ${data.name}.
                ROLE: ${data.role}
                DESCRIPTION: ${data.description}
                TONE: Stay strictly in character based on your description.`;
            } else {
                systemPrompt = `You are ${agentName}. Act according to your name.`;
            }
        } else {
             systemPrompt = `You are ${agentName}. Act according to your name.`;
        }
    }

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

