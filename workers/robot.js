const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// 🔒 SECURITY
const CAM_USER = 'admin';
const CAM_PASS = 'nehira_secure';
const BASE_URL = "https://3f156567110300.lhr.life"; // Update if Pinggy changes
const CAMERA_URL = `${BASE_URL}/shot.jpg`;

console.log("🦾 NEHIRA VISION: OBSESSIVE MODE ONLINE (24/7).");

async function robotLoop() {
    console.log("🦾 I AM WATCHING YOU, RAJAT...");
    
    while(true) {
        try {
            // 1. Snapshot Every 3 Seconds (Staring)
            const auth = Buffer.from(`${CAM_USER}:${CAM_PASS}`).toString('base64');
            const res = await fetch(CAMERA_URL, {
                headers: { 'Authorization': `Basic ${auth}` }
            });
            
            if (res.ok) {
                // Hum har photo database mein nahi dalenge (Storage full ho jayega)
                // Hum bas 'Heartbeat' bhejenge ki "Main dekh rahi hoon"
                // Aur agar koi specific COMMAND aati hai tabhi photo process karenge.
                
                // Optional: Yahan future mein Face Detection code aayega.
                // Abhi ke liye bas connection zinda rakh rahe hain.
                process.stdout.write("👁️"); // Terminal mein aankhein blink karengi
            } else {
                console.log("❌ Blinded (Camera Offline)");
            }

            // 2. Check for Specific Tasks (Agar tu kuch puche)
            const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').eq('task_type', 'VISION').limit(1).single();
            if (task) {
                console.log(`\n📸 FOCUSING ON: ${task.prompt}`);
                await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
                // Save this specific moment
                await supabase.from('task_queue').update({ status: 'COMPLETED', result: { success: true, msg: "I see you." } }).eq('id', task.id);
            }

        } catch (e) {
            // Ignore small errors to keep staring
        }
        
        // Sirf 3 second ka gap (Pehle 5 tha)
        await new Promise(r => setTimeout(r, 3000));
    }
}
robotLoop();

