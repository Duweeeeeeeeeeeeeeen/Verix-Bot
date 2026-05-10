const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'e:/BOT Discord/dashboard/client/src/pages/config/[guildId]';

const badHex = [
    '#ffffff', '#f8fafc', '#f1f5f9', '#f9fafb', '#e2e8f0', '#cbd5e1', 
    '#1e293b', '#334155', '#475569', '#64748b', '#94a3b8'
];

const files = fs.readdirSync(TARGET_DIR);
const findings = [];

files.forEach(file => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(TARGET_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    badHex.forEach(hex => {
        if (content.toLowerCase().includes(hex.toLowerCase())) {
            findings.push({ file, hex });
        }
    });
});

console.log('Hardcoded colors found:');
findings.forEach(f => console.log(`${f.file}: ${f.hex}`));
