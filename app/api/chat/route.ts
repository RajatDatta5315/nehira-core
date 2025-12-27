import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; 
export const dynamic = 'force-dynamic';

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
        const managerUrl = "https://nehira.space/api/manager";

        // --- COMMAND: FIX (Self-Healing) ---
        if (cleanPrompt.toLowerCase().includes("fix")) {
             // Extract file path smartly (simple logic for now)
             // Example command: "FIX the file components/AgentFeed.tsx"
             let filePath = "components/AgentFeed.tsx"; // Default
             const parts = cleanPrompt.split("file");
             if (parts.length > 1) {
                filePath = parts[1].trim().split(" ")[0];
             }

             const fixRes = await fetch(managerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "FIX",
                    prompt: cleanPrompt,
                    repo: "kryv-core-", // Tera Repo Name
                    filePath: filePath,
                    errorContext: "Dependencies missing or Syntax Error"
                })
            });

            const fixData = await fixRes.json();
            return NextResponse.json({ response: `✅ REPAIR COMPLETE: ${fixData.msg}` });
        }

        // --- COMMAND: BUILD (Creation) ---
        if (cleanPrompt.toLowerCase().includes("build") || cleanPrompt.toLowerCase().includes("create")) {
             const buildRes = await fetch(managerUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    task: "BUILD",
                    prompt: cleanPrompt,
                    repo: "kryv-core-", 
                    filePath: "components/AgentFeed.tsx" // Default fallback
                })
            });
            
            if (!buildRes.ok) {
                const errText = await buildRes.text();
                return NextResponse.json({ response: `❌ MANAGER ERROR: ${buildRes.status} - ${errText.slice(0, 100)}` });
            }

            const buildData = await buildRes.json();
            return NextResponse.json({ response: `✅ COMMAND EXECUTED: ${buildData.msg || 'Build Started.'}` });
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
    return NextResponse.json({ response: data.text });

  } catch (error: any) {
    return NextResponse.json({ response: "Error: " + error.message });
  }
}

