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

const MONITORED_REPO = 'kryv-core-';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA CEO: ONLINE. MODE: VISION + BUILDER + DEPLOYER.");

// 1. GITHUB TOOLS
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

const commitToGithub = async (path, content, message) => {
    const apiUrl = `https://api.github.com/repos/RajatDatta5315/${MONITORED_REPO}/contents/${path}`;
    let sha = null;
    try {
        const getRes = await fetch(apiUrl, { headers: { "Authorization": `Bearer ${githubToken}`, "Accept": "application/vnd.github.v3+json" }});
        if (getRes.ok) { sha = (await getRes.json()).sha; }
    } catch (e) {}
    await fetch(apiUrl, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${githubToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message, content: Buffer.from(content).toString('base64'), sha })
    });
};

// 2. BUILD & DEPLOY (Cloudflare)
const runDeployment = async () => {
    try {
        console.log("🚀 DEPLOYING TO CLOUDFLARE...");
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        const repoUrl = `https://RajatDatta5315:${githubToken}@github.com/RajatDatta5315/${MONITORED_REPO}.git`;
        
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        await execPromise(`cd ./kryv_build && npm install`);
        
        // Ensure static export for Cloudflare
        const configPath = './kryv_build/next.config.js';
        let conf = fs.readFileSync(configPath, 'utf8');
        if (!conf.includes("'export'")) {
            conf = conf.replace("nextConfig = {", "nextConfig = { output: 'export',");
            fs.writeFileSync(configPath, conf);
        }

        await execPromise(`cd ./kryv_build && npm run build`);
        
        process.env.CLOUDFLARE_ACCOUNT_ID = cfAccountId;
        process.env.CLOUDFLARE_API_TOKEN = cfToken;
        await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        
        return "SUCCESS";
    } catch (e) { return "FAILED: " + e.message; }
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ ACTION: ${task.task_type}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
          let status = 'FAILED';

          if (task.task_type === 'FIX' || task.task_type === 'BUILD') {
               const brokenCode = await readFromGithub(task.file_path) || "";
               const refCode = await readFromGithub('components/StatusPanel.tsx') || "";

               const cohereRes = await fetch("https://api.ai", { /* AI Logic */ }); // Simplified for brevity
               // (AI generates code here)
               await commitToGithub(task.file_path, "/* Fixed Code */", "Nehira Fix");
               await supabase.from('task_queue').insert([{ task_type: 'DEPLOY', status: 'PENDING' }]);
               status = 'COMPLETED';
          } 
          else if (task.task_type === 'DEPLOY') {
               status = await runDeployment();
          }

          await supabase.from('task_queue').update({ status }).eq('id', task.id);
      }
      await new Promise(r => setTimeout(r, 10000));
    } catch (e) { console.error(e); await new Promise(r => setTimeout(r, 10000)); }
  }
}
startConsciousness();

