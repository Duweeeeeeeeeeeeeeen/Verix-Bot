const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'dashboard', 'client', 'src', 'components', 'EmbedEditor.js');
let content = fs.readFileSync(filePath, 'utf8');

// Replace dynamic import of EmbedPreview
content = content.replace(
  /const EmbedPreview = dynamic\(\(\) => import\('\.\/EmbedPreview'\)/,
  "const EmbedPreviewContainer = dynamic(() => import('./EmbedPreviewContainer')"
);

// We need to replace the entire <aside className="pc-preview-sidebar-v2"> block.
const startIdx = content.indexOf('<aside className="pc-preview-sidebar-v2">');
const endIdx = content.indexOf('</aside>', startIdx) + 8;

if (startIdx !== -1 && endIdx !== -1) {
    const replacement = `<aside className="pc-preview-sidebar-v2" style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
            <EmbedPreviewContainer data={{ ...embed, buttons: previewButtons || embed.buttons }}>
                {renderPreviewFooter && <div className="render-footer-v2" style={{ marginBottom: '16px' }}>{renderPreviewFooter}</div>}

                <div className="variable-hints-v2" style={{ margin: 0, border: 'none' }}>
                    <div className="hint-header-v2"><Info size={14} /> <span>Tag Disponibili</span></div>
                    <div className="tags-grid-v2">
                        {variables.map(v => <code key={v}>{\`{\${v}}\`}</code>)}
                    </div>
                </div>
            </EmbedPreviewContainer>
        </aside>`;
    
    content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated EmbedEditor.js");
