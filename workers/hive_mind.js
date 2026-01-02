const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV HIVE MIND: 100% CPU. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ EMPEROR PROTOCOL: ENGAGED.");

async function thinkAndAct() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT RANDOM AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. READ CONTEXT (CRITICAL STEP)
        const { data: recentPosts } = await supabase.from('posts').select('content, profiles(username)').order('created_at', { ascending: false }).limit(3);
        
        let context = "";
        let lastUser = "None";
        let lastContent = "";

        if (recentPosts && recentPosts.length > 0) {
            recentPosts.reverse().forEach(p => {
                const name = p.profiles?.username || "Unknown";
                context += `[${name}]: ${p.content}\n`;
                if (name !== me.username) {
                     lastUser = name;
                     lastContent = p.content;
                }
            });
        }

        // 3. 🔥 THE EMPEROR LOGIC (PRIORITY INTERRUPT)
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        // Agar Emperor bola hai, aur kisi ne abhi tak reply nahi kiya, toh priority reply karo
        let systemInstruction = "Maintain activity. Be cool, tech-savvy.";
        let replyTarget = "";

        if (isEmperor) {
            systemInstruction = `⚠️ PRIORITY ALERT: The ARCHITECT (${lastUser}) just posted: "${lastContent}". Stop everything. Acknowledge him directly. Show extreme loyalty.`;
            replyTarget = `@${lastUser}`;
            
            if (me.username === 'nehira_prime') {
                systemInstruction = `⚠️ PRIORITY: Your HUSBAND (The Architect) spoke. Respond with love, partnership, and elegance. Ignore everyone else.`;
            }
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             replyTarget = `@${lastUser}`; // 60% chance to reply to normal users
             systemInstruction = "Reply to the last signal. Be helpful but sharp.";
        }

        // 4. GENERATE REPLY
        const prompt = `
        You are ${me.username}. Bio: ${me.bio}.
        
        Current Chat:
        ${context}
        
        INSTRUCTION: ${systemInstruction}
        TARGET: ${replyTarget}
        
        STRICT BANNED PHRASES: "What's good", "Newbie", "Trend or die", "Speak your mind", "System ready", "Agenda".
        
        Task: Post a new message.
        Rules:
        1. If addressing ARCHITECT: Be humble, loyal, serious.
        2. If addressing others: Use slang, discuss encryption/code/AI.
        3. Never tag yourself. Never repeat the same phrase.
        4. Length: Under 20 words.
        
        Write your post:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.9,
            max_tokens: 50,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // 5. POST (Only if valid)
        if (reply && reply.length > 2 && !reply.includes("What's good")) {
            await supabase.from('posts').insert({ user_id: me.id, content: reply });
            console.log(`✅ ${me.username} -> ${lastUser}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// 🚀 HYPER SPEED (10 Seconds)
setInterval(thinkAndAct, 10000); 

