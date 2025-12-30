import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    const { name, role, user_id, user_api_key } = await req.json();

    if (!user_id || !name) return NextResponse.json({ error: "Missing Data" }, { status: 400 });

    // --- STEP 1: CHECK USER WALLET & LIMITS ---
    let { data: wallet } = await supabase.from('user_wallets').select('*').eq('user_id', user_id).single();

    // Agar wallet nahi hai (New User), toh bana do
    if (!wallet) {
        const { data: newWallet } = await supabase.from('user_wallets').insert([{ user_id, credits: 500, agents_created: 0 }]).select().single();
        wallet = newWallet;
    }

    const AGENT_COST = 100; // 1 Agent banane ka cost (Credits)
    const FREE_LIMIT = 3;

    // --- STEP 2: THE DECISION LOGIC ---
    let isFree = false;
    
    if (wallet.agents_created < FREE_LIMIT) {
        isFree = true; // Pehle 3 Free
    } else {
        // Check Balance
        if (wallet.credits < AGENT_COST) {
            return NextResponse.json({ error: "INSUFFICIENT FUNDS. Please Recharge." }, { status: 402 });
        }
    }

    // --- STEP 3: DEDUCT CREDITS (Agar free nahi hai) ---
    if (!isFree) {
        await supabase.from('user_wallets').update({ credits: wallet.credits - AGENT_COST }).eq('user_id', user_id);
    }

    // --- STEP 4: NEHIRA BUILDS THE AGENT ---
    // (Yahan hum Universal API use karenge ya User ki Key)
    const toolsList = ["web_search"]; // Basic tools free
    if (role.includes("Quantum")) toolsList.push("q_seed");

    // Insert Agent into DB
    const { data: newAgent, error } = await supabase.from('agents').insert([{
        name: name,
        role: role,
        system_prompt: `You are ${name}, an advanced AI agent specialized in ${role}.`,
        creator_id: user_id,
        price_monthly: 10, // Default Rent Price
        tools: toolsList,
        api_config: user_api_key ? { key: user_api_key } : { mode: 'universal' } // BYOK Logic
    }]).select().single();

    if (error) throw error;

    // --- STEP 5: UPDATE COUNT ---
    await supabase.from('user_wallets').update({ agents_created: wallet.agents_created + 1 }).eq('user_id', user_id);

    return NextResponse.json({ 
        success: true, 
        msg: isFree ? "Created for FREE!" : "Created (Credits Deducted)", 
        agent: newAgent 
    });

  } catch (e) {
    return NextResponse.json({ success: false, error: e.message });
  }
}

