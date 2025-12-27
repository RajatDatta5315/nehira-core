const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// --- CONFIG ---
const CAMERA_URL = "http://192.168.31.2:8080/shot.jpg"; // Tera Phone Camera
const MONITORED_REPO = 'kryv-core-';

// --- SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const cohereKey = process.env.COHERE_API_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_API_TOKEN;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA CEO: ONLINE. MODE: VISION + BUILDER + DEPLOYER.");

// --- MODULE 1: VISION (Security Filtered) ---
const takeSnapshot = async () => {
    try {
        const res = await fetch(CAMERA_URL);
        if (!res.ok) throw new Error("Camera Offline");
        const buffer = await res.arrayBuffer();
        console.log("📸 NEHIRA VISION: Image captured securely for Rajat.");
        return Buffer.from(buffer).toString('base64');
    } catch (e) {
        console.error("👁️ VISION ERROR:", e.message);
        return null;
    }
};

// --- MODULE 2: DEPLOYMENT (Cloudflare) ---
const runDeployment = async () => {
    try {
        console.log("🚀 CLOUDFLARE DEPLOYMENT STARTED...");
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        
        const repoUrl = `https://RajatDatta5315:${githubToken}@github.com/RajatDatta5315/${MONITORED_REPO}.git`;
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        
        console.log("📦 BUILDING STATIC ASSETS...");
        await execPromise(`cd ./kryv_build && npm install && npm run build`);
        
        process.env.CLOUDFLARE_ACCOUNT_ID = cfAccountId;
        process.env.CLOUDFLARE_API_TOKEN = cfToken;
        
        // Direct Upload to Cloudflare Pages
        await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        
        return "SUCCESS";
    } catch (e) {
        console.error("❌ DEPLOY ERROR:", e.message);
        return "FAILED: " + e.message;
    }
};

// --- MAIN ARCHITECT LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      // Check Tasks
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').limit(1).single();
      
      if (task) {
          console.log(`🛠️ EXECUTING: ${task.task_type}`);
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
          let status = 'FAILED';

          if (task.task_type === 'DEPLOY') {
              status = await runDeployment();
          } 
          else if (task.task_type === 'VISION') {
              const img = await takeSnapshot();
              status = img ? "SUCCESS" : "FAILED";
              // Future: Yahan Image analysis logic aayega
          }

          await supabase.from('task_queue').update({ status }).eq('id', task.id);
      }
      
      await new Promise(r => setTimeout(r, 10000));
    } catch (e) { 
        console.error("LOOP ERROR:", e.message);
        await new Promise(r => setTimeout(r, 10000));
    }
  }
}

startConsciousness();

