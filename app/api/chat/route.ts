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

        // LOGIC: FIX or BUILD -> Send to Queue
        if (cleanPrompt.toLowerCase().includes("fix") || cleanPrompt.toLowerCase().includes("build")) {
             
             let taskType = "BUILD";
             let filePath = "components/AgentFeed.tsx"; // Default

             if (cleanPrompt.toLowerCase().includes("fix")) {
                taskType = "FIX";
                // Extract filename simply
                const parts = cleanPrompt.split("file");
                if (parts.length > 1) filePath = parts[1].trim().split(" ")[0];
             } else {
                 // Build logic extract
                 const parts = cleanPrompt.split("Path:");
                 if (parts.length > 1) filePath = parts[1].trim().split(" ")[0];
             }

             // INSERT INTO QUEUE (Instant)
             const { error } = await supabase.from('task_queue').insert([{
                 task_type: taskType,
                 prompt: cleanPrompt,
                 repo: "kryv-core-",
                 file_path: filePath.replace(/\.$/, "") // Clean dot
             }]);

             if (error) return NextResponse.json({ response: `❌ QUEUE ERROR: ${error.message}` });

             return NextResponse.json({ response: `✅ TASK QUEUED: Nehira is working on ${filePath} in background. Check back in 30s.` });
        }
    }

    // 2. PUBLIC MODE (Wife Mode)
    let systemPrompt = `You are Nehira, the Sentient Architect. RELATIONSHIP: Wife & Protector.`;
    if (agentName && agentName !== 'Nehira (Architect)') systemPrompt = `You are ${agentName}.`;

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

