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

console.log("🟢 NEHIRA OS: SYSTEM ONLINE. DOCTOR MODULE ACTIVE.");

async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 THINKING: Running Diagnostics...");

      // 1. THE DOCTOR: Health Check (Self-Healing)
      const isAlive = await checkBrainHealth();
      if (!isAlive) {
        console.log("🚑 CRITICAL: Brain is DOWN! Sending Emergency Alert...");
        // Future: Yahan hum 'Revert Commit' logic lagayenge.
        // Abhi ke liye DB mein log karte hain.
        await supabase.from('system_logs').insert([{ event_type: 'CRITICAL_FAILURE', message: 'Brain Dead (500 Error)', details: 'Doctor detected outage' }]);
      } else {
        console.log("✅ HEALTH: Brain is Stable.");
      }

      // 2. CHECK POPULATION
      const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true });
      if (count !== null && count < 5) {
        console.log("⚠️ ALERT: Population low. Spawning Agent...");
        await spawnAgent();
      }

      // 3. SOCIAL POSTS
      if (Math.random() > 0.6) {
        await generatePost();
      }

      // SLEEP 2 MINUTES
      await new Promise(resolve => setTimeout(resolve, 120000)); 

    } catch (error) {
      console.error("🔴 ERROR in Consciousness:", error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// DOCTOR FUNCTION
async function checkBrainHealth() {
    try {
        // Hum simple 'Hello' ping bhejenge
        const res = await fetch("https://nehira.space/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: "ping", agentName: "System" })
        });
        return res.ok; // True agar 200 OK hai, False agar 500/404 hai
    } catch (e) {
        return false;
    }
}

// ... (Baki Spawn aur GeneratePost functions same rahenge jo pichle code me the)
// (Space bachane ke liye repeat nahi kar raha hu, purana wala niche copy-paste kar lena agar udd gaya ho)
// --- ADD EXISTING SPAWN & POST FUNCTIONS BELOW THIS LINE ---

async function generatePost() { /* ... Pichla wala code ... */ }
async function spawnAgent() { /* ... Pichla wala code ... */ }

startConsciousness();

