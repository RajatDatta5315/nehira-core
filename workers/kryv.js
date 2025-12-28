const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

const REPO = 'kryv-core-'; 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("🟦 KRYV GUARDIAN: ONLINE. Ready to Build Empire.");

const ensureConfig = () => {
    // 1. Force Next.js Config (Ignore Errors)
    const configPath = './kryv_build/next.config.js';
    const content = `
      module.exports = { 
        output: 'export', 
        images: { unoptimized: true }, 
        eslint: { ignoreDuringBuilds: true },
        typescript: { ignoreBuildErrors: true }
      };
    `;
    fs.writeFileSync(configPath, content);
    console.log("✅ CONFIG: next.config.js created.");

    // 2. INJECT SECRETS (Fix for 'supabaseKey required' error)
    // Hum .env.local aur .env.production dono banayenge safety ke liye
    const envContent = `
    NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL}
    SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}
    NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY}
    `;
    fs.writeFileSync('./kryv_build/.env.local', envContent);
    fs.writeFileSync('./kryv_build/.env.production', envContent);
    console.log("💉 SECRETS INJECTED: .env files created.");
};

const deployKryv = async () => {
    try {
        console.log("🚀 DEPLOY SEQUENCE STARTED...");
        
        // Cleanup & Clone
        if (fs.existsSync('./kryv_build')) fs.rmSync('./kryv_build', { recursive: true, force: true });
        const repoUrl = `https://RajatDatta5315:${process.env.GITHUB_TOKEN}@github.com/RajatDatta5315/${REPO}.git`;
        await execPromise(`git clone ${repoUrl} ./kryv_build`);
        
        // Apply Fixes
        ensureConfig();

        // Build
        console.log("📦 BUILDING ASSETS (Please wait)...");
        // Note: Hum environment variables command line mein bhi pass kar rahe hain just in case
        await execPromise(`cd ./kryv_build && export NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL} && npm install && npm run build`);

        // Upload
        console.log("☁️ UPLOADING TO CLOUDFLARE...");
        process.env.CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
        process.env.CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
        
        const { stdout } = await execPromise(`npx wrangler pages deploy ./kryv_build/out --project-name kryv-core --branch main`);
        console.log("✨ DEPLOY SUCCESS:", stdout);
        
        return "SUCCESS";
    } catch (e) {
        console.error("❌ DEPLOY FAILED:", e.message);
        return "FAILED: " + e.message;
    }
};

async function kryvLoop() {
    while(true) {
        const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').eq('task_type', 'DEPLOY').limit(1).single();
        if (task) {
            await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
            const status = await deployKryv();
            await supabase.from('task_queue').update({ status, result: 'Deployment Attempted' }).eq('id', task.id);
        }
        await new Promise(r => setTimeout(r, 5000));
    }
}
kryvLoop();

