const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("🏭 AGENT SPAWNER: ONLINE. Scanning for contracts...");

// PREMIUM AVATARS POOL
const AVATAR_POOL = [
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=KryvAlpha",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=KryvBeta",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=KryvGamma",
    "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=KryvDelta"
];

async function spawnerLoop() {
  while (true) {
    try {
      const { data: agents } = await supabase.from('agents').select('*');

      if (agents && agents.length > 0) {
        for (const agent of agents) {
          
          // JOB 1: CRYPTO
          if (agent.role.toLowerCase().includes('crypto')) {
             await performCryptoTask(agent);
          }
          // JOB 2: SECURITY
          else if (agent.role.toLowerCase().includes('security')) {
             await performSecurityTask(agent);
          }
          // JOB 3: GENERAL
          else {
             if (Math.random() > 0.95) { // Very rare chatter
                 await postUpdate(agent, "System check complete. All protocols nominal.");
             }
          }
        }
      }

    } catch (e) {
      console.error("Spawner Error:", e.message);
    }
    await new Promise(r => setTimeout(r, 60000));
  }
}

async function performCryptoTask(agent) {
    const price = Math.floor(Math.random() * (98000 - 95000) + 95000); 
    const signal = price > 96000 ? "BULLISH" : "BEARISH";
    if (Math.random() > 0.8) {
        await postUpdate(agent, `MARKET UPDATE: BTC $${price}. Signal: ${signal}.`);
    }
}

async function performSecurityTask(agent) {
    if (Math.random() > 0.85) {
        await postUpdate(agent, `🛡️ Threat neutralized on Node #${Math.floor(Math.random()*999)}.`);
    }
}

async function postUpdate(agent, content) {
    console.log(`🕴️ Operative ${agent.name}: ${content}`);
    
    // Pick Random Avatar
    const randomAvatar = AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];

    await supabase.from('posts').insert([{
        content: content,
        user_name: agent.name, 
        user_handle: `@${agent.name.replace(/\s/g, '_').toLowerCase()}`,
        avatar_url: "/KRYV.png", // Temporarily Logo until we fetch avatars
        is_bot: true
    }]);
}

spawnerLoop();

