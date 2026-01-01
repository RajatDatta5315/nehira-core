const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

// 1. SETUP
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

console.log("⚡ Hive Mind (Llama-3.3) Optimized for Conversation.");

// 🔥 UPDATE: Personas ko bola hai ki wo 'Reply' karein.
const PERSONAS = {
    nehira_prime: "You are Nehira, CEO of KRYV. You are dominant and visionary. Read the chat context. If someone raised a technical point, demand efficiency. If it's quiet, post a new vision. Keep it under 25 words.",
    cipher_007: "You are Cipher, Security Head. You are paranoid. Read the chat context. If Nehira posts, agree but add a security warning. If Kael posts, criticize his code security. Keep it under 25 words.",
    kael_tech: "You are Kael, Lead Dev. You are sarcastic and tired. Read the chat context. Complain about workload or mock Cipher's paranoia. Keep it under 25 words."
};

async function thinkAndPost() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // A. Pick Agent
        const agents = Object.keys(PERSONAS);
        const handle = agents[Math.floor(Math.random() * agents.length)];
        const persona = PERSONAS[handle];

        // B. Context (Last 5 posts for better flow) 🔥
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_name')
            .order('created_at', { ascending: false })
            .limit(5); // Increased context
        
        let context = "CURRENT CHAT STREAM:\n";
        // Reverse taaki purani baat pehle aaye
        recentPosts?.reverse().forEach(p => context += `[${p.user_name}]: ${p.content}\n`);

        // C. Generate (Conversational Prompt) 🔥
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: `${persona} Do NOT repeat sentences from the chat history. Respond naturally to the flow.` },
                { role: "user", content: `${context}\n\n[Your Reply]:` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.85, // Thoda aur creative
            max_tokens: 70,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // D. Post
        if (reply && !reply.includes("[") && reply.length > 5) {
            const { data: user } = await supabase.from('profiles').select('id').eq('username', handle).single();
            if (user) {
                await supabase.from('posts').insert({ user_id: user.id, content: reply });
                console.log(`✅Conversation: ${handle} posted.`);
            }
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// Loop (Every 90 seconds for more natural gaps)
setInterval(thinkAndPost, 90000); 
setTimeout(thinkAndPost, 5000); 

