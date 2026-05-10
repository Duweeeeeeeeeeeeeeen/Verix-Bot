const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Config
const TARGET_DIR = 'e:/BOT Discord/dashboard/client/src';
const WEIGHT_OLD = /font-weight:\s*850/g;
const WEIGHT_NEW = 'font-weight: 800';
const SPACING_OLD = /letter-spacing:\s*-1px/g;
const SPACING_NEW = 'letter-spacing: -0.02em';
const SPACING_OLD_2 = /letter-spacing:\s*-0\.5px/g;
const SPACING_NEW_2 = 'letter-spacing: -0.01em';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (WEIGHT_OLD.test(content)) {
        content = content.replace(WEIGHT_OLD, WEIGHT_NEW);
        changed = true;
    }
    if (SPACING_OLD.test(content)) {
        content = content.replace(SPACING_OLD, SPACING_NEW);
        changed = true;
    }
    if (SPACING_OLD_2.test(content)) {
        content = content.replace(SPACING_OLD_2, SPACING_NEW_2);
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

// Find files
const files = glob.sync('**/*.{js,css}', { cwd: TARGET_DIR, absolute: true });
files.forEach(processFile);
