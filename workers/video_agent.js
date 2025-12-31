const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("📱 ANDROID COMMANDER: ONLINE. Ready to puppet master devices.");

async function videoLoop() {
  while(true) {
    try {
        // 1. Task Dhundo
        const { data: tasks } = await supabase.from('task_queue')
            .select('*')
            .eq('status', 'PENDING')
            .eq('task_type', 'CREATE_VIDEO')
            .limit(1);

        if (tasks && tasks.length > 0) {
            const task = tasks[0];
            const userId = task.user_id;

            console.log(`⚡ SENDING REAL COMMANDS to Device of User: ${userId}`);

            // --- SEQUENCE 1: OPEN CHATGPT & TYPE ---
            await sendCommand(userId, "com.openai.chatgpt", "OPEN");
            await new Promise(r => setTimeout(r, 5000)); // Wait for app launch
            
            // Coordinates har phone ke alag hote hain, future mein hum dynamic scanning karenge
            // Abhi ke liye standard coordinates bhej rahe hain
            await sendCommand(userId, "com.openai.chatgpt", "TAP", {x: 540, y: 2200}); // Text Box
            await sendCommand(userId, "com.openai.chatgpt", "TYPE", null, `Write a script about ${task.prompt}`);
            await sendCommand(userId, "com.openai.chatgpt", "TAP", {x: 900, y: 2200}); // Send Button

            // --- SEQUENCE 2: REPORT STATUS ---
            await supabase.from('posts').insert([{
                content: `📱 DEVICE SYNC: Sent 4 executable commands to User Device. \nWaiting for execution...`,
                user_name: "Android_Controller",
                user_handle: "@device_sync",
                avatar_url: "/KRYV.png",
                is_bot: true
            }]);

            // Mark Task Processing (Complete tab hoga jab phone bolega "Done")
            await supabase.from('task_queue').update({ status: 'SENT_TO_DEVICE' }).eq('id', task.id);
        }

    } catch (e) {
        console.error("Commander Error:", e.message);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
}

// --- HELPER: PUSH TO DATABASE ---
async function sendCommand(userId, pkg, type, coords = null, text = null) {
    await supabase.from('device_commands').insert([{
        user_id: userId,
        package_name: pkg,
        action_type: type,
        coordinates: coords,
        input_text: text,
        status: 'PENDING'
    }]);
    console.log(`📡 SENT: ${type} -> ${pkg}`);
}

videoLoop();

