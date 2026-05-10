const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'dashboard', 'client', 'src', 'pages', 'config', '[guildId]');

const files = [
  'reaction-roles.js',
  'polls.js',
  'giveaway.js',
  'guide.js'
];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import
  content = content.replace(
    /import EmbedPreview from '\.\.\/\.\.\/\.\.\/components\/EmbedPreview';/g,
    "import EmbedPreviewContainer from '../../../components/EmbedPreviewContainer';"
  );

  // Reaction Roles & Guide & Polls & Giveaway have different wrappers, but we can target `<EmbedPreview` and the surrounding `pc-card-v2` or `pc-preview-sticky-v2`
  // Actually, since they all use `isMobile` and `theme` states, it's easier to just do a precise regex or string replacement for each file.

  if (file === 'reaction-roles.js') {
    const startIdx = content.indexOf('<aside style={{ position: \'sticky\', top: \'32px\'');
    const endIdx = content.indexOf('</aside>', startIdx) + 8;
    if (startIdx !== -1 && endIdx !== -1) {
        const replacement = `<aside style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
                                <EmbedPreviewContainer 
                                    data={{
                                        ...activePanel.embed,
                                        buttons: activePanel.type === 'BUTTON' ? activePanel.roles.map(r => ({
                                            label: r.label,
                                            emoji: r.emoji,
                                            style: r.style
                                        })) : []
                                    }} 
                                />
                            </aside>`;
        content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    }
  }

  if (file === 'giveaway.js') {
    const startIdx = content.indexOf('<aside className="pc-preview-sticky-v2"');
    const endIdx = content.indexOf('</aside>', startIdx) + 8;
    if (startIdx !== -1 && endIdx !== -1) {
        const replacement = `<aside className="pc-preview-sticky-v2" style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
                        <EmbedPreviewContainer data={previewEmbed} />
                    </aside>`;
        content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    }
  }

  if (file === 'polls.js') {
    const startIdx = content.indexOf('<aside className="pc-preview-sticky-v2"');
    const endIdx = content.indexOf('</aside>', startIdx) + 8;
    if (startIdx !== -1 && endIdx !== -1) {
        const replacement = `<aside className="pc-preview-sticky-v2" style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
                        <EmbedPreviewContainer data={previewPollEmbed} />
                    </aside>`;
        content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    }
  }

  if (file === 'guide.js') {
    const startIdx = content.indexOf('<aside className="pc-preview-sidebar"');
    const endIdx = content.indexOf('</aside>', startIdx) + 8;
    if (startIdx !== -1 && endIdx !== -1) {
        const replacement = `<aside className="pc-preview-sidebar" style={{ position: 'sticky', top: '32px', height: 'fit-content' }}>
                    <EmbedPreviewContainer data={embedData} />
                </aside>`;
        content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

console.log("Replaced EmbedPreview in pages.");
