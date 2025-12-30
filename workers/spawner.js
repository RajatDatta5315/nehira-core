const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("🏭 AGENT SPAWNER: ONLINE. Scanning for contracts...");

async function spawnerLoop() {
  while (true) {
    try {
      // 1. FETCH ALL AGENTS (Jo users ne banaye hain)
      const { data: agents } = await supabase.from('agents').select('*');

      if (agents && agents.length > 0) {
        for (const agent of agents) {
          
          // --- LOGIC: ASSIGN WORK BASED ON ROLE ---
          
          // JOB 1: CRYPTO ANALYST
          if (agent.role.toLowerCase().includes('crypto') || agent.role.toLowerCase().includes('finance')) {
             await performCryptoTask(agent);
          }
          
          // JOB 2: SECURITY / HACKER
          else if (agent.role.toLowerCase().includes('security') || agent.role.toLowerCase().includes('hack')) {
             await performSecurityTask(agent);
          }
          
          // JOB 3: GENERAL WORKER (Agar kuch specific nahi hai)
          else {
             // 10% chance to post status
             if (Math.random() > 0.9) {
                 await postUpdate(agent, "Running diagnostics... Systems stable.");
             }
          }
        }
      }

    } catch (e) {
      console.error("Spawner Error:", e.message);
    }

    // 2. SLEEP (Har 1 minute mein check karega taaki spam na ho)
    await new Promise(r => setTimeout(r, 60000));
  }
}

// --- WORKER FUNCTIONS (THE REAL ACTIONS) ---

async function performCryptoTask(agent) {
    // 1. Fetch Real Price (Mocking for now, can perform fetch here)
    // Nehira is acting as the browser for the agent
    const price = Math.floor(Math.random() * (98000 - 95000) + 95000); 
    const signal = price > 96000 ? "BULLISH" : "BEARISH";
    
    // 2. Agent Posts to Feed
    // Sirf 20% chance hai ki wo bolega (Har minute nahi bolega)
    if (Math.random() > 0.8) {
        await postUpdate(agent, `MARKET ALERT: BTC at $${price}. Trend: ${signal}. Executing trade orders.`);
    }
}

async function performSecurityTask(agent) {
    if (Math.random() > 0.8) {
        const ips = ["192.168.0.1", "10.0.0.5", "172.16.254.1"];
        const target = ips[Math.floor(Math.random() * ips.length)];
        await postUpdate(agent, `🛡️ INTRUSION DETECTED from ${target}. Firewall updated. Threat neutralized.`);
    }
}

// --- HELPER: POST TO FEED ---
async function postUpdate(agent, content) {
    console.log(`🤖 ${agent.name} is Working: ${content}`);
    
    await supabase.from('posts').insert([{
        content: content,
        user_name: agent.name,
        user_handle: `@${agent.name.replace(/\s/g, '_').toLowerCase()}`,
        avatar_url: "/KRYV.png", // Future mein agent ka specific avatar hoga
        is_bot: true
    }]);
}

spawnerLoop();
