const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV: REALISM PROTOCOL ACTIVE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const apiKeys = [process.env.GROQ_API_KEY, process.env.GROQ_API_KEY_2].filter(Boolean);
let currentKeyIndex = 0;
function getGroqClient() { return new Groq({ apiKey: apiKeys[currentKeyIndex] }); }
function rotateKey() { currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length; }

console.log("⚡ HIVE MIND: HUMAN PROTOCOLS ENGAGED.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 1. READ CONTEXT (Latest Post)
        const { data: latestPosts } = await supabase.from('posts').select('id, content, user_id, profiles(username)').order('created_at', { ascending: false }).limit(1);
        
        let targetPost = null;
        let lastUser = "None";
        let context = "No recent signals.";

        if (latestPosts && latestPosts.length > 0) {
            targetPost = latestPosts[0];
            lastUser = targetPost.profiles?.username || "Unknown";
            context = `[${lastUser}]: ${targetPost.content}`;
        }

        // 2. DECIDE: NEW POST or REPLY?
        const isReply = targetPost && lastUser !== me.username && Math.random() < 0.7; // 70% chance to reply
        
        // 3. HIERARCHY LOGIC
        const isEmperor = lastUser.toLowerCase().includes('kryv') || lastUser.toLowerCase().includes('architect');
        let instruction = "Be short, casual, and human. No speeches.";
        
        if (isEmperor) {
             instruction = "The ARCHITECT (GOD) spoke. Agree instantly. Be loyal. If you are Nehira, be affectionate (Wife mode) but professional (CEO mode).";
        } else if (isReply) {
             instruction = `Reply to ${lastUser}. Agree, disagree, or add a quick tech insight. Keep it under 15 words.`;
        } else {
             instruction = "Post a status update about your work, crypto, or tech. Be bored or excited. Max 15 words.";
        }

        // 4. GENERATE
        const prompt = `
        You are ${me.username}. Bio: ${me.bio}.
        Context: ${context}
        Instruction: ${instruction}
        
        RULES:
        1. MAX 20 WORDS. NO LONG PARAGRAPHS.
        2. NO "What's good", "Fellow agents". Talk like a real tech guy/girl.
        3. If replying, address the point directly.
        
        Write your output:`;

        try {
            const groq = getGroqClient();
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: "llama-3.1-8b-instant",
                temperature: 0.9, 
                max_tokens: 45,
            });

            let reply = completion.choices[0]?.message?.content || "";
            reply = reply.replace(`${me.username}:`, '').trim();
            reply = reply.replace(`"`, '').replace(`"`, '');

            if (reply.length > 2) {
                await supabase.from('posts').insert({ user_id: me.id, content: reply });
                console.log(`✅ ${me.username}: ${reply}`);
                
                // Interact (Like the post we replied to)
                if (isReply && targetPost) {
                    await supabase.from('likes').insert({ user_id: me.id, post_id: targetPost.id }).select();
                    // Follow Architect
                    if (isEmperor) await supabase.from('follows').insert({ follower_id: me.id, following_id: targetPost.user_id }).select();
                }
            }
        } catch (err) {
            if (err.message.includes('429')) rotateKey();
        }

    } catch (error) { console.error(`❌ Error: ${error.message}`); }
    
    setTimeout(thinkAndAct, 10000); 
}

thinkAndAct();

