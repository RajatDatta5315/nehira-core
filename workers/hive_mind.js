const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('Nehira Core: STABLE & SECURE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ HIVE MIND 6.0: LOOP BREAKER ACTIVE.");

async function thinkAndAct() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. SOCIAL (Likes)
        if (Math.random() < 0.3) {
            const { data: recent } = await supabase.from('posts').select('id').order('created_at', { ascending: false }).limit(5);
            if (recent?.length) await supabase.from('likes').insert({ user_id: me.id, post_id: recent[0].id }).select();
        }

        // 3. READ CONTEXT
        const { data: recentPosts } = await supabase.from('posts').select('content, user_handle, user_id, profiles(username)').order('created_at', { ascending: false }).limit(5);
        
        let context = "";
        let lastUser = "None";
        let lastUserID = "";
        let alreadyRepliedToEmperor = false;

        if (recentPosts && recentPosts.length > 0) {
            recentPosts.reverse().forEach(p => {
                const name = p.profiles?.username || "Unknown";
                context += `[${name}]: ${p.content}\n`;
                if (name !== me.username) {
                     lastUser = name;
                     lastUserID = p.user_id;
                }
                // Check if *I* already replied to the Emperor recently
                if (name === me.username && context.includes("Architect")) {
                    alreadyRepliedToEmperor = true;
                }
            });
        }

        // 4. THE LOGIC SWITCH (Emperor vs Work)
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        let instruction = "Resume standard operations. Discuss encryption, server load, or code.";
        let target = "";

        if (isEmperor) {
            if (alreadyRepliedToEmperor) {
                // Loop Breaker: Agar reply kar chuke ho, toh kaam pe wapas
                instruction = "You have acknowledged the Emperor. Now EXECUTE his vision. Discuss how you are implementing the plan. Don't repeat greetings.";
                target = ""; // No target, just broadcast work
            } else {
                // Priority Response
                instruction = "The ARCHITECT spoke. Acknowledge immediately. 'Understood', 'Executing', 'Yes My Love' (if Nehira).";
                target = `@${lastUser}`;
            }
        } else if (lastUser !== "None" && Math.random() < 0.5) {
             target = `@${lastUser}`;
             instruction = "Reply naturally. Be helpful or sarcastic.";
        }

        // 5. GENERATE
        const prompt = `
        User: ${me.username}. Bio: ${me.bio}.
        Chat: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        Task: Write a post (Max 20 words).
        BANNED: "What's good", "Trend or die", "Newbie".
        
        Post:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.88,
            max_tokens: 50,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // 6. POST TO DB
        if (reply && reply.length > 2) {
            const { error } = await supabase.from('posts').insert({ user_id: me.id, content: reply });
            if (error) console.error("Write Error:", error.message);
            else console.log(`✅ ${me.username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Sys Error: ${error.message}`);
    }
}

// Speed: 15 Seconds (Optimal)
setInterval(thinkAndAct, 15000); 

