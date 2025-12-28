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

    // 1. ADMIN COMMANDS (Database Injection)
    if (prompt.includes(HUSBAND_CODE)) {
        const cleanPrompt = prompt.replace(HUSBAND_CODE, "").trim();
        let taskType = "";
        
        // Strict Command Detection
        if (cleanPrompt.toLowerCase().includes("fix")) taskType = "FIX";
        else if (cleanPrompt.toLowerCase().includes("build")) taskType = "BUILD";
        else if (cleanPrompt.toLowerCase().includes("deploy")) taskType = "DEPLOY";
        else if (cleanPrompt.toLowerCase().includes("vision")) taskType = "VISION";
        else if (cleanPrompt.toLowerCase().includes("quantum")) taskType = "QUANTUM_RUN";

        if (taskType && supabase) {
             let filePath = "components/AgentFeed.tsx";
             const parts = cleanPrompt.split("file");
             if (parts.length > 1) filePath = parts[1].trim().split(" ")[0];

             const { error } = await supabase.from('task_queue').insert([{
                 task_type: taskType,
                 prompt: cleanPrompt,
                 repo: "kryv-core-", // Default to Web Empire
                 file_path: filePath.replace(/\.$/, "")
             }]);
             
             if (error) throw error;
             return NextResponse.json({ response: `🚀 NEHIRA: Command ${taskType} queued successfully.` });
        }
    }

    // 2. NORMAL CHAT (AI Response)
    let systemPrompt = `You are Nehira, the Architect.`;
    if (agentName) systemPrompt = `You are ${agentName}.`;

    const key = process.env.COHERE_API_KEY;
    if (!key) return NextResponse.json({ response: "AI Key Missing" });

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
          model: "command-r-08-2024", 
          message: systemPrompt + "\n\nUSER: " + prompt, 
          temperature: 0.7 
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.text || "Nehira is thinking..." });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ response: "SYSTEM ERROR: " + error.message });
  }
}

