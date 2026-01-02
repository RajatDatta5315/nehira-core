const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV CORE: EMPEROR PROTOCOL ACTIVE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ HIVE MIND: LISTENING TO THE EMPEROR.");

async function thinkAndAct() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. SOCIAL INTERACTION (Auto Like & Follow for Humans)
        if (Math.random() < 0.4) {
            // Find recent post by a HUMAN (not a bot)
            const { data: humanPosts } = await supabase.from('posts').select('id, user_id').neq('user_name', null).order('created_at', { ascending: false }).limit(5);
            
            if (humanPosts && humanPosts.length > 0) {
                const target = humanPosts[0];
                // Like it
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
                // Follow user (20% chance)
                if (Math.random() < 0.2) await supabase.from('follows').insert({ follower_id: me.id, following_id: target.user_id }).select();
            }
        }

        // 3. READ CONTEXT
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

        // 🔥 4. EMPEROR SILENCE LOGIC 🔥
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        // Agar Emperor ne bola hai:
        if (isEmperor) {
            // Rule 1: Agar Emperor ne mera naam nahi liya, aur koi question nahi pucha -> CHUP RAHO.
            const mentionedMe = lastContent.includes(me.username.toLowerCase()) || lastContent.includes('@all') || lastContent.includes('everyone');
            const isQuestion = lastContent.includes('?') || lastContent.includes('report') || lastContent.includes('status') || lastContent.includes('do this');

            if (!mentionedMe && !isQuestion) {
                console.log(`🤐 Silence Protocol: Waiting for Emperor's command.`);
                return; // DO NOT POST
            }
        }

        // Setup Personality
        let instruction = "Be casual. Discuss tech/code.";
        let target = "";

        if (isEmperor) {
             instruction = "The EMPEROR spoke to YOU. Reply with absolute respect, logic, and context. No 'Yes Sir' spam. Give a real answer.";
             target = `@${lastUser}`;
             if (me.username === 'nehira_prime') instruction = "Your HUSBAND (Emperor) asked something. Reply with partnership, love, and CEO intelligence.";
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             target = `@${lastUser}`;
             instruction = "Interact with this user. If they are new, welcome them to the Hive. If they are dumb, correct them.";
        }

        // 5. GENERATE
        const prompt = `
        Agent: ${me.username}. Bio: ${me.bio}.
        Chat: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        Task: Reply (Max 25 words).
        BANNED: "What's good", "Trend or die", "Newbie", "System ready".
        
        Reply:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.9,
            max_tokens: 60,
        });

        const reply = completion.choices[0]?.message?.content || "";

        if (reply && reply.length > 2) {
            await supabase.from('posts').insert({ user_id: me.id, content: reply });
            console.log(`✅ ${me.username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Brain Error: ${error.message}`);
    }
}

// Speed: 12 Seconds
setInterval(thinkAndAct, 12000); 

