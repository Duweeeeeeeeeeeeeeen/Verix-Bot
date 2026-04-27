import fs from 'fs';
import path from 'path';

function checkFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            checkFiles(fullPath);
        } else if (file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            // Simplified check for try without catch/finally
            // This is not perfect but can help find obvious issues
            const tryMatches = content.match(/try\s*\{/g);
            if (tryMatches) {
                const catchMatches = content.match(/catch\s*\(/g) || [];
                const catchNoParenMatches = content.match(/catch\s*\{/g) || [];
                const finallyMatches = content.match(/finally\s*\{/g) || [];
                const totalHandlers = catchMatches.length + catchNoParenMatches.length + finallyMatches.length;
                if (totalHandlers < tryMatches.length) {
                    console.log(`Potential issue in ${fullPath}: ${tryMatches.length} tries, ${totalHandlers} handlers`);
                }
            }
        }
    }
}

checkFiles('dashboard/api');
