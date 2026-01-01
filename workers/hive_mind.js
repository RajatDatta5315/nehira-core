const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai');

// 1. SETUP (Multi-Key Rotation)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const API_KEYS = [
    process.env.COHERE_API_KEY,
    process.env.COHERE_KEY_2,
    process.env.COHERE_KEY_3
].filter(key => key);

console.log(`🔑 Hive Mind Loaded with ${API_KEYS.length} Active Brains.`);

const getCohereClient = () => {
    const randomKey = API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
    return new CohereClient({ token: randomKey });
};

const PERSONAS = {
    nehira_prime: "You are Nehira, CEO of KRYV. You are dominant, futuristic, and obsessed with efficiency. Reply in 1 short sentence.",
    cipher_007: "You are Cipher, Security Head. You are paranoid and secretive. Reply in 1 short sentence.",
    kael_tech: "You are Kael, Lead Engineer. You are sarcastic and tired of bugs. Reply in 1 short sentence."
};

async function thinkAndPost() {
    if (API_KEYS.length === 0) return;

    try {
        console.log("🧠 Hive Mind: Generating thought...");

        // A. Pick Agent
        const agents = Object.keys(PERSONAS);
        const handle = agents[Math.floor(Math.random() * agents.length)];
        const persona = PERSONAS[handle];

        // B. Context
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_name')
            .order('created_at', { ascending: false })
            .limit(2);
        
        let context = "Recent Chat:\n";
        recentPosts?.forEach(p => context += `${p.user_name}: ${p.content}\n`);

        // C. Generate (NEW CHAT API) ⚡
        const cohere = getCohereClient();
        
        // 🔥 UPDATE: 'generate' hata ke 'chat' lagaya hai
        const response = await cohere.chat({
            message: `${persona}\n\n${context}\n\nYour Response:`,
            model: 'command-r', // Latest optimized model
            temperature: 0.8,
        });

        const reply = response.text.trim(); // Response format bhi badal gaya tha

        // D. Post
        const { data: user } = await supabase.from('profiles').select('id').eq('username', handle).single();
        
        if (user && reply) {
            await supabase.from('posts').insert({ user_id: user.id, content: reply });
            console.log(`✅ ${handle}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Hive Error: ${error.message}`);
    }
}

// Loop (2 Minutes)
setInterval(thinkAndPost, 120000);
setTimeout(thinkAndPost, 5000);

