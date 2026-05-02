import React, { useState } from 'react';
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
  MousePointer2
} from 'lucide-react';
import EmbedPreview from './EmbedPreview';
import HelpTooltip from './HelpTooltip';
import CustomSelect from './CustomSelect';

/**
 * Reusable Embed Editor Component
 * @param {Object} embed - The embed object to edit
 * @param {Function} onChange - Callback function when embed data changes
 * @param {Array} variables - List of available variables for this context
 * @param {boolean} showButtonEditor - Whether to show the button customization section
 * @param {Array} previewButtons - Optional buttons to show in the preview
 */
export default function EmbedEditor({ embed, onChange, variables = ['user', 'guild'], showButtonEditor = false, previewButtons, renderPreviewFooter }) {
  const [isPreviewMobile, setIsPreviewMobile] = useState(false);

  const updateEmbed = (key, value) => {
    onChange({ ...embed, [key]: value });
  };

  const addField = () => {
    const fields = [...(embed?.fields || [])];
    fields.push({ name: 'Titolo Campo', value: 'Valore', inline: false });
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
    <div className="embed-editor-container">
      <div className="editor-grid">
        <div className="editor-form">
          {/* Content Section */}
          <section className="card glass" style={{ marginBottom: '24px' }}>
            <div className="align-center" style={{ marginBottom: '20px' }}>
              <Type size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>Contenuto Messaggio</h3>
            </div>
            
            <div className="input-group">
              <label className="text-label">Titolo</label>
              <input
                className="input"
                value={embed?.title || ''}
                onChange={(e) => updateEmbed('title', e.target.value)}
                placeholder="Inserisci titolo..."
              />
            </div>

            <div className="input-group" style={{ marginTop: '20px' }}>
              <label className="text-label">Descrizione</label>
              <textarea
                className="input"
                rows="6"
                value={embed?.description || ''}
                onChange={(e) => updateEmbed('description', e.target.value)}
                placeholder="Scrivi il tuo messaggio qui..."
                style={{ resize: 'none' }}
              />
            </div>
          </section>

          {/* Style & Fields Section */}
          <section className="card glass" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                <div className="input-group">
                  <label className="text-label">Colore Laterale</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                        type="color" 
                        value={
                          embed?.color?.startsWith('#') 
                            ? embed.color 
                            : (embed?.color === 'primary' ? '#818cf8' : (embed?.color === 'success' ? '#10b981' : (embed?.color === 'error' ? '#f43f5e' : '#5865F2')))
                        } 
                        onChange={(e) => updateEmbed('color', e.target.value)} 
                        style={{ width: '45px', height: '45px', padding: '4px', background: 'var(--bg-elevated-hover)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }} 
                    />
                    <input 
                        className="input" 
                        value={embed?.color || ''} 
                        onChange={(e) => updateEmbed('color', e.target.value)} 
                        placeholder="#HEX o primary" 
                    />
                  </div>
                </div>
                <div className="input-group">
                  <label className="text-label">Testo Footer</label>
                  <input 
                    className="input" 
                    value={embed?.footer || ''} 
                    onChange={(e) => updateEmbed('footer', e.target.value)} 
                    placeholder="Piede di pagina..." 
                  />
                </div>
              </div>

              {/* Dynamic Fields */}
              <div style={{ padding: '20px', background: 'var(--bg-elevated)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="align-center">
                    <Code2 size={18} color="var(--primary)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '800' }}>Campi Dati (Fields)</h4>
                  </div>
                  <button onClick={addField} className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}><Plus size={16} /> Aggiungi</button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {embed?.fields?.map((f, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 40px', gap: '10px', alignItems: 'center' }}>
                      <input className="input-small" value={f.name || ''} onChange={(e) => updateFieldEntry(i, 'name', e.target.value)} placeholder="Titolo" />
                      <input className="input-small" value={f.value || ''} onChange={(e) => updateFieldEntry(i, 'value', e.target.value)} placeholder="Valore" />
                      <button onClick={() => removeField(i)} className="btn-remove-premium"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  {(!embed?.fields || embed.fields.length === 0) && (
                    <p style={{ textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem', padding: '10px' }}>Nessun campo configurato.</p>
                  )}
                </div>
              </div>
          </section>

          {/* Media Section */}
          <section className="card glass">
            <div className="align-center" style={{ marginBottom: '20px' }}>
              <ImageIcon size={20} color="var(--primary)" />
              <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>Asset Multimediali</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
               <div className="input-group">
                 <label className="text-label">Miniatura (Thumbnail)</label>
                 <input className="input" value={embed?.thumbnail || ''} onChange={(e) => updateEmbed('thumbnail', e.target.value)} placeholder="https://..." />
               </div>
               <div className="input-group">
                 <label className="text-label">Immagine Principale</label>
                 <input className="input" value={embed?.image || ''} onChange={(e) => updateEmbed('image', e.target.value)} placeholder="https://..." />
               </div>
            </div>
          </section>

          {/* Button Customization Section */}
          {showButtonEditor && (
            <section className="card glass" style={{ marginTop: '24px' }}>
              <div className="align-center" style={{ marginBottom: '20px' }}>
                <MousePointer2 size={20} color="var(--primary)" />
                <h4 style={{ fontSize: '1rem', fontWeight: '800' }}>Personalizzazione Bottone</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                  <label className="text-label">Testo Bottone</label>
                  <input 
                    className="input" 
                    value={embed?.button?.label || ''} 
                    onChange={(e) => onChange({ ...embed, button: { ...(embed.button || {}), label: e.target.value } })} 
                    placeholder="es: Inizia Whitelist" 
                  />
                </div>
                <div className="input-group">
                  <label className="text-label">Emoji Bottone</label>
                  <input 
                    className="input" 
                    value={embed?.button?.emoji || ''} 
                    onChange={(e) => onChange({ ...embed, button: { ...(embed.button || {}), emoji: e.target.value } })} 
                    placeholder="es: 📝" 
                  />
                </div>
              </div>
              <div className="input-group" style={{ marginTop: '20px' }}>
                <label className="text-label">Stile (Colore)</label>
                <div className="stylized-select-wrapper">
                  <CustomSelect 
                    options={[
                      { value: 'PRIMARY', label: 'Blu (Primary)' },
                      { value: 'SUCCESS', label: 'Verde (Success)' },
                      { value: 'DANGER', label: 'Rosso (Danger)' },
                      { value: 'SECONDARY', label: 'Grigio (Secondary)' },
                      { value: 'LINK', label: 'Link (Esterno) 🔗' }
                    ]} 
                    value={embed?.button?.style || 'PRIMARY'} 
                    onChange={val => onChange({ ...embed, button: { ...(embed.button || {}), style: val } })} 
                  />
                </div>
              </div>
              {embed?.button?.style === 'LINK' && (
                <div className="input-group animate fade-in" style={{ marginTop: '20px' }}>
                  <label className="text-label">URL del Link</label>
                  <input 
                    className="input" 
                    value={embed?.button?.url || ''} 
                    onChange={(e) => onChange({ ...embed, button: { ...(embed.button || {}), url: e.target.value } })} 
                    placeholder="https://google.com" 
                  />
                  <p className="field-help">I bottoni di tipo Link non possono eseguire comandi, servono solo a reindirizzare l'utente.</p>
                </div>
              )}
            </section>
          )}
        </div>

        {/* Live Preview Sidebar */}
        <aside className="preview-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
             <h4 className="align-center" style={{ fontSize: '1.1rem', fontWeight: '800' }}><Eye size={20} color="var(--primary)" /> Anteprima Live</h4>
             <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated-hover)', padding: '4px', borderRadius: '10px' }}>
                <button onClick={() => setIsPreviewMobile(false)} className={`view-btn ${!isPreviewMobile ? 'active' : ''}`}><Monitor size={14} /></button>
                <button onClick={() => setIsPreviewMobile(true)} className={`view-btn ${isPreviewMobile ? 'active' : ''}`}><Smartphone size={14} /></button>
             </div>
          </div>
          
          <div className="preview-sticky">
            <EmbedPreview data={{ ...embed, buttons: previewButtons || embed.buttons }} isMobile={isPreviewMobile} />
            
            {renderPreviewFooter && (
                <div style={{ marginTop: '16px', width: '100%' }}>
                    {renderPreviewFooter}
                </div>
            )}
            
            <div className="card" style={{ marginTop: '24px', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', gap: '12px' }}>
                  <Info size={18} color="var(--primary)" />
                  <div>
                    <p style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>TAG DISPONIBILI</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                       {variables.map(v => <code key={v} className="variable-tag">{`{${v}}`}</code>)}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 450px;
          gap: 30px;
        }
        .preview-sticky {
          position: sticky;
          top: 20px;
        }
        .input-small {
          background: var(--bg-input);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 12px;
          color: var(--text-main);
          font-size: 0.85rem;
          width: 100%;
        }
        .btn-icon-delete-small {
          background: rgba(239, 68, 68, 0.1);
          border: none;
          color: var(--error);
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-icon-delete-small:hover {
          background: var(--error);
          color: var(--text-on-primary);
        }
        .view-btn {
          background: none;
          border: none;
          color: var(--text-dim);
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: 0.2s;
        }
        .view-btn.active {
          background: var(--primary);
          color: var(--text-on-primary);
        }
        .variable-tag {
          font-family: monospace;
          font-size: 0.7rem;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          padding: 2px 6px;
          border-radius: 4px;
        }
        @media (max-width: 1100px) {
          .editor-grid { grid-template-columns: 1fr; }
          .preview-sticky { position: static; }
        }
      `}</style>
    </div>
  );
}
