import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { 
  Type, 
  Palette, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Code2, 
  Info,
  Monitor,
  Smartphone,
  Eye,
  Settings2,
  MousePointer2,
  Sun,
  Moon,
  Zap,
  AlignLeft,
  ChevronDown,
  Hash
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import CustomSelect from './CustomSelect';
import { useT } from '../contexts/LanguageContext';

const EmbedPreview = dynamic(() => import('./EmbedPreview'), {
  ssr: false,
  loading: () => <div className="embed-preview-skeleton" />
});

export default function EmbedEditor({ embed, onChange, variables = ['user', 'guild'], showButtonEditor = false, previewButtons, renderPreviewFooter }) {
  const { t } = useT();
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('dark');

  const updateEmbed = (key, value) => {
    onChange({ ...embed, [key]: value });
  };

  const addField = () => {
    const fields = [...(embed?.fields || [])];
    fields.push({ name: 'Nuovo Campo', value: 'Valore...', inline: false });
    updateEmbed('fields', fields);
  };

  const updateFieldEntry = (index, key, value) => {
    const fields = [...(embed?.fields || [])];
    fields[index] = { ...fields[index], [key]: value };
    updateEmbed('fields', fields);
  };

  const removeField = (index) => {
    const fields = (embed?.fields || []).filter((_, i) => i !== index);
    updateEmbed('fields', fields);
  };

  return (
    <div className="pc-embed-editor-v2 fade-in">
      <div className="pc-editor-layout-v2">
        <div className="pc-editor-form-v2">
          {/* Main Content Card */}
          <section className="pc-card-v2">
            <div className="card-header-v2">
                <div className="header-icon"><AlignLeft size={20} /></div>
                <h3>Contenuto Embed</h3>
            </div>
            <div className="card-body-v2">
                <div className="pc-input-group-v2">
                    <label>Titolo dell'Embed</label>
                    <div className="pc-input-wrapper-v2">
                        <Type size={16} className="input-icon" />
                        <input value={embed?.title || ''} onChange={e => updateEmbed('title', e.target.value)} placeholder="Inserisci titolo..." />
                    </div>
                </div>
                <div className="pc-input-group-v2" style={{ marginTop: '20px' }}>
                    <label>Descrizione / Testo Principale</label>
                    <textarea 
                        className="pc-textarea-v2" 
                        rows="5" 
                        value={embed?.description || ''} 
                        onChange={e => updateEmbed('description', e.target.value)} 
                        placeholder="Inserisci il contenuto del messaggio..."
                    />
                </div>
            </div>
          </section>

          {/* Style & Fields Card */}
          <section className="pc-card-v2">
            <div className="card-header-v2">
                <div className="header-icon"><Palette size={20} /></div>
                <h3>Stile & Campi</h3>
            </div>
            <div className="card-body-v2">
                <div className="pc-row-v2">
                    <div className="pc-input-group-v2">
                        <label>Colore Laterale</label>
                        <div className="pc-color-picker-wrapper-v2">
                            <input type="color" value={embed?.color?.startsWith('#') ? embed.color : '#6366f1'} onChange={e => updateEmbed('color', e.target.value)} />
                            <input className="hex-input-v2" value={embed?.color || ''} onChange={e => updateEmbed('color', e.target.value)} placeholder="#HEX" />
                        </div>
                    </div>
                    <div className="pc-input-group-v2">
                        <label>Testo Footer</label>
                        <div className="pc-input-wrapper-v2">
                            <Hash size={16} className="input-icon" />
                            <input value={embed?.footer || ''} onChange={e => updateEmbed('footer', e.target.value)} placeholder="Testo piccolo in basso..." />
                        </div>
                    </div>
                </div>

                <div className="pc-fields-manager-v2">
                    <div className="fields-header-v2">
                        <div className="align-center"><Code2 size={18} /> <span>Campi Dinamici</span></div>
                        <button className="btn-add-mini-v2" onClick={addField}><Plus size={16} /></button>
                    </div>
                    <div className="fields-list-v2">
                        {embed?.fields?.map((f, i) => (
                            <div key={i} className="field-entry-v2">
                                <input placeholder="Nome" value={f.name} onChange={e => updateFieldEntry(i, 'name', e.target.value)} />
                                <input placeholder="Valore" value={f.value} onChange={e => updateFieldEntry(i, 'value', e.target.value)} />
                                <button className="btn-del-mini-v2" onClick={() => removeField(i)}><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </section>

          {/* Media Card */}
          <section className="pc-card-v2">
            <div className="card-header-v2">
                <div className="header-icon"><ImageIcon size={20} /></div>
                <h3>Media & Immagini</h3>
            </div>
            <div className="card-body-v2">
                <div className="pc-row-v2">
                    <div className="pc-input-group-v2">
                        <label>Miniatura (Thumbnail)</label>
                        <input className="pc-input-modern" value={embed?.thumbnail || ''} onChange={e => updateEmbed('thumbnail', e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="pc-input-group-v2">
                        <label>Immagine Grande</label>
                        <input className="pc-input-modern" value={embed?.image || ''} onChange={e => updateEmbed('image', e.target.value)} placeholder="https://..." />
                    </div>
                </div>
            </div>
          </section>
        </div>

        {/* Floating Preview Section */}
        <aside className="pc-preview-sidebar-v2">
            <div className="preview-header-v2">
                <div className="align-center"><Eye size={18} /> <span>Anteprima Live</span></div>
                <div className="preview-controls-v2">
                    <button className={!isPreviewMobile ? 'active' : ''} onClick={() => setIsPreviewMobile(false)}><Monitor size={14} /></button>
                    <button className={isPreviewMobile ? 'active' : ''} onClick={() => setIsPreviewMobile(true)}><Smartphone size={14} /></button>
                    <div className="divider-v2" />
                    <button className={previewTheme === 'dark' ? 'active' : ''} onClick={() => setPreviewTheme('dark')}><Moon size={14} /></button>
                    <button className={previewTheme === 'light' ? 'active' : ''} onClick={() => setPreviewTheme('light')}><Sun size={14} /></button>
                </div>
            </div>

            <div className="preview-content-v2">
                <EmbedPreview data={{ ...embed, buttons: previewButtons || embed.buttons }} isMobile={isPreviewMobile} theme={previewTheme} />
                
                {renderPreviewFooter && <div className="render-footer-v2">{renderPreviewFooter}</div>}

                <div className="variable-hints-v2">
                    <div className="hint-header-v2"><Info size={14} /> <span>Tag Disponibili</span></div>
                    <div className="tags-grid-v2">
                        {variables.map(v => <code key={v}>{`{${v}}`}</code>)}
                    </div>
                </div>
            </div>
        </aside>
      </div>

      <style jsx>{`
        .pc-embed-editor-v2 { width: 100%; }
        .pc-editor-layout-v2 { display: grid; grid-template-columns: 1fr 420px; gap: 32px; align-items: start; }
        
        .pc-editor-form-v2 { display: flex; flex-direction: column; gap: 32px; }

        .pc-card-v2 { background: white; border: 1px solid var(--border-light); border-radius: 28px; padding: 24px; box-shadow: var(--shadow-premium); }
        .card-header-v2 { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .header-icon { width: 36px; height: 36px; background: var(--bg-badge); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .card-header-v2 h3 { margin: 0; font-size: 1.05rem; font-weight: 800; }

        .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
        .pc-input-group-v2 label { font-size: 0.65rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; padding-left: 4px; }
        
        .pc-input-wrapper-v2 { display: flex; align-items: center; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; transition: 0.2s; }
        .pc-input-wrapper-v2:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .pc-input-wrapper-v2 .input-icon { margin-left: 14px; color: var(--text-muted); opacity: 0.6; }
        .pc-input-wrapper-v2 input { width: 100%; border: none; background: transparent; padding: 10px 14px; font-weight: 700; outline: none; color: var(--text-main); font-size: 0.9rem; }

        .pc-textarea-v2 { width: 100%; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px; font-weight: 600; color: var(--text-main); outline: none; transition: 0.2s; resize: vertical; }
        .pc-textarea-v2:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

        .pc-row-v2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        .pc-color-picker-wrapper-v2 { display: flex; gap: 10px; }
        .pc-color-picker-wrapper-v2 input[type="color"] { width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-badge); cursor: pointer; padding: 3px; }
        .hex-input-v2 { flex: 1; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 0 14px; font-weight: 700; color: var(--text-main); outline: none; font-size: 0.9rem; }

        .pc-fields-manager-v2 { margin-top: 24px; padding: 20px; background: var(--bg-badge); border-radius: 20px; border: 1px solid var(--border-light); }
        .fields-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 0.85rem; font-weight: 800; color: var(--text-main); }
        .btn-add-mini-v2 { width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--primary); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        
        .fields-list-v2 { display: flex; flex-direction: column; gap: 8px; }
        .field-entry-v2 { display: grid; grid-template-columns: 1fr 1fr 32px; gap: 8px; align-items: center; }
        .field-entry-v2 input { background: white; border: 1px solid var(--border); border-radius: 8px; padding: 8px 12px; font-size: 0.85rem; font-weight: 700; color: var(--text-main); outline: none; }
        .btn-del-mini-v2 { width: 32px; height: 32px; border-radius: 8px; border: none; background: #fff1f2; color: var(--error); cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .pc-preview-sidebar-v2 { position: sticky; top: 20px; }
        .preview-header-v2 { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: white; border-radius: 16px 16px 0 0; border: 1px solid var(--border-light); border-bottom: none; font-size: 0.85rem; font-weight: 800; }
        .preview-controls-v2 { display: flex; gap: 4px; background: var(--bg-badge); padding: 4px; border-radius: 10px; }
        .preview-controls-v2 button { border: none; background: transparent; padding: 6px; border-radius: 6px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; }
        .preview-controls-v2 button.active { background: white; color: var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .divider-v2 { width: 1px; background: var(--border-light); margin: 0 4px; }

        .preview-content-v2 { background: var(--bg-badge); padding: 16px; border: 1px solid var(--border-light); border-radius: 0 0 16px 16px; min-height: 400px; }
        
        .variable-hints-v2 { margin-top: 24px; padding: 16px; background: white; border-radius: 16px; border: 1px solid var(--border-light); }
        .hint-header-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 900; color: var(--text-main); margin-bottom: 12px; }
        .tags-grid-v2 { display: flex; flex-wrap: wrap; gap: 6px; }
        .tags-grid-v2 code { font-size: 0.65rem; background: var(--bg-badge); color: var(--primary); padding: 4px 8px; border-radius: 6px; font-weight: 700; border: 1px solid var(--primary-muted); }

        .pc-input-modern { width: 100%; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 14px; font-weight: 700; outline: none; color: var(--text-main); font-size: 0.9rem; transition: 0.2s; }
        .pc-input-modern:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

        @media (max-width: 1300px) { .pc-editor-layout-v2 { grid-template-columns: 1fr; } .pc-preview-sidebar-v2 { position: static; } }
        :global(.light-theme) .pc-card-v2, :global(.light-theme) .preview-header-v2, :global(.light-theme) .variable-hints-v2 { background: #ffffff !important; box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important; }
        :global(.light-theme) .field-entry-v2 input { background: #f8fafc !important; }
      `}</style>
    </div>
  );
}

