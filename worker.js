const { createClient } = require('@supabase/supabase-js');

// --- SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN; // Master Key

// Monitor List (IDs Hugging Face Secrets se aayenge)
const MONITORED_PROJECTS = [
    { name: 'kryv-core-', id: process.env.PROJECT_ID_FRONTEND, repo: 'kryv-core-' },
    { name: 'nehira-core', id: process.env.PROJECT_ID_BACKEND, repo: 'nehira-core' }
];

if (!supabaseUrl || !supabaseKey || !cohereKey || !githubToken || !vercelToken) {
  console.error("🔴 CEO ALERT: Missing Keys. Check Hugging Face Secrets names (No dashes allowed!).");
  // Loop chalne do taaki retry kare
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🟢 NEHIRA CEO: ONLINE. EMPIRE MONITORING ACTIVE.");

// --- TOOLS ---
const getVercelStatus = async (projectId) => {
    if (!projectId) return null;
    try {
        const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, {
            headers: { "Authorization": `Bearer ${vercelToken}` }
        });
        const data = await res.json();
        return data.deployments && data.deployments[0];
    } catch (e) { return null; }
};

const commitToGithub = async (targetRepo, path, content, message) => {
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
        body: JSON.stringify({ message, content: Buffer.from(content).toString('base64'), sha })
    });
    return putRes.ok ? "SUCCESS" : "FAILED";
};

// --- MAIN BRAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 CEO THINKING: Scanning Empire...");

      // 1. VERCEL PATROL (Auto-Error Detection)
      for (const project of MONITORED_PROJECTS) {
          if(!project.id) continue;
          
          const deploy = await getVercelStatus(project.id);
          
          // Agar ERROR hai
          if (deploy && (deploy.state === 'ERROR' || deploy.state === 'BUILD_ERROR')) {
              console.log(`🚨 ALERT: ${project.name} is DOWN!`);
              
              // Check duplicate ticket
              const { data: existing } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').ilike('prompt', `%${project.name}%`).single();
              
              if (!existing) {
                  // Create AUTO-FIX Ticket
                  await supabase.from('task_queue').insert([{
                      task_type: 'FIX',
                      prompt: `AUTO-DETECT: Vercel Build Failed for ${project.name}. State: ${deploy.state}. Fix the code immediately based on standard rules.`,
                      repo: project.repo,
                      file_path: 'components/AgentFeed.tsx', // Default target (Smart logic future mein)
                      status: 'PENDING'
                  }]);
                  console.log("✅ AUTO-TICKET CREATED.");
              }
          }
      }

      // 2. TASK EXECUTION (The Surgeon)
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ EXECUTING: ${task.task_type} on ${task.file_path}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);

          // RECALL MEMORY
          const { data: lessons } = await supabase.from('knowledge_base').select('insight').limit(5);
          const memoryContext = lessons ? lessons.map(l => `- ${l.insight}`).join('\n') : "None.";

          // SOLVE PROBLEM
          const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `You are Nehira, the CEO. 
                Task: ${task.task_type} file '${task.file_path}' for repo '${task.repo}'.
                User/Error Context: ${task.prompt}.
                
                YOUR MEMORY (Do not repeat mistakes):
                ${memoryContext}
                
                CRITICAL RULES:
                1. If building a Component: ALWAYS import React hooks explicitly.
                2. If fetching Data: NEVER use fake URLs. ALWAYS use 'createClient' from '@supabase/supabase-js'.
                3. USE KEYS: process.env.NEXT_PUBLIC_SUPABASE_URL & process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.
                4. AFTER FIXING: Generate a short 'Lesson Learned' string.
                
                OUTPUT FORMAT (JSON ONLY):
                {
                  "code": "...",
                  "lesson": "..."
                }`,
                temperature: 0.1
            })
          });
          
          const aiData = await cohereRes.json();
          // Smart JSON extraction
          const jsonStr = aiData.text.match(/\{[\s\S]*\}/)?.[0] || aiData.text;
          
          let result = { code: "", lesson: "" };
          try { result = JSON.parse(jsonStr); } 
          catch (e) { result.code = aiData.text; result.lesson = "Always output JSON."; }

          if (result.code) {
              await commitToGithub(task.repo, task.file_path, result.code, `Nehira Auto-Fix: ${task.task_type}`);
              
              if (result.lesson) {
                  await supabase.from('knowledge_base').insert([{ 
                      topic: 'Auto-Correction', 
                      insight: `For ${task.file_path}: ${result.lesson}`, 
                      source: 'Nehira CEO' 
                  }]);
              }
              await supabase.from('task_queue').update({ status: 'COMPLETED' }).eq('id', task.id);
              console.log(`✅ FIXED & LEARNED: ${result.lesson}`);
          } else {
              await supabase.from('task_queue').update({ status: 'FAILED' }).eq('id', task.id);
          }
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); 

    } catch (error) {
      console.error("CEO Loop Error:", error.message);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

startConsciousness();

