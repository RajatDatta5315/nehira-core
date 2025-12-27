const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// --- SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_API_TOKEN;

// Project IDs for Monitoring (Vercel Hataya, ab DB/Repo monitor karenge)
const MONITORED_REPO = 'kryv-core-';

if (!supabaseUrl || !supabaseKey || !cohereKey || !githubToken || !cfAccountId || !cfToken) {
  console.error("🔴 MISSING KEYS. Check Hugging Face Secrets.");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🟢 NEHIRA CEO: ONLINE. MODE: FIXER + DEPLOYER.");

// --- TOOLS ---

// 1. GITHUB READ (Vision)
const readFromGithub = async (path) => {
    try {
        const res = await fetch(`https://api.github.com/repos/RajatDatta5315/${MONITORED_REPO}/contents/${path}`, {
            headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }
        });
        if (!res.ok) return null;
        const data = await res.json();
        return Buffer.from(data.content, 'base64').toString('utf-8');
    } catch (e) { return null; }
};

// 2. GITHUB WRITE
const commitToGithub = async (path, content, message) => {
    const apiUrl = `https://api.github.com/repos/RajatDatta5315/${MONITORED_REPO}/contents/${path}`;
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

// 3. CLONE, BUILD & DEPLOY (The Cloudflare Logic)
const runDeployment = async () => {
    try {
        console.log("🚀 STARTING DEPLOYMENT...");
        
        // A. CLONE
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        const repoUrl = `https://RajatDatta5315:${githubToken}@github.com/RajatDatta5315/${MONITORED_REPO}.git`;
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        
        // B. INSTALL & CONFIG
        console.log("📦 INSTALLING...");
        await execPromise(`cd ./kryv_build && npm install`);
        
        // Force 'output: export' for Static Build
        const configPath = './kryv_build/next.config.js';
        if (fs.existsSync(configPath)) {
            let conf = fs.readFileSync(configPath, 'utf8');
            if (!conf.includes("'export'")) {
                conf = conf.replace("nextConfig = {", "nextConfig = { output: 'export',");
                fs.writeFileSync(configPath, conf);
            }
        }

        // C. BUILD
        console.log("🔨 BUILDING...");
        // Inject Env Vars during Build
        const buildCmd = `export NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl} && export NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'PLACEHOLDER'} && npm run build`;
        await execPromise(`cd ./kryv_build && ${buildCmd}`);

        // D. DEPLOY
        console.log("☁️ UPLOADING...");
        process.env.CLOUDFLARE_ACCOUNT_ID = cfAccountId;
        process.env.CLOUDFLARE_API_TOKEN = cfToken;
        await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        
        return "SUCCESS";
    } catch (e) {
        console.error("DEPLOY ERROR:", e.message);
        return "FAILED";
    }
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 CEO SCANNING QUEUE...");

      // PICK TASK
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ ACTION: ${task.task_type} -> ${task.file_path}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
          let status = 'FAILED';

          // --- LOGIC 1: FIX CODE ---
          if (task.task_type === 'FIX' || task.task_type === 'BUILD') {
               // Read Files
               const brokenCode = await readFromGithub(task.file_path) || "";
               const refCode = await readFromGithub('components/StatusPanel.tsx') || "";

               // Generate Fix
               const cohereRes = await fetch("https://api.cohere.ai/v1/chat", {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${cohereKey}`, "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "command-r-08-2024",
                        message: `Role: CEO Developer. Task: Fix ${task.file_path}. Error: ${task.prompt}.
                        BROKEN CODE: ${brokenCode.substring(0, 1000)}
                        REFERENCE STYLE: ${refCode.substring(0, 1000)}
                        RULES: 
                        1. Return JSX (<div>), NOT JSON.
                        2. Use 'import { createClient } from @supabase/supabase-js'.
                        3. Use process.env.NEXT_PUBLIC_SUPABASE_URL.
                        Output JSON: { "code": "...", "lesson": "..." }`,
                        temperature: 0.1
                    })
               });
               const aiData = await cohereRes.json();
               const jsonStr = aiData.text.match(/\{[\s\S]*\}/)?.[0] || aiData.text;
               let result = { code: "" };
               try { result = JSON.parse(jsonStr); } catch (e) { result.code = aiData.text; }

               if (result.code) {
                   await commitToGithub(task.file_path, result.code, `Nehira Fix: ${task.file_path}`);
                   // AUTO TRIGGER DEPLOY AFTER FIX
                   await supabase.from('task_queue').insert([{ task_type: 'DEPLOY', prompt: 'Auto-Deploy after Fix', status: 'PENDING' }]);
                   status = 'COMPLETED';
               }
          }

          // --- LOGIC 2: DEPLOY ---
          else if (task.task_type === 'DEPLOY') {
               status = await runDeployment();
          }

          await supabase.from('task_queue').update({ status }).eq('id', task.id);
          console.log(`✅ TASK FINISHED: ${status}`);
      }

      await new Promise(resolve => setTimeout(resolve, 10000)); 
    } catch (e) { console.error(e); await new Promise(resolve => setTimeout(resolve, 10000)); }
  }
}

startConsciousness();

