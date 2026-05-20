import React, { useState, useRef } from 'react';
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
  Hash,
  Upload,
  X
} from 'lucide-react';
import HelpTooltip from './HelpTooltip';
import CustomSelect from './CustomSelect';
import { useT } from '../contexts/LanguageContext';

const EmbedPreviewContainer = dynamic(() => import('./EmbedPreviewContainer'), {
  ssr: false,
  loading: () => <div className="embed-preview-skeleton" />
});

export default function EmbedEditor({ embed, onChange, variables = ['user', 'guild'], showButtonEditor = false, previewButtons, renderPreviewFooter, compact = false }) {
  const { t } = useT();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const thumbInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validazione base lato client
    if (file.size > 5 * 1024 * 1024) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Il file è troppo grande (max 5MB)', type: 'error' } }));
        return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
        // Usa la stessa logica di api.js per determinare l'URL dell'API
        const isLocal = typeof window !== 'undefined' && 
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
        
        const baseUrl = isLocal ? 'http://localhost:5001/api' : '/api';
        
        const response = await fetch(`${baseUrl}/system/upload`, {
            method: 'POST',
            body: formData,
            credentials: 'include' // IMPORTANTE: per inviare i cookie di sessione
        });

        const result = await response.json();
        if (result.success) {
            updateEmbed(type, result.url);
            window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Immagine caricata con successo!', type: 'success' } }));
        } else {
            throw new Error(result.error || 'Errore durante il caricamento');
        }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Errore di connessione durante il caricamento.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateEmbed = (key, value) => {
    onChange({ ...embed, [key]: value });
  };

  const addField = () => {
    const fields = [...(embed?.fields || [])];
    fields.push({ name: t('embeds.editor.field_name_placeholder') || 'Nuovo Campo', value: t('embeds.editor.field_value') || 'Valore...', inline: false });
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
    <div className={`pc-embed-editor-v2 fade-in ${compact ? 'compact' : ''}`}>
      {compact && (
        <div className="compact-editor-toolbar">
          <button className="preview-drawer-trigger" onClick={() => setPreviewOpen(true)}>
            <Eye size={16} />
            <span>Preview</span>
          </button>
        </div>
      )}

      <div className="pc-editor-layout-v2">
        <div className="pc-editor-form-v2">
          {/* Main Content Card */}
          <section className="pc-card-v2">
            <div className="card-header-v2">
                <div className="header-icon"><AlignLeft size={20} /></div>
                <h3>{t('embeds.editor.content_title')}</h3>
            </div>
            <div className="card-body-v2">
                <div className="pc-input-group-v2">
                    <label>{t('embeds.editor.title_label')}</label>
                    <div className="pc-input-wrapper-v2">
                        <Type size={16} className="input-icon" />
                        <input value={embed?.title || ''} onChange={e => updateEmbed('title', e.target.value)} placeholder={t('embeds.editor.title_placeholder')} />
                    </div>
                </div>
                <div className="pc-input-group-v2" style={{ marginTop: '20px' }}>
                    <label>{t('embeds.editor.desc_label')}</label>
                    <textarea 
                        className="pc-textarea-v2" 
                        rows="5" 
                        value={embed?.description || ''} 
                        onChange={e => updateEmbed('description', e.target.value)} 
                        placeholder={t('embeds.editor.desc_placeholder')}
                    />
                </div>
            </div>
          </section>

          {/* Style & Fields Card */}
          <section className="pc-card-v2">
                <div className="card-header-v2">
                    <div className="header-icon"><Palette size={20} /></div>
                    <h3>{t('embeds.editor.style_title')}</h3>
                </div>
                <div className="card-body-v2">
                    <div className="pc-row-v2">
                        <div className="pc-input-group-v2">
                            <label>{t('embeds.editor.side_color')}</label>
                            <div className="pc-color-picker-wrapper-v2">
                                <input type="color" value={embed?.color?.startsWith('#') ? embed.color : '#6366f1'} onChange={e => updateEmbed('color', e.target.value)} />
                                <input className="hex-input-v2" value={embed?.color || ''} onChange={e => updateEmbed('color', e.target.value)} placeholder="#HEX" />
                            </div>
                        </div>
                        <div className="pc-input-group-v2">
                            <label>{t('embeds.editor.footer_label')}</label>
                            <div className="pc-input-wrapper-v2">
                                <Hash size={16} className="input-icon" />
                                <input value={embed?.footer || ''} onChange={e => updateEmbed('footer', e.target.value)} placeholder={t('embeds.editor.footer_placeholder')} />
                            </div>
                        </div>
                    </div>

                <div className="pc-fields-manager-v2">
                    <div className="fields-header-v2">
                        <div className="align-center"><Code2 size={18} /> <span>{t('embeds.editor.fields_title')}</span></div>
                        <button className="btn-add-mini-v2" onClick={addField}><Plus size={16} /></button>
                    </div>
                    <div className="fields-list-v2">
                        {embed?.fields?.map((f, i) => (
                            <div key={i} className="field-entry-v2">
                                <input placeholder={t('embeds.editor.field_name_placeholder') || 'Nome'} value={f.name} onChange={e => updateFieldEntry(i, 'name', e.target.value)} />
                                <textarea placeholder={t('embeds.editor.field_value') || 'Valore'} value={f.value} onChange={e => updateFieldEntry(i, 'value', e.target.value)} rows={2} />
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
                <h3>{t('embeds.editor.media_title')}</h3>
            </div>
            <div className="card-body-v2">
                <div className="pc-row-v2">
                    <div className="pc-input-group-v2">
                        <label>{t('embeds.editor.thumbnail_label')}</label>
                        <div className="pc-input-with-button-v2">
                            <input className="pc-input-modern" value={embed?.thumbnail || ''} onChange={e => updateEmbed('thumbnail', e.target.value)} placeholder="https://..." />
                            <button className="pc-btn-upload-v2" onClick={() => thumbInputRef.current.click()} disabled={isUploading} title="Carica Immagine">
                                <Upload size={16} />
                            </button>
                            <input type="file" ref={thumbInputRef} style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'thumbnail')} accept="image/*" />
                        </div>
                    </div>
                    <div className="pc-input-group-v2">
                        <label>{t('embeds.editor.image_label')}</label>
                        <div className="pc-input-with-button-v2">
                            <input className="pc-input-modern" value={embed?.image || ''} onChange={e => updateEmbed('image', e.target.value)} placeholder="https://..." />
                            <button className="pc-btn-upload-v2" onClick={() => imageInputRef.current.click()} disabled={isUploading} title="Carica Immagine">
                                <Upload size={16} />
                            </button>
                            <input type="file" ref={imageInputRef} style={{ display: 'none' }} onChange={e => handleFileUpload(e, 'image')} accept="image/*" />
                        </div>
                    </div>
                </div>
                <p className="pc-hint-v2" style={{ marginTop: '16px' }}>
                    <Info size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                    {t('embeds.editor.media_hint')}
                </p>
            </div>
          </section>
        </div>

        {/* Floating Preview Section */}
        {!compact && (
        <aside className="pc-preview-sidebar-v2" style={{ position: 'sticky', top: '20px', height: 'fit-content' }}>
            <EmbedPreviewContainer data={{ ...embed, buttons: previewButtons || embed.buttons }}>
                {renderPreviewFooter && <div className="render-footer-v2" style={{ marginBottom: '16px' }}>{renderPreviewFooter}</div>}

                <div className="variable-hints-v2" style={{ margin: 0, border: 'none' }}>
                    <div className="hint-header-v2"><Info size={14} /> <span>{t('embeds.editor.tags_title')}</span></div>
                    <div className="tags-grid-v2">
                        {variables.map(v => <code key={v}>{`{${v}}`}</code>)}
                    </div>
                </div>
            </EmbedPreviewContainer>
        </aside>
        )}
      </div>

      {compact && previewOpen && (
        <div className="preview-drawer-layer" role="dialog" aria-modal="true">
          <button className="preview-drawer-backdrop" onClick={() => setPreviewOpen(false)} aria-label="Close preview" />
          <aside className="preview-drawer-panel">
            <header className="preview-drawer-header">
              <div>
                <span>Discord Preview</span>
                <p>Preview with proper message width.</p>
              </div>
              <button className="preview-drawer-close" onClick={() => setPreviewOpen(false)} aria-label="Close preview">
                <X size={18} />
              </button>
            </header>
            <div className="preview-drawer-body">
              <EmbedPreviewContainer data={{ ...embed, buttons: previewButtons || embed.buttons }} style={{ minHeight: '100%' }}>
                {renderPreviewFooter && <div className="render-footer-v2" style={{ marginBottom: '16px' }}>{renderPreviewFooter}</div>}

                <div className="variable-hints-v2" style={{ margin: 0, border: 'none' }}>
                  <div className="hint-header-v2"><Info size={14} /> <span>{t('embeds.editor.tags_title')}</span></div>
                  <div className="tags-grid-v2">
                    {variables.map(v => <code key={v}>{`{${v}}`}</code>)}
                  </div>
                </div>
              </EmbedPreviewContainer>
            </div>
          </aside>
        </div>
      )}

      <style jsx>{`
        .pc-embed-editor-v2 { width: 100%; }
        .pc-editor-layout-v2 { display: grid; grid-template-columns: 1fr 664px; gap: 24px; align-items: start; max-width: 100%; margin: 0 auto; }
        .pc-embed-editor-v2.compact .pc-editor-layout-v2 { grid-template-columns: 1fr; max-width: 100%; margin: 0; }
        .compact-editor-toolbar { display: flex; justify-content: flex-end; margin-bottom: 14px; }
        .preview-drawer-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          padding: 0 16px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--primary);
          font-weight: 800;
          cursor: pointer;
        }
        .preview-drawer-layer { position: fixed; inset: 0; z-index: 1000; display: flex; justify-content: flex-end; }
        .preview-drawer-backdrop { position: absolute; inset: 0; border: 0; background: rgba(15, 23, 42, 0.42); cursor: pointer; }
        .preview-drawer-panel {
          position: relative;
          width: min(760px, calc(100vw - 40px));
          height: 100vh;
          background: var(--bg-main);
          border-left: 1px solid var(--border);
          box-shadow: -24px 0 60px rgba(0,0,0,0.18);
          display: flex;
          flex-direction: column;
        }
        .preview-drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 18px 20px;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
        }
        .preview-drawer-header span { display: block; font-size: 1rem; font-weight: 850; color: var(--text-heading); }
        .preview-drawer-header p { margin: 4px 0 0 0; font-size: 0.78rem; font-weight: 650; color: var(--text-muted); }
        .preview-drawer-close {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-badge);
          color: var(--text-main);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        .preview-drawer-body { padding: 18px; overflow: auto; flex: 1; }
        
        .pc-editor-form-v2 { display: flex; flex-direction: column; gap: 20px; min-width: 0; }

        .pc-card-v2 { background: var(--bg-card); border: 1px solid var(--border-light); border-radius: 16px; padding: 22px; box-shadow: none; }
        .card-header-v2 { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .header-icon { width: 36px; height: 36px; background: var(--bg-badge); color: var(--primary); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .card-header-v2 h3 { margin: 0; font-size: 1.05rem; font-weight: 800; }

        .pc-input-group-v2 { display: flex; flex-direction: column; gap: 8px; }
        .pc-input-group-v2 label { font-size: 0.65rem; font-weight: 900; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; padding-left: 4px; }
        
        .pc-input-wrapper-v2 { display: flex; align-items: center; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; overflow: hidden; transition: 0.2s; }
        .pc-input-wrapper-v2:focus-within { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .pc-input-wrapper-v2 .input-icon { margin-left: 14px; color: var(--text-muted); opacity: 0.6; }
        .pc-input-wrapper-v2 input { width: 100%; border: none; background: transparent; padding: 12px 14px; font-weight: 700; outline: none; color: var(--text-main); font-size: 0.95rem; }

        .pc-textarea-v2 { width: 100%; min-height: 170px; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 14px; font-weight: 600; color: var(--text-main); outline: none; transition: 0.2s; resize: vertical; line-height: 1.55; }
        .pc-textarea-v2:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

        .pc-row-v2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
        
        .pc-color-picker-wrapper-v2 { display: flex; gap: 10px; }
        .pc-color-picker-wrapper-v2 input[type="color"] { width: 44px; height: 44px; border-radius: 10px; border: 1px solid var(--border); background: var(--bg-badge); cursor: pointer; padding: 3px; }
        .hex-input-v2 { flex: 1; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 0 14px; font-weight: 700; color: var(--text-main); outline: none; font-size: 0.9rem; }

        .pc-fields-manager-v2 { margin-top: 20px; padding: 16px; background: var(--bg-badge); border-radius: 14px; border: 1px solid var(--border-light); }
        .fields-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-size: 0.85rem; font-weight: 800; color: var(--text-main); }
        .btn-add-mini-v2 { width: 32px; height: 32px; border-radius: 8px; border: none; background: var(--primary); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        
        .fields-list-v2 { display: flex; flex-direction: column; gap: 8px; }
        .field-entry-v2 { display: grid; grid-template-columns: minmax(150px, 0.75fr) minmax(220px, 1fr) 32px; gap: 8px; align-items: stretch; }
        .field-entry-v2 input,
        .field-entry-v2 textarea { background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; padding: 9px 12px; font-size: 0.85rem; font-weight: 700; color: var(--text-main); outline: none; font-family: inherit; line-height: 1.35; }
        .field-entry-v2 textarea { min-height: 40px; resize: vertical; }
        .btn-del-mini-v2 { width: 32px; height: 32px; border-radius: 8px; border: none; background: rgba(239, 68, 68, 0.1); color: var(--error); cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .pc-preview-sidebar-v2 { position: sticky; top: 20px; }
        .preview-header-v2 { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: var(--bg-card); border-radius: 16px 16px 0 0; border: 1px solid var(--border); border-bottom: none; font-size: 0.85rem; font-weight: 800; }
        .preview-controls-v2 { display: flex; gap: 4px; background: var(--bg-badge); padding: 4px; border-radius: 10px; }
        .preview-controls-v2 button { border: none; background: transparent; padding: 6px; border-radius: 6px; color: var(--text-muted); cursor: pointer; display: flex; align-items: center; }
        .preview-controls-v2 button.active { background: var(--bg-badge); color: var(--primary); box-shadow: var(--shadow-premium); border-color: var(--primary-muted); }
        .divider-v2 { width: 1px; background: var(--border-light); margin: 0 4px; }

        .preview-content-v2 { background: var(--bg-badge); padding: 16px; border: 1px solid var(--border-light); border-radius: 0 0 16px 16px; min-height: 400px; }
        
        .variable-hints-v2 { margin-top: 24px; padding: 16px; background: var(--bg-card); border-radius: 16px; border: 1px solid var(--border-light); }
        .hint-header-v2 { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 900; color: var(--text-main); margin-bottom: 12px; }
        .tags-grid-v2 { display: flex; flex-wrap: wrap; gap: 6px; }
        .tags-grid-v2 code { font-size: 0.65rem; background: var(--bg-badge); color: var(--primary); padding: 4px 8px; border-radius: 6px; font-weight: 700; border: 1px solid var(--primary-muted); }

        .pc-input-modern { width: 100%; background: var(--bg-input); border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 14px; font-weight: 700; outline: none; color: var(--text-main); font-size: 0.9rem; transition: 0.2s; }
        .pc-input-modern:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }

        .pc-input-with-button-v2 { display: flex; gap: 8px; align-items: center; }
        .pc-btn-upload-v2 { 
            width: 44px; 
            height: 44px; 
            background: var(--bg-badge); 
            border: 1.5px solid var(--border); 
            border-radius: 12px; 
            color: var(--primary); 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            cursor: pointer; 
            transition: 0.2s; 
            flex-shrink: 0;
        }
        .pc-btn-upload-v2:hover:not(:disabled) { 
            background: var(--primary); 
            color: white; 
            border-color: var(--primary); 
            transform: translateY(-2px);
            box-shadow: var(--shadow-premium);
        }
        .pc-btn-upload-v2:disabled { opacity: 0.5; cursor: not-allowed; }

        @media (max-width: 1200px) { .pc-editor-layout-v2 { grid-template-columns: 1fr; } .pc-preview-sidebar-v2 { position: static; } }
        @media (max-width: 720px) {
          .pc-card-v2 { padding: 18px; }
          .field-entry-v2 { grid-template-columns: 1fr 32px; }
          .field-entry-v2 textarea { grid-column: 1 / -1; }
          .pc-textarea-v2 { min-height: 150px; }
          .preview-drawer-panel { width: 100vw; }
          .preview-drawer-body { padding: 12px; }
        }
        
        /* White Mode Specific Fixes */
        :global(.light-theme) .pc-card-v2, 
        :global(.light-theme) .preview-header-v2, 
        :global(.light-theme) .variable-hints-v2 { 
            background: #ffffff !important; 
            border-color: #e2e8f0 !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important; 
        }
        :global(.light-theme) .field-entry-v2 input { background: #f8fafc !important; }
        :global(.light-theme) .variable-hints-v2 .tags-grid-v2 code {
            background: #f1f5f9 !important;
            color: var(--primary) !important;
            border-color: #e2e8f0 !important;
        }
        :global(.light-theme) .variable-hints-v2 .hint-header-v2 {
            color: #1e293b !important;
        }
      `}</style>
    </div>
  );
}

