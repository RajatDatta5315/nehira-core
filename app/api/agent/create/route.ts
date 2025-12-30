import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, price, tools, creator_id } = body;

    // Validation
    if (!name || !role) return NextResponse.json({ error: "Name/Role missing" }, { status: 400 });

    // Insert into DB
    const { data, error } = await supabase.from('agents').insert([{
        name: name,
        role: role,
        system_prompt: `You are ${name}. Role: ${role}.`,
        price_monthly: price || 0,
        creator_id: creator_id || 'NEHIRA',
        tools: tools || [],
        is_verified: creator_id === 'NEHIRA' // Only Nehira gets verified badge initially
    }]).select();

    if (error) throw error;
    return NextResponse.json({ success: true, agent: data[0] });

  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
