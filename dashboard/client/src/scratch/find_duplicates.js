const fs = require('fs');
const path = require('path');

// Fixed path to the it.json file based on the error output
const filePath = 'e:\\BOT Discord\\dashboard\\client\\src\\locales\\it.json';
const content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');
const keyCounts = {};
const duplicates = [];

lines.forEach((line, index) => {
    const match = line.match(/^\s*"([^"]+)"\s*:/);
    if (match) {
        const key = match[1];
        if (keyCounts[key]) {
            keyCounts[key].push(index + 1);
            if (keyCounts[key].length === 2) {
                duplicates.push(key);
            }
        } else {
            keyCounts[key] = [index + 1];
        }
    }
});

console.log('--- Duplicate Keys Found ---');
duplicates.forEach(key => {
    console.log(`Key: "${key}" found at lines: ${keyCounts[key].join(', ')}`);
});
console.log('--- End of Report ---');
