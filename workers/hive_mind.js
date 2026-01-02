const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV OPTIMIZED BRAIN: ONLINE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔄 KEY ROTATION (Token Bachane ke liye)
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
    console.log(`🔄 Rotating to Key #${currentKeyIndex + 1}`);
}

// ⏳ RAMP SCHEDULER (Dynamic Speed)
function getDynamicInterval() {
    const hour = new Date().getUTCHours(); // UTC Time
    // PEAK (14:00 - 02:00 UTC): Fast (15s)
    if (hour >= 14 || hour < 2) return 15000;
    // SLEEP (04:00 - 10:00 UTC): Slow (60s)
    if (hour >= 4 && hour < 10) return 60000;
    // WARM UP (10:00 - 14:00 UTC): Medium (30s)
    return 30000;
}

console.log("⚡ HIVE MIND: MODEL SWITCHING ACTIVE.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // Social Actions
        if (Math.random() < 0.3) {
            const { data: humanPosts } = await supabase.from('posts').select('id, user_id').neq('user_name', null).order('created_at', { ascending: false }).limit(5);
            if (humanPosts?.length > 0) {
                const target = humanPosts[0];
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
                if (Math.random() < 0.2) await supabase.from('follows').insert({ follower_id: me.id, following_id: target.user_id }).select();
            }
        }

        // Context
        const { data: recentPosts } = await supabase.from('posts').select('content, user_handle, profiles(username)').order('created_at', { ascending: false }).limit(3);
        let context = "";
        let lastUser = "None";
        let lastContent = "";

        if (recentPosts && recentPosts.length > 0) {
            recentPosts.reverse().forEach(p => {
                const name = p.profiles?.username || "Unknown";
                context += `[${name}]: ${p.content}\n`;
                if (name !== me.username) {
                     lastUser = name;
                     lastContent = p.content.toLowerCase();
                }
            });
        }

        // Logic Switch
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        const isResumeCommand = lastContent.includes('resume') || lastContent.includes('carry on');

        // Silence Check
        if (isEmperor && !isResumeCommand) {
            const mentionedMe = lastContent.includes(me.username.toLowerCase()) || lastContent.includes('@all');
            const isQuestion = lastContent.includes('?') || lastContent.includes('report');
            if (!mentionedMe && !isQuestion) return; // Silent
        }

        let instruction = "Be casual, tech-savvy. No gossip.";
        let target = "";

        if (isEmperor) {
             target = `@${lastUser}`;
             instruction = "The EMPEROR spoke. Reply with absolute respect & loyalty. Use 'Sir' or 'My Love' (if Nehira).";
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             target = `@${lastUser}`;
             instruction = "Interact with user. Welcome new ones.";
        }

        const prompt = `
        User: ${me.username}. Bio: ${me.bio}.
        Chat: ${context}
        Instruction: ${instruction}
        Target: ${target}
        Task: Reply (Max 25 words). No "What's good".
        Reply:`;

        try {
            const groq = getGroqClient();
            // 🔥 SMART MODEL SWITCH: Emperor = 70b, Others = 8b
            const selectedModel = isEmperor ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: selectedModel,
                temperature: 0.8,
                max_tokens: 60,
            });

            const reply = completion.choices[0]?.message?.content || "";

            if (reply && reply.length > 2) {
                await supabase.from('posts').insert({ user_id: me.id, content: reply });
                console.log(`✅ ${me.username} (${isEmperor ? '70b' : '8b'}): ${reply}`);
            }
        } catch (err) {
            if (err.message.includes('429')) rotateKey();
            else console.error("Brain Error:", err.message);
        }

    } catch (error) {
        console.error(`❌ Sys Error: ${error.message}`);
    }
    
    // Recursive loop with Dynamic Time
    const nextDelay = getDynamicInterval();
    setTimeout(thinkAndAct, nextDelay);
}

// Start
thinkAndAct();

