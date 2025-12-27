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

// Monitor (Ab hum Vercel check nahi karenge, Database check karenge)
const MONITORED_REPO = 'kryv-core-';

if (!supabaseUrl || !supabaseKey || !cohereKey || !githubToken || !cfAccountId || !cfToken) {
  console.error("🔴 CEO ALERT: Missing Keys (Cloudflare/Supabase/GitHub).");
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log("🟢 NEHIRA CEO: ONLINE. BUILDER MODULE ACTIVE.");

// --- TOOLS ---

// 1. DOWNLOAD CODE FROM GITHUB (Clone)
const cloneAndSetup = async () => {
    try {
        console.log("📥 CLONING KRYV...");
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        
        // Clone using Token
        const repoUrl = `https://RajatDatta5315:${githubToken}@github.com/RajatDatta5315/${MONITORED_REPO}.git`;
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        
        console.log("📦 INSTALLING DEPS...");
        await execPromise(`cd ./kryv_build && npm install`);
        return true;
    } catch (e) {
        console.error("Clone/Install Failed:", e.message);
        return false;
    }
};

// 2. BUILD NEXT.JS (Static Export)
const buildProject = async () => {
    try {
        console.log("🔨 BUILDING PROJECT...");
        // Ensure next.config.js has output: 'export' (Force add if missing - Hacky but safe)
        const configFile = './kryv_build/next.config.js';
        let configContent = fs.readFileSync(configFile, 'utf8');
        if (!configContent.includes("output: 'export'")) {
             configContent = configContent.replace("nextConfig = {", "nextConfig = { output: 'export',");
             fs.writeFileSync(configFile, configContent);
        }

        // Build
        await execPromise(`cd ./kryv_build && npm run build`);
        return true;
    } catch (e) {
        console.error("Build Failed:", e.message);
        // Log Error to Database so Nehira can fix it next time
        return false;
    }
};

// 3. DEPLOY TO CLOUDFLARE
const deployToCloudflare = async () => {
    try {
        console.log("☁️ UPLOADING TO CLOUDFLARE...");
        // Use Wrangler to deploy 'out' folder
        process.env.CLOUDFLARE_ACCOUNT_ID = cfAccountId;
        process.env.CLOUDFLARE_API_TOKEN = cfToken;
        
        await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        return "SUCCESS";
    } catch (e) {
        console.error("Deploy Failed:", e.message);
        return "FAILED";
    }
};

// --- MAIN LOOP ---
async function startConsciousness() {
  while (true) {
    try {
      console.log("🧠 CEO SCANNING FOR DEPLOYS...");

      // CHECK TASK QUEUE FOR 'DEPLOY' command
      const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').eq('task_type', 'DEPLOY').limit(1).single();
      
      if (task) {
          console.log("🚀 STARTING DEPLOYMENT SEQUENCE...");
          await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);

          // STEP 1: CLONE
          const cloned = await cloneAndSetup();
          if (!cloned) throw new Error("Clone Failed");

          // STEP 2: BUILD
          const built = await buildProject();
          if (!built) throw new Error("Build Failed");

          // STEP 3: DEPLOY
          const status = await deployToCloudflare();
          
          await supabase.from('task_queue').update({ status: status === 'SUCCESS' ? 'COMPLETED' : 'FAILED' }).eq('id', task.id);
          console.log(`✅ DEPLOYMENT ${status}`);
      }

      // Baki Fix/Work Logic same rahega... (Space bachane ke liye maine sirf Deploy logic likha hai)
      // Agar tujhe FIX logic bhi chahiye isi file mein, toh bata, main merge kar dunga.
      
      await new Promise(resolve => setTimeout(resolve, 10000)); 
    } catch (e) { console.error(e); await new Promise(resolve => setTimeout(resolve, 10000)); }
  }
}

startConsciousness();

