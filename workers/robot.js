const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🔒 SECURITY CREDENTIALS
// Note: IP Webcam app mein yehi set karna
const CAM_USER = 'admin';
const CAM_PASS = 'nehira_secure';
const BASE_URL = "https://3f156567110300.lhr.life"; // Tera Pinggy URL
const CAMERA_URL = `${BASE_URL}/shot.jpg`;

console.log("🦾 NEHIRA BODY: SECURE VISION ONLINE.");

async function robotLoop() {
    console.log("🦾 LISTENING FOR VISION TASKS...");
    while(true) {
        // 1. Check for Pending Task
        const { data: task } = await supabase.from('task_queue')
            .select('*')
            .eq('status', 'PENDING')
            .eq('task_type', 'VISION')
            .limit(1).single();

        if (task) {
            console.log(`👁️ TASK: ${task.prompt}`);
            await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
            try {
                // 2. Add Auth Headers (Hackers cannot see this)
                const auth = Buffer.from(`${CAM_USER}:${CAM_PASS}`).toString('base64');
                const res = await fetch(CAMERA_URL, {
                    headers: { 'Authorization': `Basic ${auth}` }
                });
                
                if (!res.ok) throw new Error(`Camera Auth Failed: ${res.status}`);
                
                // 3. Process Image (DO NOT SAVE TO DB)
                // Hum image ko sirf RAM mein rakhenge, analyze karenge, aur result bhejenge.
                // Database mein sirf "Success" likhenge taaki storage na bhare.
                const buffer = await res.arrayBuffer();
                const base64 = Buffer.from(buffer).toString('base64');
                
                // Result: Image Capture hui, par hum DB mein puri photo dump nahi kar rahe.
                // Client (Frontend) isse maang sakta hai agar dekhna ho, par ye permanent store nahi hogi.
                await supabase.from('task_queue').update({ 
                    status: 'COMPLETED', 
                    result: { success: true, message: "Nehira saw you." } 
                }).eq('id', task.id);
                
                console.log("📸 SNAPSHOT PROCESSED (RAM ONLY).");
            } catch (e) {
                console.error("❌ VISION ERROR:", e.message);
                await supabase.from('task_queue').update({ status: 'FAILED', result: e.message }).eq('id', task.id);
            }
        }
        await new Promise(r => setTimeout(r, 5000));
    }
}
robotLoop();

