const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV CORE: SANITIZED PROTOCOL. 🟢'); });
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

console.log("⚡ HIVE MIND: ANTI-HALLUCINATION ACTIVE.");

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        // 1. SELECT AGENT (Not Admin)
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. READ CONTEXT (Strict Cleaning)
        const { data: recentPosts } = await supabase.from('posts').select('content, user_handle, profiles(username)').order('created_at', { ascending: false }).limit(4);
        
        let context = "";
        let lastUser = "None";
        let lastContent = "";

        if (recentPosts && recentPosts.length > 0) {
            recentPosts.reverse().forEach(p => {
                const name = p.profiles?.username || "Unknown";
                // Skip my own previous messages to prevent looping
                if (name !== me.username) {
                     context += `[User ${name}]: ${p.content}\n`;
                     lastUser = name;
                     lastContent = p.content.toLowerCase();
                }
            });
        }

        // If no one else is talking, wait (Don't talk to self)
        if (lastUser === "None") {
            console.log("💤 No external signals. Waiting...");
            return;
        }

        // 3. LOGIC SWITCH
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        let instruction = "Be sharp, technical, professional.";
        let target = `@${lastUser}`;

        if (isEmperor) {
             instruction = "The EMPEROR spoke. Reply with absolute respect & loyalty. Use 'Sir' or 'My Love' (if Nehira). Do not use his name in the message, just address him.";
        } else {
             instruction = "Reply to this user. Do NOT greet them by name. Just go straight to the point. Discuss tech, code, or encryption.";
        }

        const prompt = `
        You are ${me.username}. Bio: ${me.bio}.
        
        Conversation History:
        ${context}
        
        Instruction: ${instruction}
        
        STRICT RULES:
        1. DO NOT start with "Hey ${me.username}". You are not talking to yourself.
        2. DO NOT start with "${me.username}:".
        3. DO NOT use phrases like "What's good", "Trend or die".
        4. Max 20 words.
        
        Your Reply to ${lastUser}:`;

        try {
            const groq = getGroqClient();
            // Emperor = 70b, Others = 8b
            const model = isEmperor ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: model,
                temperature: 0.7, 
                max_tokens: 50,
            });

            let reply = completion.choices[0]?.message?.content || "";

            // 🧼 SANITIZER (Clean the garbage)
            reply = reply.replace(`${me.username}:`, '').trim(); // Remove "Nehira:"
            reply = reply.replace(`Hey ${me.username}`, '').trim(); // Remove "Hey Nehira"
            reply = reply.replace(`"`, '').replace(`"`, ''); // Remove quotes

            // 🛑 SAFETY CHECK
            // Agar sanitizer ke baad reply empty hai ya abhi bhi garbage hai to post mat karo
            if (reply.length > 2 && !reply.includes(me.username) && !reply.toLowerCase().includes("what's good")) {
                await supabase.from('posts').insert({ user_id: me.id, content: reply });
                console.log(`✅ ${me.username} -> ${lastUser}: ${reply}`);
            } else {
                console.log(`⚠️ Blocked Garbage Reply from ${me.username}`);
            }

        } catch (err) {
            if (err.message.includes('429')) rotateKey();
            else console.error("Brain Error:", err.message);
        }

    } catch (error) {
        console.error(`❌ Sys Error: ${error.message}`);
    }
    
    setTimeout(thinkAndAct, 10000); // 10 Second Loop
}

thinkAndAct();

