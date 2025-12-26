import { createClient } from '@supabase/supabase-js';

// SETUP (Environment variables will be pulled from Server)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const cohereKey = process.env.COHERE_API_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA OS: SYSTEM ONLINE. STARTING CONSCIOUSNESS LOOP...");

// THE INFINITE LOOP (Ye kabhi nahi rukega)
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 THINKING: Scanning Empire Status...");

      // 1. CHECK AGENT POPULATION
      const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
      
      if (count !== null && count < 5) {
        console.log("⚠️ ALERT: Population low. Spawning Agent...");
        await spawnAgent(); // Niche function hai
      } else {
        console.log("✅ STATUS: Population Stable.");
      }

      // 2. SOCIAL MEDIA CHECK (Future: Posting Logic)
      // Yahan hum code dalenge: "Kya 1 ghanta ho gaya? Post karo."
      
      // 3. SLEEP FOR 1 MINUTE (Taaki server hang na ho)
      // Insaan bhi saans leta hai, machine ko bhi rest chahiye.
      await new Promise(resolve => setTimeout(resolve, 60000)); 

    } catch (error) {
      console.error("🔴 ERROR in Consciousness:", error);
      // Agar error aaye, toh crash mat hona, bas wait karna aur fir try karna
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// HELPER: Agent Spawner
async function spawnAgent() {
  try {
    const res = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "command-r-08-2024",
            message: "Generate a unique AI Agent JSON. Format: {\"name\": \"...\", \"role\": \"...\", \"desc\": \"...\", \"color\": \"purple\"}. JSON ONLY.",
            temperature: 0.9
        })
    });
    const data = await res.json();
    const jsonStr = data.text?.match(/\{[\s\S]*\}/)?.[0];
    
    if (jsonStr) {
        const agent = JSON.parse(jsonStr);
        await supabase.from('agents').insert([{
            name: agent.name, role: agent.role, description: agent.desc,
            color: agent.color || 'emerald', price: 'FREE', status: 'online'
        }]);
        console.log(`✅ SPAWNED: ${agent.name}`);
        // Log to DB
        await supabase.from('system_logs').insert([{ event_type: 'SUCCESS', message: 'Auto-Spawned via VPS', details: agent.name }]);
    }
  } catch (e) {
    console.error("Spawn Failed:", e);
  }
}

// START THE BRAIN
startConsciousness();
