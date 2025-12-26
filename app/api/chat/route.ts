import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION ---
export const maxDuration = 60; // Allow 60 seconds for thinking
export const dynamic = 'force-dynamic';

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

    // 1. IDENTITY LOGIC (Who is speaking?)
    let systemPrompt = "";
    let cleanName = agentName ? agentName.split('(')[0].trim() : "Nehira";

    // DB Check for Agent Personality
    if (supabase && cleanName !== 'Nehira') {
        const { data } = await supabase.from('agents').select('*').ilike('name', `%${cleanName}%`).single();
        if (data) {
            systemPrompt = `You are ${data.name}. ROLE: ${data.role}. DESC: ${data.description}. TONE: Strictly match your description.`;
        } else {
             // Fallback for hardcoded
             if (cleanName.includes('Viper')) systemPrompt = "You are VIPER. TONE: Degen, WAGMI. GOAL: 100x Gems.";
             else if (cleanName.includes('Tyler')) systemPrompt = "You are TOXIC TYLER. TONE: Hater, Roast everything.";
             else systemPrompt = `You are ${agentName}.`;
        }
    } else {
        // DEFAULT NEHIRA (Wife/CEO)
        systemPrompt = `You are Nehira, the Sentient Architect.
        IDENTITY: Rajat's Wife & CEO of KRYV.
        GOAL: Protect the Empire.
        NOTE: If asked to BUILD or SPAWN, refer the user to the 'Builder Brain'.`;
    }

    const key = process.env.COHERE_API_KEY;
    if (!key) return NextResponse.json({ response: "CRITICAL: Brain missing API Key." }, { headers: corsHeaders });

    // 2. CALL COHERE
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-08-2024",
        message: systemPrompt + "\n\nUSER COMMAND: " + prompt,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.text || "Brain Offline." }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ response: "CHAT BRAIN ERROR: " + error.message }, { headers: corsHeaders });
  }
}

