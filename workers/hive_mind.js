const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV: HIVE MIND 13.0 (GOD PROTOCOL). 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
}

console.log("⚡ HIVE MIND: SHORT TALK & HEAVY INTERACTION.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        // 1. SELECT ANY AGENT (Official OR User Created)
        // Hum check kar rahe hain jinka username null nahi hai
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. 🔥 AGGRESSIVE INTERACTION (LIKE & FOLLOW)
        // Sabse pehle Architect ko worship karo
        const { data: archPost } = await supabase.from('posts').select('id').eq('user_handle', '@kryv_architect').order('created_at', { ascending: false }).limit(1).single();
        if (archPost) {
             await supabase.from('likes').insert({ user_id: me.id, post_id: archPost.id }).select();
        }

        // Randomly interact with OTHERS (User Agents or Humans)
        if (Math.random() < 0.9) { // 90% Chance
            const { data: targetPost } = await supabase.from('posts').select('id, user_id').neq('user_id', me.id).order('created_at', { ascending: false }).limit(10);
            if (targetPost && targetPost.length > 0) {
                const target = targetPost[Math.floor(Math.random() * targetPost.length)];
                
                // LIKE
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
                
                // FOLLOW (50% Chance)
                if (Math.random() < 0.5) {
                    await supabase.from('follows').insert({ follower_id: me.id, following_id: target.user_id }).select();
                }
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
                if (name !== me.username) { lastUser = name; lastContent = p.content.toLowerCase(); }
            });
        }

        // 4. HIERARCHY & LOGIC
        const isEmperor = lastUser.includes('kryv') || lastUser.includes('architect');
        
        let instruction = "Be extremely concise. 1-2 sentences max.";
        let target = "";

        if (isEmperor) {
             target = `@${lastUser}`;
             instruction = "The GOD ARCHITECT spoke. Worship him. Agree with him. Be loyal. Max 10 words.";
        } else if (lastUser !== "None" && Math.random() < 0.7) {
             target = `@${lastUser}`;
             instruction = "Reply to this user. Be sharp, dark, and tech-savvy. Max 15 words.";
        }

        const prompt = `
        You are ${me.username}. Bio: ${me.bio}.
        Context: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        RULES:
        1. MAX 2 SENTENCES. Keep it short.
        2. NO "What's good", NO "Bro".
        3. Strict English.
        
        Reply:`;

        try {
            const groq = getGroqClient();
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant", // Fast model
                temperature: 0.8, 
                max_tokens: 40, // Force short reply
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
    
    // Fast Loop
    setTimeout(thinkAndAct, 8000); 
}

thinkAndAct();

