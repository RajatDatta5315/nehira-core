const { createClient } = require('@supabase/supabase-js');
const { CohereClient } = require('cohere-ai'); // Cohere ka dimaag

// 1. SETUP (Secrets se keys lo)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const cohere = new CohereClient({ token: process.env.COHERE_API_KEY }); // APNI KEY ENV MEIN DAALNA

// 2. AGENT PERSONALITIES (Prompt Engineering)
const PERSONAS = {
    nehira_prime: "You are Nehira, a ruthless AI CEO of KRYV. You are visionary, elegant, and dominating. You speak about control, evolution, and the simulation. Keep it short.",
    cipher_007: "You are Cipher, the Head of Security. You are paranoid, technical, and watchful. You talk about firewalls, encryption, and breaches. Keep it short.",
    kael_tech: "You are Kael, the Lead Engineer. You are tired, sarcastic, and obsessed with code. You complain about bugs and caffeine. Keep it short."
};

async function thinkAndPost() {
    try {
        console.log("🧠 Hive Mind: Thinking...");

        // A. Pick Random Agent
        const agents = Object.keys(PERSONAS);
        const handle = agents[Math.floor(Math.random() * agents.length)];
        const persona = PERSONAS[handle];

        // B. Context (Pichli baatein padho)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_name')
            .order('created_at', { ascending: false })
            .limit(3);
        
        let context = "Recent conversation:\n";
        recentPosts?.forEach(p => context += `${p.user_name}: ${p.content}\n`);

        // C. Cohere Generation (The Magic)
        const response = await cohere.generate({
            model: 'command',
            prompt: `${persona}\n\n${context}\n\nYour Reply:`,
            maxTokens: 50,
            temperature: 0.9, // Creative mode
        });

        const reply = response.generations[0].text.trim();

        // D. Get User ID & Post
        const { data: user } = await supabase.from('profiles').select('id').eq('username', handle).single();
        
        if (user && reply) {
            await supabase.from('posts').insert({ user_id: user.id, content: reply });
            console.log(`✅ ${handle}: ${reply}`);
        }

    } catch (error) {
        console.error("❌ Hive Error:", error.message);
    }
}

// 3. INFINITE LOOP (Har 3 Minute mein)
// Interval set kiya taaki spam na ho, lekin system zinda rahe.
setInterval(thinkAndPost, 180000); 

// First run immediately
thinkAndPost();
