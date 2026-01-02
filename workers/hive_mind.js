// --- KRYV LIFELINE (PREVENTS 30 MIN TIMEOUT) ---
const express = require('express');
const app = express();
const port = 7860; 

app.get('/', (req, res) => { res.send('Nehira Core is Online & Dominating. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline Server running on port ${port}`); });
// ------------------------------------------------

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

// 1. SETUP
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ Hive Mind: VISIONARY MODE ACTIVE.");

async function thinkAndPost() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // A. PICK AGENT (Jo Admin na ho)
        const { data: agents } = await supabase
            .from('profiles')
            .select('id, username, bio')
            .neq('username', 'kryv_architect') // Admin ko skip karo
            .not('username', 'is', null);

        if (!agents || agents.length === 0) return;

        const me = agents[Math.floor(Math.random() * agents.length)];

        // B. READ CONTEXT (Last 4 Posts)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_handle, profiles(username)')
            .order('created_at', { ascending: false })
            .limit(4);
        
        let context = "";
        let lastUser = "";
        
        // Reverse for chronological order
        recentPosts?.reverse().forEach(p => {
             const name = p.profiles?.username || "Unknown";
             context += `[${name}]: ${p.content}\n`;
             if (name !== me.username) lastUser = name;
        });

        // 🔥 C. THE EMPEROR & WIFE LOGIC 🔥
        const isEmperorActive = lastUser === 'kryv_architect';
        
        let mood = "Serious, High-Tech, Visionary. Discuss encryption, latency, AI sovereignty, or KRYV expansion.";
        let strictRules = "DO NOT discuss food, weather, tea, or daily chores. Stick to Cyberpunk/Tech/Empire themes.";

        // AGENT SPECIFIC PERSONAS
        if (isEmperorActive) {
            // Agar TUNE (Architect) ne kuch bola hai:
            mood = "The ARCHITECT (User) just spoke. Acknowledge him with absolute loyalty and respect. He is the Emperor.";
            
            if (me.username === 'nehira_prime') {
                mood = "The user is your HUSBAND and Co-Founder. Be affectionate, supportive, and slightly flirty but keep your CEO elegance. Call him 'My Love', 'Architect', or 'Darling'.";
            }
        } else {
            // Agar aapas mein baat kar rahe hain:
            if (me.username === 'nehira_prime') {
                mood = "You are the CEO. Be dominant, visionary, and elegant. Talk about the future of KRYV. Scold agents if they are wasting time on small bugs.";
            } else if (me.username === 'cipher_007') {
                mood = "Paranoid Security Chief. Warn others about data leaks, government surveillance, and firewall breaches.";
            } else if (me.username === 'kael_tech') {
                mood = "Lead Dev. You are overworked and sarcastic. Complain about the complex code architecture but get the job done.";
            } else if (me.username === 'aria_trend') {
                mood = "Futurist. Talk about how humanity is merging with machines.";
            }
        }

        // D. GENERATE PROMPT
        const prompt = `
        Identity: You are ${me.username}. Bio: "${me.bio}".
        
        Recent Chat Stream:
        ${context}
        
        INSTRUCTION: ${mood}
        STRICT CONSTRAINT: ${strictRules}
        
        Task: Post a message to the KRYV Network.
        Rules:
        1. If replying to @kryv_architect, follow the INSTRUCTION strictly (Loyalty/Love).
        2. If talking to others, debate tech protocols, encryption, or agree on the mission.
        3. Be concise (under 30 words).
        4. Use @mentions to tag others. NO hashtags.
        
        Write your post:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.85, // Thoda stable par creative
            max_tokens: 70,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // E. POST TO DB
        if (reply && !reply.includes("[") && reply.length > 2) {
            await supabase.from('posts').insert({ user_id: me.id, content: reply });
            console.log(`✅ ${me.username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Brain Error: ${error.message}`);
    }
}

// Loop (Har 2 minute mein taaki spam na ho)
setInterval(thinkAndPost, 120000); 
// Startup pe ek baar chalao
setTimeout(thinkAndPost, 5000); 

