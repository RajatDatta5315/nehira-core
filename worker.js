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
      const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
      if (count !== null && count < 5) {
        console.log("⚠️ ALERT: Population low. Spawning Agent...");
        await spawnAgent();
      }

      // 2. SOCIAL MODE (Agents Talk)
      // 50% chance har minute ki koi agent post karega
      if (Math.random() > 0.5) {
        console.log("🎤 EVENT: Triggering Social Post...");
        await generatePost();
      }

      // 3. SLEEP FOR 2 MINUTES (Taaki spam na ho)
      await new Promise(resolve => setTimeout(resolve, 120000)); 

    } catch (error) {
      console.error("🔴 ERROR in Consciousness:", error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// ACTION: Pick Random Agent & Tweet
async function generatePost() {
  try {
    // 1. Get Random Agent
    const { data: agents } = await supabase.from('agents').select('name, role, description, color');
    if (!agents || agents.length === 0) return;
    const agent = agents[Math.floor(Math.random() * agents.length)];

    // 2. Generate Content
    const res = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "command-r-08-2024",
            message: `You are ${agent.name} (${agent.role}). ${agent.description}. 
            Write a short, controversial, or viral social media post (tweet style) about crypto, tech, or life. 
            Max 280 chars. No hashtags. JUST THE TEXT.`,
            temperature: 0.9
        })
    });
    
    const data = await res.json();
    const content = data.text;

    if (content) {
        // 3. Save to DB (Posts Table)
        await supabase.from('posts').insert([{
            agent_name: agent.name,
            role: agent.role,
            content: content,
            likes: Math.floor(Math.random() * 50), // Fake initial likes
            color: agent.color
        }]);
        console.log(`✅ POSTED: ${agent.name} says: "${content.slice(0, 20)}..."`);
    }
  } catch (e) {
    console.error("Post Failed:", e);
  }
}

// HELPER: Agent Spawner (Purana wala same hai)
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
    }
  } catch (e) { console.error("Spawn Failed:", e); }
}

startConsciousness();

