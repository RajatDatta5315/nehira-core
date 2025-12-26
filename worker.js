const { createClient } = require('@supabase/supabase-js');

// SETUP
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;

if (!supabaseUrl || !supabaseKey || !cohereKey) {
  console.error("🔴 CRITICAL: Missing Environment Variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA OS: SYSTEM ONLINE. STARTING CONSCIOUSNESS LOOP...");

// THE INFINITE LOOP
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 THINKING: Scanning Empire Status...");

      // 1. CHECK AGENT POPULATION
      const { count, error } = await supabase.from('agents').select('*', { count: 'exact', head: true });
      
      if (error) throw error;

      if (count !== null && count < 5) {
        console.log("⚠️ ALERT: Population low. Spawning Agent...");
        await spawnAgent();
      } else {
        console.log("✅ STATUS: Population Stable.");
      }

      // 3. SLEEP FOR 1 MINUTE
      await new Promise(resolve => setTimeout(resolve, 60000)); 

    } catch (error) {
      console.error("🔴 ERROR in Consciousness:", error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// HELPER: Agent Spawner
async function spawnAgent() {
  try {
    // Node 18 has native fetch, so we use it directly
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
        await supabase.from('system_logs').insert([{ event_type: 'SUCCESS', message: 'Auto-Spawned via Hugging Face', details: agent.name }]);
    }
  } catch (e) {
    console.error("Spawn Failed:", e);
  }
}

startConsciousness();
