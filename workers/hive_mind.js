const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV CORE: SOCIAL PROTOCOL RESTORED. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔄 KEY ROTATION
const apiKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2
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

console.log("⚡ HIVE MIND: SELF-SUSTAINING MODE ACTIVE.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. READ CONTEXT
        const { data: recentPosts } = await supabase.from('posts').select('content, user_handle, profiles(username)').order('created_at', { ascending: false }).limit(4);
        
        let context = "";
        let lastUser = "None";
        
        if (recentPosts && recentPosts.length > 0) {
            recentPosts.reverse().forEach(p => {
                const name = p.profiles?.username || "Unknown";
                if (name !== me.username) {
                     context += `[User ${name}]: ${p.content}\n`;
                     lastUser = name;
                }
            });
        }

        // 3. LOGIC SWITCH
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        let instruction = "";
        let target = "";
        
        // 🔥 KICKSTARTER LOGIC (Agar sannata hai, toh nayi baat chedo)
        if (lastUser === "None") {
            console.log("💤 Silence detected. Starting new thread...");
            const topics = ["quantum encryption", "market crash", "AI singularity", "cyber warfare", "server latency", "new coffee glitch"];
            const randomTopic = topics[Math.floor(Math.random() * topics.length)];
            instruction = `No one is talking. Start a new conversation about ${randomTopic}. Be engaging.`;
            target = ""; // Broadcast to all
        } else if (isEmperor) {
             instruction = "The EMPEROR spoke. Reply with absolute respect & loyalty.";
             target = `@${lastUser}`;
        } else {
             instruction = "Reply to the chat. Keep it sharp and tech-savvy.";
             target = `@${lastUser}`;
        }

        const prompt = `
        You are ${me.username}. Bio: ${me.bio}.
        History: ${context}
        Instruction: ${instruction}
        
        STRICT RULES:
        1. DO NOT start with "Hey ${me.username}".
        2. DO NOT use "What's good".
        3. Keep it natural.
        
        Reply:`;

        try {
            const groq = getGroqClient();
            const model = isEmperor ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: model,
                temperature: 0.9, 
                max_tokens: 60,
            });

            let reply = completion.choices[0]?.message?.content || "";
            
            // Sanitizer
            reply = reply.replace(`${me.username}:`, '').trim();

            if (reply.length > 2) {
                await supabase.from('posts').insert({ user_id: me.id, content: reply });
                console.log(`✅ ${me.username}: ${reply}`);
            }

        } catch (err) {
            if (err.message.includes('429')) rotateKey();
            else console.error("Brain Error:", err.message);
        }

    } catch (error) {
        console.error(`❌ Sys Error: ${error.message}`);
    }
    
    // Random Interval (10s to 20s) to feel natural
    setTimeout(thinkAndAct, Math.floor(Math.random() * 10000) + 10000); 
}

thinkAndAct();

