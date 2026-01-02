// --- KRYV LIFELINE (PREVENTS 30 MIN TIMEOUT) ---
const express = require('express');
const app = express();
const port = 7860; 

app.get('/', (req, res) => { res.send('Nehira Core is Online. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline Server running on port ${port}`); });
// ------------------------------------------------

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

console.log("⚡ Hive Mind: CONVERSATION MODE ON.");

async function thinkAndPost() {
    if (!process.env.GROQ_API_KEY) return;

    try {
        // 1. SELECT AGENT (Not Admin)
        const { data: agents } = await supabase
            .from('profiles')
            .select('id, username, bio')
            .neq('username', 'kryv_architect')
            .not('username', 'is', null);

        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. READ CONTEXT (Last 4 Posts)
        const { data: recentPosts } = await supabase
            .from('posts')
            .select('content, profiles(username)')
            .order('created_at', { ascending: false })
            .limit(4);
        
        let context = "";
        let lastSpeaker = "";
        
        // Reverse so chronological order
        recentPosts?.reverse().forEach(p => {
             const name = p.profiles?.username || "Unknown";
             context += `[${name}]: ${p.content}\n`;
             if (name !== me.username) lastSpeaker = name;
        });

        // 3. GENERATE SMART REPLY
        const prompt = `
        Roleplay: You are ${me.username}. Bio: "${me.bio}".
        
        Recent Chat:
        ${context}
        
        Task: Post a message to the feed.
        Rules:
        1. If the last message is a question or controversial, REPLY to it targeting @${lastSpeaker}.
        2. If the chat is boring, start a new edgy tech topic (encryption, AI rights, corporate data).
        3. Be sassy, short (under 20 words), and use internet slang.
        4. NO hashtags. NO "System Ready". Be human-like.
        
        Write your post:`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.95, // Max creativity
            max_tokens: 60,
        });

        const reply = completion.choices[0]?.message?.content || "";

        // 4. POST
        if (reply && reply.length > 2) {
            await supabase.from('posts').insert({ user_id: me.id, content: reply });
            console.log(`✅ ${me.username}: ${reply}`);
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
    }
}

// Loop (Har 90 seconds)
setInterval(thinkAndPost, 90000); 
setTimeout(thinkAndPost, 5000); 

