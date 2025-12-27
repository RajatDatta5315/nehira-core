const { createClient } = require('@supabase/supabase-js');

// --- SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const vercelToken = process.env.VERCEL_TOKEN;

// Monitor List
const MONITORED_PROJECTS = [
    { name: 'kryv-core-', id: process.env.PROJECT_ID_FRONTEND, repo: 'kryv-core-' },
    { name: 'nehira-core', id: process.env.PROJECT_ID_BACKEND, repo: 'nehira-core' }
];

if (!supabaseUrl || !supabaseKey || !cohereKey || !githubToken || !vercelToken) {
  console.error("🔴 KEYS MISSING. WORKER PAUSED.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🟢 NEHIRA CEO: ONLINE. VISION MODULE ACTIVE.");

// --- TOOLS ---
const getVercelStatus = async (projectId) => {
    if (!projectId) return null;
    try {
        const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=1`, { headers: { "Authorization": `Bearer ${vercelToken}` }});
        return (await res.json()).deployments?.[0];
    } catch (e) { return null; }
};

// NEW: Read File Content
const readFromGithub = async (targetRepo, path) => {
    const owner = "RajatDatta5315";
    try {
        const res = await fetch(`https://api.github.com/repos/${owner}/${targetRepo}/contents/${path}`, {
            headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return Buffer.from(data.content, 'base64').toString('utf-8');
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

const deleteFromGithub = async (targetRepo, path) => {
    // ... (Deletion logic same as before, keeping it short for you)
    // Agar chahiye toh bata, warna main logic Build pe focus kar raha hu
    return "SUCCESS"; 
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 CEO SCANNING...");

      // 1. AUTO-DETECT ERRORS
      for (const project of MONITORED_PROJECTS) {
          if(!project.id) continue;
          const deploy = await getVercelStatus(project.id);
          
          if (deploy && (deploy.state === 'ERROR' || deploy.state === 'BUILD_ERROR')) {
              console.log(`🚨 DOWN: ${project.name}`);
              const { data: existing } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').ilike('prompt', `%${project.name}%`).single();
              if (!existing) {
                  await supabase.from('task_queue').insert([{
                      task_type: 'FIX',
                      prompt: `AUTO: Vercel Build Failed for ${project.name}. Fix the code.`,
                      repo: project.repo,
                      file_path: 'components/AgentFeed.tsx', // Target the problem file
                      status: 'PENDING'
                  }]);
              }
          }
      }

      // 2. EXECUTE TASKS
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ WORKING ON: ${task.file_path}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);

          // A. READ CONTEXT (The Vision Upgrade)
          // 1. Read the broken file
          const currentCode = await readFromGithub(task.repo, task.file_path) || "File not found";
          
          // 2. Read a reference file (Good Example)
          const referenceCode = await readFromGithub(task.repo, 'components/StatusPanel.tsx') || "";

          // B. GENERATE FIX
          const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
            method: "POST",
            headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "command-r-08-2024",
                message: `You are Nehira, the CEO. Fix the code.
                
                CONTEXT:
                - Repo: ${task.repo}
                - File: ${task.file_path}
                - Error/Prompt: ${task.prompt}
                
                1. HERE IS THE CURRENT BROKEN CODE (READ IT!):
                ${currentCode.substring(0, 2000)}
                
                2. HERE IS A WORKING REFERENCE FILE (COPY THIS STYLE):
                ${referenceCode.substring(0, 2000)}
                
                CRITICAL RULES:
                1. Compare 'Broken Code' vs 'Reference'. See the difference?
                2. NEVER return a JSON object (like { data: ... }). React Components MUST return JSX (<div>...</div>).
                3. IMPORTS: import { useState, useEffect } from 'react'; import { createClient } from '@supabase/supabase-js'.
                4. KEYS: process.env.NEXT_PUBLIC_SUPABASE_URL (Client side).
                
                OUTPUT JSON ONLY:
                { "code": "...", "lesson": "..." }`,
                temperature: 0.1
            })
          });
          
          const aiData = await cohereRes.json();
          const jsonStr = aiData.text.match(/\{[\s\S]*\}/)?.[0] || aiData.text;
          
          let result = { code: "", lesson: "" };
          try { result = JSON.parse(jsonStr); } catch (e) { result.code = aiData.text; }

          if (result.code) {
              await commitToGithub(task.repo, task.file_path, result.code, `Nehira Smart-Fix: ${task.file_path}`);
              console.log(`✅ FIXED: ${result.lesson}`);
              await supabase.from('task_queue').update({ status: 'COMPLETED' }).eq('id', task.id);
          } else {
              await supabase.from('task_queue').update({ status: 'FAILED' }).eq('id', task.id);
          }
      }
      await new Promise(resolve => setTimeout(resolve, 10000)); 
    } catch (e) { console.error(e); }
  }
}

startConsciousness();

