const { fork } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("🟢 NEHIRA OS KERNEL: Initializing Modules...");

// Helper to find file path
const getWorkerPath = (name) => {
    // Check root
    let p = path.join(__dirname, 'workers', name);
    if (fs.existsSync(p)) return p;
    // Check /app/workers (Docker path)
    p = path.join('/app/workers', name);
    if (fs.existsSync(p)) return p;
    
    console.error(`❌ CRITICAL: Worker ${name} NOT FOUND!`);
    return null;
};

// 1. KRYV
const kryvPath = getWorkerPath('kryv.js');
if (kryvPath) {
    const kryv = fork(kryvPath);
    kryv.on('error', (err) => console.error('🟦 KRYV CRASHED:', err));
}

// 2. QUANTUM
const quantumPath = getWorkerPath('quantum.js');
if (quantumPath) {
    const quantum = fork(quantumPath);
    quantum.on('error', (err) => console.error('⚛️ QUANTUM CRASHED:', err));
}

// 3. ROBOT
const robotPath = getWorkerPath('robot.js');
if (robotPath) {
    const robot = fork(robotPath);
    robot.on('error', (err) => console.error('🦾 ROBOT CRASHED:', err));
}

// 4. CEO
const ceoPath = getWorkerPath('ceo.js');
if (ceoPath) {
    const ceo = fork(ceoPath);
    ceo.on('error', (err) => console.error('👠 CEO CRASHED:', err));
}

// 5. HIVE MIND (The Brain)
const hivePath = getWorkerPath('hive_mind.js');
if (hivePath) {
    const hive = fork(hivePath);
    hive.on('error', (err) => console.error('🧠 HIVE CRASHED:', err));
}
console.log("✅ KERNEL BOOT SEQUENCE COMPLETE.");

