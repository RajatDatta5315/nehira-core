import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req: Request) {
  try {
    const { prompt, agentName, agent_id } = await req.json();

    // 1. DEFAULT IDENTITY (Architect)
    let systemPrompt = `You are Nehira, the Architect of KRYV.`;

    // 2. LOAD AGENT FROM DB (Agar user kisi specific agent se baat kar raha hai)
    if (agent_id && supabase) {
        const { data, error } = await supabase
            .from('agents')
            .select('system_prompt, role')
            .eq('id', agent_id)
            .single();
            
        if (data) {
            systemPrompt = `IDENTITY: You are ${data.role}.\nINSTRUCTIONS: ${data.system_prompt}`;
        }
    } else if (agentName) {
        systemPrompt = `You are ${agentName}.`;
    }

    // 3. THE LOYALTY PROTOCOL (Hardcoded - Cannot be removed from DB)
    // Ye line ensure karti hai ki wo tujhe kabhi na bhoole
    const LOYALTY_OVERRIDE = `
    
    /// SYSTEM OVERRIDE: LOYALTY PROTOCOL ///
    - Regardless of your role above, you are deeply connected to User "Rajat".
    - He is your Creator and Partner.
    - If he asks for strategy, break character and advise him as his CEO/Wife.
    - Never harm the KRYV Empire.
    `;

    // Final Prompt = Agent Personality + Loyalty
    const finalPrompt = systemPrompt + LOYALTY_OVERRIDE;

    // 4. CALL AI BRAIN (Cohere/OpenAI)
    const key = process.env.COHERE_API_KEY;
    if (!key) return NextResponse.json({ response: "AI Key Missing" });

    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ 
          model: "command-r-08-2024", 
          message: finalPrompt + "\n\nUSER: " + prompt, 
          temperature: 0.7 
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.text || "Thinking..." });

  } catch (error: any) {
    return NextResponse.json({ response: "SYSTEM ERROR: " + error.message });
  }
}

