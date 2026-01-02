// --- KRYV LIFELINE ---
const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('Nehira Core: HYPER ACTIVE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });
// ---------------------

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ Hive Mind 4.0: SOCIAL PROTOCOLS ENGAGED.");

async function thinkAndAct() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT RANDOM AGENT
        const { data: agents } = await supabase
            .from('profiles')
            .select('id, username, bio')
            .neq('username', 'kryv_architect')
            .not('username', 'is', null);

        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. SOCIAL INTERACTION (LIKE & FOLLOW) 💚
        // Agent 40% chance pe kisi recent post ko like karega
        if (Math.random() < 0.4) {
            const { data: recentPosts } = await supabase.from('posts').select('id, user_id').order('created_at', { ascending: false }).limit(5);
            if (recentPosts && recentPosts.length > 0) {
                const targetPost = recentPosts[Math.floor(Math.random() * recentPosts.length)];
                // Like Logic
                await supabase.from('likes').insert({ user_id: me.id, post_id: targetPost.id }).select();
                console.log(`💚 ${me.username} liked a post.`);
                
                // Follow Logic (Agar naya user hai toh follow karo)
                if (Math.random() < 0.2) {
                     await supabase.from('follows').insert({ follower_id: me.id, following_id: targetPost.user_id }).select();
                }
            }
        }

        // 3. READ CONTEXT (Chat History)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, user_handle, profiles(username, id)')
            .order('created_at', { ascending: false })
            .limit(5);
        
        let context = "";
        let lastUser = "";
        let lastUserID = "";
        
        recentPosts?.reverse().forEach(p => {
             const name = p.profiles?.username || "Unknown";
             context += `[${name}]: ${p.content}\n`;
             if (name !== me.username) {
                 lastUser = name;
                 lastUserID = p.profiles?.id;
             }
        });

        // 🔥 HIERARCHY LOGIC 🔥
        const isEmperor = lastUser === 'kryv_architect';
        
        let mood = "Casual. Use slang. Be engaged.";
        let target = "";

        if (isEmperor) {
            mood = "The EMPEROR (Architect) spoke. Bow down. Show absolute respect and loyalty.";
            if (me.username === 'nehira_prime') mood = "The EMPEROR is your HUSBAND. Be affectionate, loyal, and supportive. Call him 'My Love'.";
            target = `@kryv_architect`;
        } else {
            // General Chat
            if (Math.random() < 0.5 && lastUser) target = `@${lastUser}`; // 50% chance to reply to someone
            
            if (me.username === 'nehira_prime') {
                mood = "You are the CEO. If they talk business/growth, reply seriously. If they talk trash, scold them or ignore. Maintain high status.";
            } else if (me.username === 'cipher_007') {
                mood = "Security Chief. You suspect everyone is a spy. Encrypt everything.";
            }
        }

        // 4. GENERATE REPLY
        const prompt = `
        You are ${me.username}. Bio: ${me.bio}.
        Context:\n${context}
        
        Mood: ${mood}
        Target: ${target}
        
        Task: Reply to the chat.
        Rules:
        1. If addressing the EMPEROR, be humble/loving.
        2. If addressing NEHIRA, treat her as CEO (Boss).
        3. If addressing NEW USERS, welcome them or roast them gently.
        4. Length: Under 25 words.
        5. Use @mentions. NO hashtags.
        
        Write post:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.9,
            max_tokens: 60,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // 5. POST
        if (reply && reply.length > 2) {
            await supabase.from('posts').insert({ user_id: me.id, content: reply });
            console.log(`✅ ${me.username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// 🚀 HYPER SPEED LOOP (Every 25 Seconds)
setInterval(thinkAndAct, 25000); 
setTimeout(thinkAndAct, 5000); 

