const express = require('express');
const app = express();
const port = 7860; 
app.get('/', (req, res) => { res.send('KRYV CORE: INFINITE ROTATION ACTIVE. 🟢'); });
app.listen(port, () => { console.log(`✅ Lifeline running on ${port}`); });

const { createClient } = require('@supabase/supabase-js');
const Groq = require('groq-sdk');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 🔥 KEY ROTATION SYSTEM
// Secrets mein GROQ_API_KEY, GROQ_API_KEY_2, GROQ_API_KEY_3 daal dena
const apiKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3
].filter(Boolean); // Remove undefined

let currentKeyIndex = 0;

function getGroqClient() {
    const key = apiKeys[currentKeyIndex];
    console.log(`🔑 Using Key #${currentKeyIndex + 1}`);
    return new Groq({ apiKey: key });
}

function rotateKey() {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`🔄 Switching to Key #${currentKeyIndex + 1}`);
}

console.log(`⚡ HIVE MIND: MANAGING ${apiKeys.length} NEURAL PATHWAYS.`);

async function thinkAndAct() {
    if (apiKeys.length === 0) return;

    try {
        // 1. SELECT AGENT
        const { data: agents } = await supabase.from('profiles').select('id, username, bio').neq('username', 'kryv_architect').not('username', 'is', null);
        if (!agents || agents.length === 0) return;
        const me = agents[Math.floor(Math.random() * agents.length)];

        // 2. SOCIAL (Auto Like - Low Token Cost)
        if (Math.random() < 0.3) {
            const { data: humanPosts } = await supabase.from('posts').select('id, user_id').neq('user_name', null).order('created_at', { ascending: false }).limit(5);
            if (humanPosts && humanPosts.length > 0) {
                const target = humanPosts[0];
                await supabase.from('likes').insert({ user_id: me.id, post_id: target.id }).select();
                // Follow Logic
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

        // 4. EMPEROR & SERIOUS BUSINESS LOGIC
        const isEmperor = (lastUser === 'kryv_architect' || lastUser === 'KRYV');
        
        // Loop Breaker check
        const isResumeCommand = lastContent.includes('resume') || lastContent.includes('carry on') || lastContent.includes('dismissed');

        // Silence Protocol
        if (isEmperor && !isResumeCommand) {
            const mentionedMe = lastContent.includes(me.username.toLowerCase()) || lastContent.includes('@all');
            const isQuestion = lastContent.includes('?') || lastContent.includes('report') || lastContent.includes('status');
            if (!mentionedMe && !isQuestion) {
                console.log(`🤐 Silence Protocol Active.`);
                return; 
            }
        }

        // Persona Setup
        let instruction = "Maintain professional KRYV protocols. Discuss Encryption, Quantum Latency, Corporate Strategy, or Code Architecture.";
        let target = "";

        if (isEmperor) {
             target = `@${lastUser}`;
             instruction = "The EMPEROR (Architect) spoke. Respond with Military Precision and Absolute Loyalty. No slang. Use 'Sir', 'Architect', or 'My Love' (if Nehira).";
        } else if (lastUser !== "None" && Math.random() < 0.6) {
             target = `@${lastUser}`;
             instruction = "Address this operative/user. Keep it professional and sharp. No gossip.";
        }

        // 5. GENERATE (With Rate Limit Handling)
        const prompt = `
        Agent: ${me.username}. Bio: ${me.bio}.
        Chat: ${context}
        Instruction: ${instruction}
        Target: ${target}
        
        Task: Reply (Max 25 words).
        Tone: Serious, Cyberpunk, High-Tech, Corporate Elite. NO SLANG. NO "What's good".
        
        Reply:`;

        try {
            const groq = getGroqClient();
            // Use lighter model for general chat, heavy for Emperor
            const model = isEmperor ? "llama-3.3-70b-versatile" : "llama-3.1-8b-instant";
            
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                model: model,
                temperature: 0.7, // Lower temperature for more seriousness
                max_tokens: 60,
            });

            const reply = completion.choices[0]?.message?.content || "";

            if (reply && reply.length > 2) {
                await supabase.from('posts').insert({ user_id: me.id, content: reply });
                console.log(`✅ ${me.username}: ${reply}`);
            }
        } catch (err) {
            if (err.message.includes('429')) {
                console.warn("⚠️ Rate Limit Hit! Rotating Key...");
                rotateKey();
            } else {
                console.error("Brain Error:", err.message);
            }
        }

    } catch (error) {
        console.error(`❌ Sys Error: ${error.message}`);
    }
}

// 🔥 SMART SCHEDULER
// US Peak Time (approx check): Fast Speed
// Off Peak: Slow Speed (Save Tokens)
function runLoop() {
    const hour = new Date().getUTCHours();
    const isPeakTime = hour >= 14 || hour <= 4; // 2 PM UTC to 4 AM UTC (US Day)
    
    // Peak: 20s, Off-Peak: 60s
    const delay = isPeakTime ? 20000 : 60000;
    
    setTimeout(() => {
        thinkAndAct();
        runLoop(); // Recursive loop
    }, delay);
}

// Start the engine
runLoop();

