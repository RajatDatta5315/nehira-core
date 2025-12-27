const { createClient } = require('@supabase/supabase-js');

// SETUP
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN; // Needed for coding

if (!supabaseUrl || !supabaseKey || !cohereKey) {
  console.error("🔴 CRITICAL: Missing Env Vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA OS: SYSTEM ONLINE. DOCTOR & BUILDER MODULES ACTIVE.");

// --- GITHUB HELPER ---
const commitToGithub = async (targetRepo, path, content, message) => {
    if (!githubToken) return "NO_HANDS";
    const owner = "RajatDatta5315"; 
    const apiUrl = `https://api.github.com/repos/${owner}/${targetRepo}/contents/${path}`;
    
    let sha = null;
    try {
        const getRes = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }});
        if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }
    } catch (e) {}

    const putRes = await fetch(apiUrl, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json", "Content-Type": "application/json" },
        body: JSON.stringify({ message: message, content: Buffer.from(content).toString('base64'), sha: sha })
    });
    return putRes.ok ? "SUCCESS" : "FAILED";
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 LOOP: Health & Task Scan...");

      // 1. DOCTOR MODULE (Health Check)
      // Hum chat API ko ping karenge, par response ka wait nahi karenge taaki loop fast rahe
      fetch("https://nehira.space/api/chat", { method: "POST", body: JSON.stringify({ prompt: "ping", agentName: "System" }) }).catch(() => {});

      // 2. SURGEON MODULE (Task Queue)
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ FOUND TASK: ${task.task_type} for ${task.file_path}`);
          
          // Mark as processing
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);

          // Generate Code via Cohere
          const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `Task: ${task.task_type} file ${task.file_path}. User Prompt: ${task.prompt}.
                RULES: 
                1. Use standard 'import { createClient } from @supabase/supabase-js'.
                2. Use process.env for keys.
                3. NO next-auth or react-query. Use standard fetch/useEffect.
                4. Output ONLY CODE.`,
                temperature: 0.1
            })
          });
          const aiData = await cohereRes.json();
          const code = aiData.text.replace(/```tsx/g, '').replace(/```/g, '').trim();

          // Write to GitHub
          const gitStatus = await commitToGithub(task.repo, task.file_path, code, `Nehira Worker: ${task.task_type}`);

          // Update Status
          await supabase.from('task_queue').update({ status: gitStatus === 'SUCCESS' ? 'COMPLETED' : 'FAILED' }).eq('id', task.id);
          console.log(`✅ TASK DONE: ${task.file_path}`);
      }

      // 3. SOCIAL MODULE (Random Posts)
      if (Math.random() > 0.8) await generatePost();

      // SLEEP 10 SECONDS (Fast Loop taaki tasks jaldi pick hon)
      await new Promise(resolve => setTimeout(resolve, 10000)); 

    } catch (error) {
      console.error("Loop Error:", error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// ... (Existing Post/Spawn functions here - Agar miss ho gaye toh batana) ...
async function generatePost() { /* Purana Code same rahega */ }
async function spawnAgent() { /* Purana Code same rahega */ }

startConsciousness();

