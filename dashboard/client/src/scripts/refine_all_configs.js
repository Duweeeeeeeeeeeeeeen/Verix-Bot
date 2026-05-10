const fs = require('fs');
const path = require('path');

const TARGET_DIR = 'e:/BOT Discord/dashboard/client/src/pages/config/[guildId]';

const replacements = [
    // Typography normalization
    { old: /font-weight:\s*(800|850|900|950)/g, new: 'font-weight: 700' },
    { old: /fontWeight:\s*(800|850|900|950|'800'|'850'|'900'|'950'|"800"|"850"|"900"|"950")/g, new: 'fontWeight: 700' },
    { old: /letter-spacing:\s*(-1px|-1\.5px|-0\.5px|-1\.2px|-0\.01em|-0\.02em)/g, new: 'letter-spacing: normal' },
    { old: /font-family:\s*['"]Outfit['"]/g, new: "font-family: 'Inter', sans-serif" },
    { old: /fontFamily:\s*['"]Outfit['"]/g, new: "fontFamily: 'Inter', sans-serif" },
    
    // Color normalization (Hardcoded whites/grays to variables)
    { old: /#ffffff/gi, new: 'var(--bg-card)' },
    { old: /#f8fafc/gi, new: 'var(--bg-badge)' },
    { old: /#f1f5f9/gi, new: 'var(--bg-badge)' },
    { old: /#f9fafb/gi, new: 'var(--bg-badge)' },
    { old: /#e2e8f0/gi, new: 'var(--border)' },
    { old: /#cbd5e1/gi, new: 'var(--border)' },
    { old: /#1e293b/gi, new: 'var(--text-heading)' },
    { old: /#334155/gi, new: 'var(--text-main)' },
    { old: /#475569/gi, new: 'var(--text-muted)' },
    { old: /#64748b/gi, new: 'var(--text-muted)' },
    { old: /#94a3b8/gi, new: 'var(--text-dim)' },

    // Fix for inline styles in JSX
    { old: /fontWeight:\s*['"]800['"]/g, new: 'fontWeight: 800' },
    { old: /fontWeight:\s*['"]700['"]/g, new: 'fontWeight: 700' },
    { old: /fontWeight:\s*['"]600['"]/g, new: 'fontWeight: 600' }
];

if (!fs.existsSync(TARGET_DIR)) {
    console.error(`Directory not found: ${TARGET_DIR}`);
    process.exit(1);
}

const files = fs.readdirSync(TARGET_DIR);

files.forEach(file => {
    if (!file.endsWith('.js')) return;
    
    const filePath = path.join(TARGET_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    
    replacements.forEach(r => {
        if (r.old.test(content)) {
            content = content.replace(r.old, r.new);
            changed = true;
        }
    });
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Refined: ${file}`);
    }
});
