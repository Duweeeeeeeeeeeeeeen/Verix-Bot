const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'dashboard', 'client', 'src', 'pages', 'config', '[guildId]');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));

files.forEach(file => {
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    let changed = false;

    // 1. Replace button toggle
    const buttonRegex = /<button[\s\n]*className=\{`pc-status-toggle-v2 \$\{config\.enabled \? 'active' : ''\}`\}[\s\n]*onClick=\{\(\) => setConfig\(\{\.\.\.config, enabled: !config\.enabled\}\)\}[\s\n]*>[\s\n]*<Power size=\{18\} \/>[\s\n]*<span>\{config\.enabled \? t\('common\.active'\) : t\('common\.inactive'\)\}<\/span>[\s\n]*<\/button>/g;
    
    // Also try without t('common.active') if some files hardcode it
    const buttonRegex2 = /<button[\s\n]*className=\{`pc-status-toggle-v2 \$\{config\.enabled \? 'active' : ''\}`\}[\s\n]*onClick=\{\(\) => setConfig\(\{\.\.\.config, enabled: !config\.enabled\}\)\}[\s\n]*>[\s\n]*<Power size=\{18\} \/>[\s\n]*<span>[^<]*<\/span>[\s\n]*<\/button>/g;

    const newToggle = `
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-badge)', padding: '10px 20px', borderRadius: '14px', border: '1.5px solid var(--border)' }}>
                    <label className="pc-toggle-v2" style={{ position: 'relative', width: '42px', height: '22px' }}>
                        <input 
                            type="checkbox" 
                            style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                            checked={config.enabled} 
                            onChange={() => setConfig({...config, enabled: !config.enabled})} 
                        />
                        <span style={{ 
                            position: 'absolute', cursor: 'pointer', inset: 0, 
                            background: config.enabled ? '#10b981' : '#ef4444', 
                            transition: '.4s', borderRadius: '34px' 
                        }}>
                            <span style={{
                                position: 'absolute', content: '""', height: '16px', width: '16px', 
                                left: config.enabled ? '23px' : '3px', bottom: '3px', 
                                background: '#fff', transition: '.4s', borderRadius: '50%'
                            }}></span>
                        </span>
                    </label>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: config.enabled ? '#10b981' : '#ef4444' }}>
                        {config.enabled ? t('common.active') : t('common.inactive')}
                    </span>
                </div>
`.trim();

    if (buttonRegex.test(content) || buttonRegex2.test(content)) {
        content = content.replace(buttonRegex, newToggle);
        content = content.replace(buttonRegex2, newToggle);
        changed = true;
    }

    // 2. Fix pc-status-tag-v2 CSS
    if (content.includes('.pc-status-tag-v2 {')) {
        const oldCss = /\.pc-status-tag-v2 \{[^}]+\}/g;
        content = content.replace(oldCss, (match) => {
            if (!match.includes('width: fit-content')) {
                return match.replace('}', ' width: fit-content; }');
            }
            return match;
        });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(path.join(dir, file), content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
