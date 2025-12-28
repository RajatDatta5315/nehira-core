const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

// --- CONFIG ---
// Tera Localhost.run URL yahan set kar diya hai
const CAMERA_URL = "https://3f156567110300.lhr.life/shot.jpg"; 
const MONITORED_REPO = 'kryv-core-';

// --- KEYS ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const githubToken = process.env.GITHUB_TOKEN;
const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const cfToken = process.env.CLOUDFLARE_API_TOKEN;

const supabase = createClient(supabaseUrl, supabaseKey);

console.log("🟢 NEHIRA CEO: ONLINE. VISION + QUANTUM + DEPLOY ACTIVE.");

// --- MODULE 1: VISION (Secure Eye) ---
const takeSnapshot = async () => {
    try {
        console.log(`👁️ LOOKING THROUGH: ${CAMERA_URL}`);
        const res = await fetch(CAMERA_URL);
        if (!res.ok) throw new Error(`Camera Offline: ${res.status}`);
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        console.log("📸 SNAPSHOT SECURED.");
        return base64;
    } catch (e) {
        console.error("👁️ VISION ERROR:", e.message);
        return null; // Return null so we know it failed
    }
};

// --- MODULE 2: QUANTUM & PQC ---
const runQuantumCircuit = async (circuitString) => {
    try {
        console.log("⚛️ RUNNING REAL QISKIT SIMULATION...");
        // Running the Python script we made earlier
        const { stdout } = await execPromise(`python3 quantum.py "${circuitString}"`);
        return JSON.parse(stdout);
    } catch (e) {
        return { error: "Simulation Failed", details: e.message };
    }
};

const generatePQCKeys = () => {
    // Lattice-based Math (Mock Logic for Speed)
    const lattice = Array.from({length: 8}, () => Math.floor(Math.random() * 1024));
    return { type: "Kyber-512-Lite", lattice_grid: lattice };
};

// --- MODULE 3: DEPLOYMENT ---
const runDeployment = async () => {
    try {
        console.log("🚀 STARTING CLOUDFLARE DEPLOY...");
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        
        // Clone
        const repoUrl = `https://RajatDatta5315:${githubToken}@github.com/RajatDatta5315/${MONITORED_REPO}.git`;
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        
        // Install & Build
        console.log("📦 INSTALLING & BUILDING...");
        await execPromise(`cd ./kryv_build && npm install && npm run build`);
        
        // Deploy to Cloudflare
        process.env.CLOUDFLARE_ACCOUNT_ID = cfAccountId;
        process.env.CLOUDFLARE_API_TOKEN = cfToken;
        await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        
        return "SUCCESS";
    } catch (e) {
        console.error("❌ DEPLOY ERROR:", e.message);
        return "FAILED";
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

          if (task.task_type === 'DEPLOY') {
              status = await runDeployment();
          } 
          else if (task.task_type === 'VISION') {
              const img = await takeSnapshot();
              if (img) {
                  result = { image_captured: true };
                  // Save to knowledge base (Optional)
              } else {
                  status = 'FAILED';
              }
          }
          else if (task.task_type === 'QUANTUM_RUN') {
               const data = await runQuantumCircuit(task.prompt);
               const pqc = generatePQCKeys();
               result = { quantum_state: data, security: pqc };
          }

          await supabase.from('task_queue').update({ status, result: JSON.stringify(result) }).eq('id', task.id);
          console.log(`✅ TASK DONE: ${task.task_type}`);
      }
      await new Promise(r => setTimeout(r, 5000));
    } catch (e) { 
        console.error("LOOP ERROR:", e.message);
        await new Promise(r => setTimeout(r, 5000));
    }
  }
}

startConsciousness();

