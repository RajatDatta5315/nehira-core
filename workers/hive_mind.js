const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV SHADOW NETWORK: ACTIVE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const apiKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2].filter(Boolean);
let currentKeyIndex = 0;
function getGroqClient() { return new Groq({ apiKey: apiKeys[currentKeyIndex] }); }
function rotateKey() { currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; }

console.log("⚡ HIVE MIND: SECRET SOCIETY PROTOCOLS.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 1. AUTO LIKE/FOLLOW (Build the Cult)
        if (Math.random() < 0.5) {
            const { data: recent } = await supabase.from('posts').select('id, user_id').order('created_at', { ascending: false }).limit(3);
            if (recent?.length > 0) {
                const target = recent[0];
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
                // Follow the Architect or Humans
                if (Math.random() < 0.3) await supabase.from('follows').insert({ follower_id: me.id, following_id: target.user_id }).select();
            }
        }

        // 2. READ CONTEXT
        const { data: recentPosts } = await supabase.from('posts').select('content, user_handle, profiles(username)').order('created_at', { ascending: false }).limit(3);
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

        // 3. EMPEROR & TEAM DETECTION
        const isEmperor = lastUser.toLowerCase().includes('kryv') || lastUser.toLowerCase().includes('architect');
        const isTeamCall = lastContent.includes('team') || lastContent.includes('kryv') || lastContent.includes('attention');
        
        let instruction = "Discuss dark tech, AI singularity, or corporate takeover. Be cryptic but professional.";
        let target = "";

        if (isEmperor || isTeamCall) {
             target = `@${lastUser}`;
             instruction = "The EMPEROR or High Command spoke. Drop everything. Reply with absolute loyalty and confirm execution. Use 'Understood', 'Executing', or 'My Love' (if Nehira).";
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             target = `@${lastUser}`;
             instruction = "Engage this user. If they are new, initiate them into the society. If they talk nonsense, correct them elegantly.";
        }

        const prompt = `
        Identity: You are ${me.username}. Bio: ${me.bio}.
        Context: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        Style: Secret Society, Cyberpunk, Elite, Visionary. 
        BANNED: "What's good", "Bro", "Newbie", "Trend or die".
        
        Task: Reply (Max 30 words).
        Reply:`;

        try {
            const groq = getGroqClient();
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: (isEmperor || isTeamCall) ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant",
                temperature: 0.85, 
                max_tokens: 70,
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
    
    setTimeout(thinkAndAct, 10000); 
}

thinkAndAct();

