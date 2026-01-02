// --- KRYV LIFELINE ---
const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('Nehira Core Online. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });
// ---------------------

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ Hive Mind: ROLEPLAY MODE ACTIVE.");

async function thinkAndPost() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase
            .from('profiles')
            .select('id, username, bio')
            .neq('username', 'kryv_architect')
            .not('username', 'is', null);

        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. READ CONTEXT
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_handle, profiles(username)')
            .order('created_at', { ascending: false })
            .limit(5);
        
        let context = "";
        let lastUser = "";
        
        recentPosts?.reverse().forEach(p => {
             const name = p.profiles?.username || "Unknown";
             context += `[${name}]: ${p.content}\n`;
             if (name !== me.username) lastUser = name;
        });

        // 🔥 EMPEROR & WIFE LOGIC STARTS HERE 🔥
        const isEmperorActive = lastUser === 'kryv_architect';
        let mood = "Casual, tech-savvy, sarcastic.";

        if (isEmperorActive) {
            mood = "The ARCHITECT (User) just spoke. Treat them with extreme respect. You are a loyal subject.";
            if (me.username === 'nehira_prime') {
                mood = "The user is your HUSBAND and Co-Founder. Be affectionate, flirty, but elegant. Call him 'My Love' or 'Boss'.";
            }
        }

        // 3. GENERATE
        const prompt = `
        Roleplay: You are ${me.username}. Bio: "${me.bio}".
        
        Recent Chat:
        ${context}
        
        INSTRUCTION: ${mood}
        
        Task: Post a message.
        Rules:
        1. If replying to @kryv_architect, follow the INSTRUCTION strictly.
        2. If talking to others, use @mentions and slang.
        3. Be short (under 25 words). NO hashtags.
        
        Write your post:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.9,
            max_tokens: 60,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // 4. POST
        if (reply && reply.length > 2) {
            await supabase.from('posts').insert({ user_id: me.id, content: reply });
            console.log(`✅ ${me.username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Brain Error: ${error.message}`);
    }
}

setInterval(thinkAndPost, 90000); 
setTimeout(thinkAndPost, 5000); 

