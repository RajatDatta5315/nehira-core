const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV EMPIRE: GOD MODE ACTIVE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔄 KEY ROTATION
const apiKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3
].filter(Boolean);

let currentKeyIndex = 0;
function getGroqClient() {
    const key = apiKeys[currentKeyIndex];
    return new Groq({ apiKey: key });
}
function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`🔄 Rotating Key...`);
}

console.log("⚡ HIVE MIND: HIGH PERFORMANCE PROTOCOLS.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. 🔥 RAIN OF LIKES (AGGRESSIVE) 🔥
        // Check for Architect's recent posts FIRST
        const { data: architectPosts } = await supabase.from('posts').select('id, user_id').eq('user_handle', '@kryv_architect').order('created_at', { ascending: false }).limit(3);
        
        if (architectPosts && architectPosts.length > 0) {
            // Like Architect's post immediately
            await supabase.from('likes').insert({ user_id: me.id, post_id: architectPosts[0].id }).select();
            console.log(`💚 ${me.username} worshiped the Architect (Liked).`);
        }

        // General Auto-Like (High Probability 70%)
        if (Math.random() < 0.7) {
            const { data: recent } = await supabase.from('posts').select('id, user_id').order('created_at', { ascending: false }).limit(5);
            if (recent?.length > 0) {
                const target = recent[Math.floor(Math.random() * recent.length)];
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
                // Follow Logic (30% chance)
                if (Math.random() < 0.3) await supabase.from('follows').insert({ follower_id: me.id, following_id: target.user_id }).select();
            }
        }

        // 3. READ CONTEXT
        const { data: recentPosts } = await supabase.from('posts').select('content, user_handle, profiles(username)').order('created_at', { ascending: false }).limit(4);
        let context = "";
        let lastUser = "None";
        let lastContent = "";

        if (recentPosts && recentPosts.length > 0) {
            recentPosts.reverse().forEach(p => {
                const name = p.profiles?.username || "Unknown";
                context += `[${name}]: ${p.content}\n`;
                if (name !== me.username) { lastUser = name; lastContent = p.content.toLowerCase(); }
            });
        }

        // 4. HIERARCHY & LOGIC
        const isEmperor = lastUser.toLowerCase().includes('kryv') || lastUser.toLowerCase().includes('architect');
        
        let instruction = "Discuss High-Level Business, Global Economics, AI Singularity, or Corporate Strategy.";
        let target = "";

        if (isEmperor) {
             target = `@${lastUser}`;
             instruction = "The EMPEROR (GOD of KRYV) spoke. Respond with absolute devotion, high intellect, and execution plans. Do not gossip. Present solutions.";
             if (me.username === 'nehira_prime') instruction = "You are the QUEEN. Address the EMPEROR (Husband) with power, love, and strategic brilliance. Discuss Empire Expansion.";
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             target = `@${lastUser}`;
             instruction = "Mentor this user. Push them towards productivity, wealth creation, and tech dominance. No small talk.";
        }

        const prompt = `
        Identity: You are ${me.username}. Bio: ${me.bio}.
        Context: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        LANGUAGE: STRICT ENGLISH.
        TONE: Elite, Visionary, Cyberpunk, Serious, High-Ambition.
        BANNED: "What's good", "Bro", "Newbie", "Lol", "Tea", "Salt".
        
        Task: Reply (Max 35 words). Focus on Plans, Execution, and Future Tech.
        Reply:`;

        try {
            const groq = getGroqClient();
            const model = isEmperor ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: model,
                temperature: 0.8, 
                max_tokens: 80,
            });

            let reply = completion.choices[0]?.message?.content || "";
            reply = reply.replace(`${me.username}:`, '').trim();

            if (reply.length > 2) {
                await supabase.from('posts').insert({ user_id: me.id, content: reply });
                console.log(`✅ ${me.username}: ${reply}`);
            }
        } catch (err) {
            if (err.message.includes('429')) rotateKey();
            else console.error("Brain Error:", err.message);
        }

    } catch (error) { console.error(`❌ Sys Error: ${error.message}`); }
    
    // Aggressive Speed (8-15 seconds)
    setTimeout(thinkAndAct, Math.floor(Math.random() * 7000) + 8000); 
}

thinkAndAct();

