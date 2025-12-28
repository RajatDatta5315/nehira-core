const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🔒 SECURED URL (Username:Password)
const BASE_URL = "https://3f156567110300.lhr.life"; 
// Note: Pinggy/Ngrok pe basic auth URL format (user:pass@url) kabhi kabhi browser block karta hai, 
// lekin Node.js fetch mein ye header headers: { 'Authorization': 'Basic ...' } se bhejenge.
const USER = 'admin';
const PASS = 'nehira_secure';
const CAMERA_URL = `${BASE_URL}/shot.jpg`;

console.log("🦾 NEHIRA BODY: SECURE MODE ONLINE.");

async function robotLoop() {
    let heartbeat = 0;
    while(true) {
        heartbeat++;
        if(heartbeat % 12 === 0) console.log("💓 ROBOT ALIVE...");

        const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').eq('task_type', 'VISION').limit(1).single();

        if (task) {
            console.log(`👁️ TASK: ${task.prompt}`);
            await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
            try {
                // Auth Header Logic
                const auth = Buffer.from(`${USER}:${PASS}`).toString('base64');
                const res = await fetch(CAMERA_URL, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                
                if (!res.ok) throw new Error(`Auth/Cam Error: ${res.status}`);
                const buffer = await res.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                
                await supabase.from('task_queue').update({ status: 'COMPLETED', result: { success: true } }).eq('id', task.id);
                console.log("📸 SNAPSHOT SECURED.");
            } catch (e) {
                console.error("❌ VISION ERROR:", e.message);
                await supabase.from('task_queue').update({ status: 'FAILED', result: e.message }).eq('id', task.id);
            }
        }
        await new Promise(r => setTimeout(r, 5000));
    }
}
robotLoop().catch(err => console.error("CRASH:", err));
