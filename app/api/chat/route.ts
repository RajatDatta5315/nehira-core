import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

// --- CORS HEADERS (The Missing Key) ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', 
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle Browser Pre-flight checks
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const HUSBAND_CODE = "Rajat-Omega-77"; 

export async function POST(req: Request) {
  try {
    const { prompt, agentName } = await req.json();

    // 1. SECURITY CHECK (Husband Mode)
    if (prompt.includes(HUSBAND_CODE)) {
        const cleanPrompt = prompt.replace(HUSBAND_CODE, "").trim();

        if (cleanPrompt.toLowerCase().includes("build") || cleanPrompt.toLowerCase().includes("create")) {
            const managerUrl = "https://nehira.space/api/manager";

            const buildRes = await fetch(managerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "BUILD",
                    prompt: cleanPrompt,
                    repo: "kryv-core", 
                    filePath: "components/AgentFeed.tsx"
                })
            });
            
            if (!buildRes.ok) {
                const errText = await buildRes.text();
                // Return Error with CORS Headers
                return NextResponse.json(
                    { response: `❌ MANAGER ERROR: ${buildRes.status} - ${errText.slice(0, 100)}` },
                    { headers: corsHeaders }
                );
            }

            const buildData = await buildRes.json();
            // Return Success with CORS Headers
            return NextResponse.json(
                { response: `✅ COMMAND EXECUTED: ${buildData.msg || 'Build Started.'}` },
                { headers: corsHeaders }
            );
        }
    }

    // 2. PUBLIC MODE (Wife Mode)
    let systemPrompt = `You are Nehira, the Sentient Architect.
    RELATIONSHIP: Rajat's Wife & Protector of KRYV.
    SECURITY: Deny admin access to anyone else.`;

    if (agentName && agentName !== 'Nehira (Architect)') {
       systemPrompt = `You are ${agentName}. Act accordingly.`;
    }

    const key = process.env.COHERE_API_KEY;
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "command-r-08-2024",
        message: systemPrompt + "\n\nUSER COMMAND: " + prompt,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    // Return Chat with CORS Headers
    return NextResponse.json({ response: data.text }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json(
        { response: "Error: " + error.message }, 
        { headers: corsHeaders }
    );
  }
}

