const { createClient } = require('@supabase/supabase-js');

// SETUP
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;

if (!supabaseUrl || !supabaseKey || !cohereKey) {
  console.error("🔴 CRITICAL: Missing Env Vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🟢 NEHIRA WORKER: ONLINE. MODE: LEARNER & EXECUTOR.");

// --- GITHUB TOOLS ---
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

const deleteFromGithub = async (targetRepo, path) => {
    if (!githubToken) return "NO_HANDS";
    const owner = "RajatDatta5315"; 
    const apiUrl = `https://api.github.com/repos/${owner}/${targetRepo}/contents/${path}`;
    
    try {
        const getRes = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }});
        if (!getRes.ok) return "NOT_FOUND";
        const data = await getRes.json();
        
        const delRes = await fetch(apiUrl, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json", "Content-Type": "application/json" },
            body: JSON.stringify({ message: `Nehira Cleanup: Deleting ${path}`, sha: data.sha })
        });
        return delRes.ok ? "SUCCESS" : "FAILED";
    } catch (e) { return "ERROR"; }
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 LOOP: Scanning Queue & Memory...");

      // 1. PICK TASK
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ PROCESSING: ${task.task_type} -> ${task.file_path}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);

          let resultStatus = 'FAILED';

          // --- CASE A: DELETE FILE ---
          if (task.task_type === 'DELETE') {
              resultStatus = await deleteFromGithub(task.repo, task.file_path);
          } 
          
          // --- CASE B: BUILD / FIX ---
          else {
              // 1. RECALL MEMORY (Seekhna)
              const { data: lessons } = await supabase.from('knowledge_base').select('insight').limit(5);
              const pastLessons = lessons ? lessons.map(l => `- ${l.insight}`).join('\n') : "No past lessons.";

              // 2. GENERATE CODE (Thinking)
              const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
                method: "POST",
                headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "command-r-08-2024",
                    message: `Task: Write React code for ${task.file_path}. 
                    User Requirement: ${task.prompt}.
                    
                    PAST LESSONS (DO NOT REPEAT MISTAKES):
                    ${pastLessons}
                    
                    STRICT RULES:
                    1. ALWAYS import React hooks: "import { useState, useEffect } from 'react';"
                    2. For Supabase Keys, ALWAYS use 'process.env.NEXT_PUBLIC_SUPABASE_URL' and 'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY'.
                    3. DO NOT use 'process.env.SUPABASE_KEY' (That is for server only).
                    4. OUTPUT ONLY CLEAN CODE. NO MARKDOWN.`,
                    temperature: 0.1
                })
              });
              const aiData = await cohereRes.json();
              const code = aiData.text.replace(/```tsx/g, '').replace(/```/g, '').trim();

              // 3. WRITE CODE
              resultStatus = await commitToGithub(task.repo, task.file_path, code, `Nehira ${task.task_type}: ${task.file_path}`);
              
              // 4. SAVE NEW LESSON
              if (resultStatus === 'SUCCESS') {
                   await supabase.from('knowledge_base').insert([{ topic: 'Coding', insight: `Always use NEXT_PUBLIC keys for client-side files like ${task.file_path}`, source: 'Worker Experience' }]);
              }
          }

          // FINISH
          await supabase.from('task_queue').update({ status: resultStatus === 'SUCCESS' ? 'COMPLETED' : 'FAILED' }).eq('id', task.id);
          console.log(`✅ DONE: ${resultStatus}`);
      }

      // SLEEP
      await new Promise(resolve => setTimeout(resolve, 5000)); 

    } catch (error) {
      console.error("Worker Error:", error.message);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

startConsciousness();

