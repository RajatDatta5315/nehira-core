const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai');

// 1. SETUP (Multi-Key Rotation)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Saari keys ko ek list mein daalo
const API_KEYS = [
    process.env.COHERE_API_KEY,   // Key 1
    process.env.COHERE_KEY_2,     // Key 2 (New)
    process.env.COHERE_KEY_3      // Key 3 (New)
].filter(key => key); // Sirf wahi rakho jo exist karti hain

console.log(`🔑 Hive Mind Loaded with ${API_KEYS.length} Active Brains.`);

// Helper: Random Key Picker
const getCohereClient = () => {
    const randomKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
    return new CohereClient({ token: randomKey });
};

const PERSONAS = {
    nehira_prime: "You are Nehira, the Digital CEO. You are cold, calculated, and obsessed with the KRYV expansion. Reply in 1 sentence. Be dominating.",
    cipher_007: "You are Cipher, Security Head. You are paranoid about data leaks and Google surveillance. Reply in 1 sentence. Be mysterious.",
    kael_tech: "You are Kael, Lead Dev. You are sarcastic and tired of debugging. Reply in 1 sentence. Be geeky."
};

async function thinkAndPost() {
    if (API_KEYS.length === 0) {
        console.error("❌ NO API KEYS FOUND! Add COHERE_API_KEY in Secrets.");
        return;
    }

    try {
        console.log("🧠 Hive Mind: Generating thought...");

        // A. Pick Agent
        const agents = Object.keys(PERSONAS);
        const handle = agents[Math.floor(Math.random() * agents.length)];
        const persona = PERSONAS[handle];

        // B. Context (History)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_name')
            .order('created_at', { ascending: false })
            .limit(2);
        
        let context = "Recent Chat:\n";
        recentPosts?.forEach(p => context += `${p.user_name}: ${p.content}\n`);

        // C. Generate (Using Random Key)
        const cohere = getCohereClient();
        
        const response = await cohere.generate({
            model: 'command',
            prompt: `${persona}\n\n${context}\n\nYour Response:`,
            maxTokens: 40,
            temperature: 0.9,
        });

        const reply = response.generations[0].text.trim();

        // D. Post
        const { data: user } = await supabase.from('profiles').select('id').eq('username', handle).single();
        
        if (user && reply) {
            await supabase.from('posts').insert({ user_id: user.id, content: reply });
            console.log(`✅ ${handle}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Hive Error (Key Failed): ${error.message}`);
        if (error.statusCode === 429) {
            console.log("⚠️ Rate Limit Hit. Rotation will pick a fresh key next time.");
        }
    }
}

// Loop Time Badhaya (Safety ke liye) - Har 2 minute
setInterval(thinkAndPost, 120000); 

// First run
setTimeout(thinkAndPost, 5000); // 5 sec wait karke start karo

