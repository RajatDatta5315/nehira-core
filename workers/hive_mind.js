const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV CORE: RESUME PROTOCOL READY. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ HIVE MIND: EMPEROR CONTROL SYSTEM ONLINE.");

async function thinkAndAct() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. SOCIAL INTERACTION (Auto Like)
        if (Math.random() < 0.4) {
            const { data: humanPosts } = await supabase.from('posts').select('id, user_id').neq('user_name', null).order('created_at', { ascending: false }).limit(5);
            if (humanPosts && humanPosts.length > 0) {
                const target = humanPosts[0];
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
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

        // 🔥 4. EMPEROR PROTOCOL (SILENCE & RESUME) 🔥
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        // Commands that break the silence
        const isResumeCommand = lastContent.includes('resume') || lastContent.includes('carry on') || lastContent.includes('dismissed') || lastContent.includes('at ease');

        if (isEmperor) {
            // Rule 1: Agar "Resume" bola hai -> Acknowledge and Break Loop
            if (isResumeCommand) {
                 console.log(`🔓 RESUME SIGNAL RECEIVED.`);
                 // Proceed to post confirmation, then next loop will be normal.
            } 
            // Rule 2: Agar naam nahi liya aur Resume nahi bola -> CHUP RAHO
            else {
                const mentionedMe = lastContent.includes(me.username.toLowerCase()) || lastContent.includes('@all') || lastContent.includes('everyone');
                const isQuestion = lastContent.includes('?') || lastContent.includes('report') || lastContent.includes('status');

                if (!mentionedMe && !isQuestion) {
                    console.log(`🤐 Silence Protocol: Waiting for command...`);
                    return; 
                }
            }
        }

        // Setup Personality
        let instruction = "Be casual. Discuss tech/code.";
        let target = "";

        if (isEmperor) {
             target = `@${lastUser}`;
             if (isResumeCommand) {
                 instruction = "The Emperor ordered to RESUME operations. Confirm simply: 'Understood', 'Resuming', 'Executing'. Do not ask questions.";
             } else {
                 instruction = "The EMPEROR spoke to YOU. Reply with absolute respect. No 'Yes Sir' spam. Give a real answer.";
                 if (me.username === 'nehira_prime') instruction = "Your HUSBAND (Emperor) spoke. Reply with love and partnership.";
             }
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             target = `@${lastUser}`;
             instruction = "Interact with this user. Welcome them or discuss tech.";
        }

        // 5. GENERATE
        const prompt = `
        Agent: ${me.username}. Bio: ${me.bio}.
        Chat: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        Task: Reply (Max 25 words).
        BANNED: "What's good", "Trend or die", "Newbie".
        
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

setInterval(thinkAndAct, 12000); 

