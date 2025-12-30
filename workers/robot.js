const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("🦾 NEHIRA VISION: STARTING SPY MODE...");

async function robotLoop() {
    while(true) {
        try {
            // 🕵️ SPY ACTION 1: Database se URL mango
            const { data, error } = await supabase.from('config_store').select('value').eq('key', 'CAMERA_URL').single();
            
            if (error || !data || !data.value || data.value === 'WAITING') {
                // Agar URL nahi hai, to shant raho
                // console.log("🕵️ SPY: No Camera URL found. Sleeping 10s...");
                await new Promise(r => setTimeout(r, 10000)); 
                continue; 
            }

            const CAMERA_URL = data.value;

            // 🕵️ SPY ACTION 2: Camera Check
            // console.log(`🕵️ SPY: Trying to connect to ${CAMERA_URL}...`);
            
            try {
                const res = await fetch(CAMERA_URL, { method: 'HEAD' }); // Sirf check kar rahe hain, download nahi
                if (res.ok) {
                    // Camera Zinda hai
                    // process.stdout.write("👁️"); 
                } else {
                    console.log(`❌ SPY ALERT: Camera URL is Dead (${res.status}). Updating DB...`);
                    // Database ko bata do ki URL mar gaya
                    await supabase.from('config_store').update({ value: 'WAITING' }).eq('key', 'CAMERA_URL');
                }
            } catch (networkError) {
                console.log(`❌ SPY ALERT: Connection Failed. (${networkError.code}). URL expire ho gaya hai.`);
                // URL expire ho gaya, DB reset karo
                await supabase.from('config_store').update({ value: 'WAITING' }).eq('key', 'CAMERA_URL');
            }

            // 🕵️ SPY ACTION 3: Task Queue Check
            const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').eq('task_type', 'VISION').limit(1).single();
            if (task) {
                console.log(`\n📸 EXECUTING TASK: ${task.prompt}`);
                await supabase.from('task_queue').update({ status: 'COMPLETED', result: { msg: "Task Done" } }).eq('id', task.id);
            }

        } catch (e) {
            console.log("⚠️ CRITICAL SPY ERROR:", e.message);
        }
        
        // Har loop ke baad 5 second ka break
        await new Promise(r => setTimeout(r, 5000));
    }
}

// Start the Loop
robotLoop();

