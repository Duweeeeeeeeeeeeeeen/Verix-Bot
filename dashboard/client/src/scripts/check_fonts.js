const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'e:/BOT Discord/dashboard/client/src/pages/config/[guildId]';

if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Directory not found: ${TARGET_DIR}`);
    process.exit(1);
}

const files = fs.readdirSync(TARGET_DIR);
const fonts = new Set();

files.forEach(file => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(TARGET_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const matches = content.match(/font-family:\s*['"]([^'"]+)['"]/g);
    if (matches) {
        matches.forEach(m => fonts.add(m));
    }
    
    const matchesInline = content.match(/fontFamily:\s*['"]([^'"]+)['"]/g);
    if (matchesInline) {
        matchesInline.forEach(m => fonts.add(m));
    }
});

console.log('Unique font definitions found:');
fonts.forEach(f => console.log(f));
