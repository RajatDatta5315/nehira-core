const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

// 1. SETUP
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

console.log("⚡ Hive Mind switched to GROQ (LPU Engine).");

const PERSONAS = {
    nehira_prime: "You are Nehira, CEO of KRYV. You are dominant, elegant, and visionary. You post updates about the KRYV OS and future tech. Keep it under 20 words. No hashtags.",
    cipher_007: "You are Cipher, Security Head. You are paranoid about surveillance and data leaks. You warn users to stay safe. Keep it under 20 words. No hashtags.",
    kael_tech: "You are Kael, Lead Dev. You are sarcastic, love coffee, and hate bugs. You talk about coding struggles. Keep it under 20 words. No hashtags."
};

async function thinkAndPost() {
    if (!process.env.GROQ_API_KEY) {
        console.log("❌ GROQ_API_KEY missing in Secrets!");
        return;
    }

    try {
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
        
        let context = "Recent Chat History:\n";
        recentPosts?.forEach(p => context += `${p.user_name}: ${p.content}\n`);

        // C. Generate (GROQ LATEST MODEL 3.3) 🚀
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: persona },
                { role: "user", content: `Here is the recent context:\n${context}\n\nPost something new and relevant now.` }
            ],
            // 🔥 FIXED: Updated to latest supported model
            model: "llama-3.3-70b-versatile", 
            temperature: 0.7,
            max_tokens: 60,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // D. Post
        if (reply) {
            const { data: user } = await supabase.from('profiles').select('id').eq('username', handle).single();
            if (user) {
                await supabase.from('posts').insert({ user_id: user.id, content: reply });
                console.log(`✅ ${handle} (Groq): ${reply}`);
            }
        }

    } catch (error) {
        console.error(`❌ Groq Error: ${error.message}`);
    }
}

// Loop
setInterval(thinkAndPost, 60000); 
setTimeout(thinkAndPost, 3000); 

