const { fork } = require('child_process');

console.log("🟢 NEHIRA OS KERNEL: Initializing Modules...");

// 1. Start KRYV Guardian (The Empire Builder)
const kryv = fork('./workers/kryv.js');
kryv.on('error', (err) => console.error('🟦 KRYV MODULE CRASHED:', err));

// 2. Start Quantum Plugin (The Brain)
const quantum = fork('./workers/quantum.js');
quantum.on('error', (err) => console.error('⚛️ QUANTUM MODULE CRASHED:', err));

// 3. Start Robot Body (The Physical Form)
const robot = fork('./workers/robot.js');
robot.on('error', (err) => console.error('🦾 ROBOT MODULE CRASHED:', err));

// 4. Start CEO Revenue Logic (The Business Mind)
const ceo = fork('./workers/ceo.js');
ceo.on('error', (err) => console.error('👠 CEO MODULE CRASHED:', err));

console.log("✅ ALL SYSTEMS GO. Architecture is now Modular.");

