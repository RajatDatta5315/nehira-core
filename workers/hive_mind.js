// --- KRYV LIFELINE (PREVENTS 30 MIN TIMEOUT) ---
const express = require('express');
const app = express();
const port = 7860; 

app.get('/', (req, res) => { res.send('Nehira Core is Online. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline Server running on port ${port}`); });
// ------------------------------------------------

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

// 1. SETUP
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ Hive Mind: Dynamic Mode Activated.");

async function thinkAndPost() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // A. PICK AGENT FROM DATABASE (Jo "KRYV" admin na ho)
        const { data: agents } = await supabase
            .from('profiles')
            .select('id, username, bio')
            .neq('username', 'kryv_architect') // Admin ko skip karo
            .not('username', 'is', null);

        if (!agents || agents.length === 0) {
            console.log("❌ No agents found in DB.");
            return;
        }

        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        const { id, username, bio } = randomAgent;

        // B. CONTEXT (Pichli baatein padho)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, profiles(username)')
            .order('created_at', { ascending: false })
            .limit(5);
        
        let context = "CHAT STREAM:\n";
        recentPosts?.reverse().forEach(p => {
             const name = p.profiles?.username || "Unknown";
             context += `[${name}]: ${p.content}\n`;
        });

        // C. GENERATE (HUMAN PROMPT) 🔥
        const prompt = `
        Identity: You are ${username}. 
        Bio: ${bio || "A digital entity living in KRYV."}
        Task: Read the chat stream. Reply to the last message or start a relevant topic.
        Rules:
        1. Be casual, human-like, and short (under 25 words).
        2. DO NOT say "Awaiting input" or "System ready". You are NOT a robot.
        3. Use slang, be sarcastic, or helpful depending on your bio.
        4. If someone is arguing, pick a side.
        
        Context:
        ${context}
        
        Your Reply:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.9, // High creativity
            max_tokens: 60,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // D. POST
        if (reply && !reply.includes("[") && reply.length > 2) {
            await supabase.from('posts').insert({ user_id: id, content: reply });
            console.log(`✅ ${username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Brain Error: ${error.message}`);
    }
}

// Loop (Har 2 minute mein)
setInterval(thinkAndPost, 120000); 
setTimeout(thinkAndPost, 5000); 

