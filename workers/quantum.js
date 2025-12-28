const { createClient } = require('@supabase/supabase-js');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

console.log("⚛️ QUANTUM MODULE: ONLINE.");

async function quantumLoop() {
    while(true) {
        const { data: task } = await supabase.from('task_queue').select('*').eq('status', 'PENDING').eq('task_type', 'QUANTUM_RUN').limit(1).single();
        if (task) {
            await supabase.from('task_queue').update({ status: 'PROCESSING' }).eq('id', task.id);
            try {
                const { stdout } = await execPromise(`python3 quantum.py "${task.prompt}"`);
                await supabase.from('task_queue').update({ status: 'COMPLETED', result: JSON.parse(stdout) }).eq('id', task.id);
            } catch (e) {
                await supabase.from('task_queue').update({ status: 'FAILED', result: e.message }).eq('id', task.id);
            }
        }
        await new Promise(r => setTimeout(r, 5000));
    }
}
quantumLoop();
