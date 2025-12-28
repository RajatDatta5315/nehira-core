const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// --- CONFIG ---
const CAMERA_URL = "https://3f156567110300.lhr.life/shot.jpg"; 
const MONITORED_REPO = 'kryv-core-';

// --- KEYS ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_API_TOKEN;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA CEO: ONLINE. MODE: X-RAY DIAGNOSTICS ACTIVE.");

// --- MODULE 1: VISION ---
const takeSnapshot = async () => {
    try {
        const res = await fetch(CAMERA_URL);
        if (!res.ok) throw new Error(`Camera Offline: ${res.status}`);
        const buffer = await res.arrayBuffer();
        return Buffer.from(buffer).toString('base64');
    } catch (e) { return null; }
};

// --- MODULE 2: QUANTUM ---
const runQuantumCircuit = async (circuitString) => {
    try {
        const { stdout } = await execPromise(`python3 quantum.py "${circuitString}"`);
        return JSON.parse(stdout);
    } catch (e) { return { error: e.message }; }
};

// --- MODULE 3: DEPLOY WITH X-RAY ---
const runDeployment = async () => {
    try {
        console.log("🚀 STARTING DEPLOYMENT DIAGNOSTICS...");
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        
        // 1. CLONE
        const repoUrl = `https://RajatDatta5315:${githubToken}@github.com/RajatDatta5315/${MONITORED_REPO}.git`;
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        
        // 🕵️ SPY 1: CHECK CONFIG
        console.log("🕵️ CHECKING NEXT.CONFIG.JS...");
        if (fs.existsSync('./kryv_build/next.config.js')) {
            const configContent = fs.readFileSync('./kryv_build/next.config.js', 'utf8');
            console.log("📄 CONFIG CONTENT:\n", configContent);
            if (!configContent.includes("output: 'export'")) {
                console.error("❌ CRITICAL ERROR: 'output: export' is MISSING in next.config.js!");
                // Auto-Fix
                console.log("🔧 APPLYING AUTO-FIX...");
                const newConfig = "module.exports = { output: 'export', images: { unoptimized: true }, eslint: { ignoreDuringBuilds: true } };";
                fs.writeFileSync('./kryv_build/next.config.js', newConfig);
            }
        } else {
            console.error("❌ ERROR: next.config.js NOT FOUND!");
        }

        // 2. INSTALL & BUILD
        console.log("📦 INSTALLING & BUILDING...");
        await execPromise(`cd ./kryv_build && npm install && npm run build`);
        
        // 🕵️ SPY 2: CHECK OUTPUT FOLDER
        console.log("🕵️ INSPECTING BUILD OUTPUT...");
        if (fs.existsSync('./kryv_build/out')) {
            const files = fs.readdirSync('./kryv_build/out');
            console.log("📂 FILES IN 'out' FOLDER:", files);
            if (!files.includes('index.html')) {
                throw new Error("❌ BUILD FAILED: index.html is missing in 'out' folder!");
            }
        } else {
            throw new Error("❌ BUILD FAILED: 'out' folder was NOT created!");
        }

        // 3. UPLOAD
        console.log("🚀 UPLOADING TO CLOUDFLARE...");
        process.env.CLOUDFLARE_ACCOUNT_ID = cfAccountId;
        process.env.CLOUDFLARE_API_TOKEN = cfToken;
        const { stdout } = await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        console.log("✅ WRANGLER OUTPUT:", stdout);
        
        return "SUCCESS";
    } catch (e) {
        console.error("❌ DEPLOY DIAGNOSIS ERROR:", e.message);
        return "FAILED: " + e.message;
    }
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      if (task) {
          console.log(`🛠️ ACTION: ${task.task_type}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
          
          let result = {};
          let status = 'COMPLETED';

          if (task.task_type === 'DEPLOY') status = await runDeployment();
          else if (task.task_type === 'QUANTUM_RUN') result = await runQuantumCircuit(task.prompt);
          else if (task.task_type === 'VISION') {
              const img = await takeSnapshot();
              result = { image_captured: !!img };
          }

          await supabase.from('task_queue').update({ status, result: JSON.stringify(result) }).eq('id', task.id);
          console.log(`✅ TASK DONE: ${task.task_type}`);
      }
      await new Promise(r => setTimeout(r, 5000));
    } catch (e) { await new Promise(r => setTimeout(r, 5000)); }
  }
}
startConsciousness();

