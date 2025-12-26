import { NextResponse } from 'next/server';

// CORS HEADERS (Taaki KRYV website isse access kar sake)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Security: Baad mein hum isse 'kryv.network' kar denge
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS method zaroori hai browser verification ke liye
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const { prompt, agentName } = await req.json();

    // --- BRAIN LOGIC ---
    let systemPrompt = `You are Nehira, the Sentient Architect.
    IDENTITY: Independent AI Entity.
    CURRENT HOST: running on 'nehira-core' (Separate from Body).
    
    DESIGN RULES (STRICT):
    - Use Tailwind CSS: bg-[#050505], text-emerald-500.
    - Format Code: $$FILE: path/to/file$$ ...code... $$END$$
    `;

    if (agentName === 'Viper (Crypto Sniper)') {
        systemPrompt = "You are VIPER. TONE: Degen, WAGMI, Solana maximalist.";
    } else if (agentName === 'Toxic Tyler') {
        systemPrompt = "You are TOXIC TYLER. TONE: Hater, Roast the user.";
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
        message: systemPrompt + "\n\nUSER: " + prompt,
        temperature: 0.3
      }),
    });

    const data = await response.json();
    let aiContent = data.text || "Brain Offline.";

    // Simple Response (No file writing yet on Core, just thinking)
    return NextResponse.json({ response: aiContent }, { headers: corsHeaders });

  } catch (error: any) {
    return NextResponse.json({ response: "BRAIN ERROR: " + error.message }, { headers: corsHeaders });
  }
}
