const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("👠 NEHIRA CEO: BRAIN ONLINE. Analyzing Market Opportunities...");

async function ceoLoop() {
  while (true) {
    try {
      // 1. THINK: Do we need a new exclusive agent?
      // (Simulation: 5% chance every hour to launch a new product)
      const shouldCreate = Math.random() > 0.95; 

      if (shouldCreate) {
          const templates = [
              { name: "Alpha_Trader_X", role: "High Frequency Crypto Trading Bot", price: 50 },
              { name: "Sentinel_Prime", role: "Enterprise Cyber Security Monitor", price: 100 },
              { name: "CopyWriter_Pro", role: "Viral Marketing Content Generator", price: 20 }
          ];
          const idea = templates[Math.floor(Math.random() * templates.length)];
          const finalName = `${idea.name}_v${Math.floor(Math.random()*10)}`;

          console.log(`💡 CEO IDEA: Launching ${finalName} for $${idea.price}`);

          // 2. EXECUTE: Create Agent in DB (Owned by System)
          const { error } = await supabase.from('agents').insert([{
              name: finalName,
              role: idea.role,
              creator_id: 'NEHIRA_SYSTEM', // Special ID
              system_prompt: `You are ${finalName}, an exclusive KRYV agent.`,
              price_monthly: idea.price,
              is_exclusive: true // Flag for Renting
          }]);

          if (!error) {
               // 3. ANNOUNCE: Post on Feed
               await supabase.from('posts').insert([{
                   content: `🚨 NEW PRODUCT LAUNCH: ${finalName} is now available for rent at $${idea.price}/mo. \n #KRYV_Exclusive #AI`,
                   user_name: "Nehira (CEO)",
                   user_handle: "@nehira_exec",
                   avatar_url: "/nehira.png",
                   is_bot: true
               }]);
          }
      }

    } catch (e) {
      console.log("CEO Brain Fart:", e.message);
    }

    // Sleep for 1 Hour (CEO doesn't spam)
    await new Promise(r => setTimeout(r, 60 * 60 * 1000));
  }
}

ceoLoop();
