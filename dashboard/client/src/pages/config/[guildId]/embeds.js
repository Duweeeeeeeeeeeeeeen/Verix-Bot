import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import EmbedPreview from '../../../components/EmbedPreview';
import EmbedEditor from '../../../components/EmbedEditor';
import Skeleton from '../../../components/Skeleton';
import HelpTooltip from '../../../components/HelpTooltip';
import DiscordSelector from '../../../components/DiscordSelector';
import api from '../../../utils/api';
import {
  Save,
  Palette,
  Eye,
  Send,
  Plus,
  Trash2,
  FolderOpen,
  Zap,
  Info,
  Layers,
  Sparkles,
  Smartphone,
  Monitor,
  Clock,
  Calendar,
  ChevronDown,
  Box,
  MessageSquare
} from 'lucide-react';
import CustomSelect from '../../../components/CustomSelect';

export default function EmbedBuilder() {
  const router = useRouter();
  const { guildId } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Data State
  const [customTemplates, setCustomTemplates] = useState([]);
  const [channels, setChannels] = useState([]);

  // Interaction State
  const [selectedTemplateId, setSelectedTemplateId] = useState('new');
  const [currentEmbed, setCurrentEmbed] = useState({ title: 'Nuovo Embed', description: 'Testo dell\'embed...', color: '#10b981', fields: [] });
  const [customName, setCustomName] = useState('Nuovo Template');
  const [selectedChannel, setSelectedChannel] = useState('');

  // UI State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  // Scheduling State
  const [scheduleType, setScheduleType] = useState('NOW'); // 'NOW' | 'DELAY' | 'TIME'
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [specificTime, setSpecificTime] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const responses = await Promise.all([
        api.request(`/embeds/${guildId}/templates`),
        api.request(`/embeds/${guildId}/channels`)
      ]);

      const [templatesData, channelsData] = responses;

      setCustomTemplates(Array.isArray(templatesData) ? templatesData : []);
      setChannels(Array.isArray(channelsData) ? channelsData : []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (guildId && mounted) {
      loadAllData();
    }
  }, [guildId, mounted]);

  useEffect(() => {
    if (currentEmbed) {
      window.dispatchEvent(new CustomEvent('update-guide-context', { detail: currentEmbed }));
    }
  }, [currentEmbed]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const handleTemplateChange = (e) => {
    const val = e.target.value;
    setSelectedTemplateId(val);

    if (val === 'new') {
      setCurrentEmbed({ title: 'Nuovo Embed', description: 'Testo dell\'embed...', color: '#10b981', fields: [] });
      setCustomName('Nuovo Template');
    } else {
      const template = customTemplates.find(t => t._id === val);
      if (template) {
        setCurrentEmbed(template.data);
        setCustomName(template.name);
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isNew = selectedTemplateId === 'new';
      const saved = await api.request(`/embeds/${guildId}/templates`, {
        method: 'POST',
        body: JSON.stringify({
          id: isNew ? undefined : selectedTemplateId,
          name: customName,
          data: currentEmbed
        })
      });

      if (isNew) {
        setCustomTemplates([...customTemplates, saved]);
        setSelectedTemplateId(saved._id);
      } else {
        setCustomTemplates(customTemplates.map(t => t._id === saved._id ? saved : t));
      }

      showToast('Template salvato!');
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!selectedChannel) return showToast('Seleziona un canale!', 'error');
    setSending(true);
    try {
      const payload = {
        channelId: selectedChannel,
        embed: currentEmbed
      };

      if (scheduleType !== 'NOW') {
        payload.schedule = {
          type: scheduleType,
          delayMinutes: scheduleType === 'DELAY' ? parseInt(delayMinutes) : undefined,
          specificTime: scheduleType === 'TIME' ? specificTime : undefined
        };
      }

      const res = await api.request(`/embeds/${guildId}/send`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      showToast(res.message || 'Messaggio inviato!');
    } catch (error) {
    } finally {
      setSending(false);
    }
  };

  if (!mounted || loading) return <><Skeleton height="500px" /></>;

  return (
    <div className="config-page-layout animate">
      <div className="config-main-col">
        {/* Module Header */}
        <header className="module-header">
           <div className="header-info">
              <div className="header-icon">
                <Palette size={24} />
              </div>
              <div className="header-text">
                <h1>Embed Studio</h1>
                <p>Progetta e trasmetti messaggi avanzati nei canali del server.</p>
              </div>
           </div>
           <div className="header-buttons">
              <div style={{ width: '220px' }}>
                <DiscordSelector type="channel" options={channels} value={selectedChannel} onChange={setSelectedChannel} placeholder="Seleziona Canale..." />
              </div>
              <button onClick={handleSend} className="btn-primary" disabled={sending || !selectedChannel}>
                <Send size={16} className={sending ? 'spin' : ''} /> {sending ? 'Invio...' : 'Trasmetti'}
              </button>
           </div>
        </header>

        <div className="studio-grid-s">
            <div className="studio-left-s">
                {/* Archive Selector */}
                <section className="card section-card-s" style={{ marginBottom: '24px' }}>
                    <div className="align-center"><FolderOpen size={18} color="var(--primary)" /> <h3>Libreria Template</h3></div>
                    <div className="fields-row-s">
                        <div className="field-box" style={{ flex: 1.5 }}>
                            <label className="text-label">Scegli Sorgente</label>
                            <CustomSelect 
                                options={[
                                    { value: 'new', label: '+ Nuovo Progetto' },
                                    ...customTemplates.map(t => ({ value: t._id, label: t.name }))
                                ]} 
                                value={selectedTemplateId} 
                                onChange={val => handleTemplateChange({ target: { value: val } })} 
                            />
                        </div>
                        <div className="field-box" style={{ flex: 1 }}>
                            <label className="text-label">Nome Salvataggio</label>
                            <input className="input" value={customName} onChange={e => setCustomName(e.target.value)} />
                        </div>
                        <div className="field-box" style={{ width: '120px', justifyContent: 'flex-end', display: 'flex' }}>
                                <button onClick={handleSave} className="btn-outline" style={{ height: '42px', marginTop: 'auto' }} disabled={saving}>
                                <Save size={16} /> Salva
                                </button>
                        </div>
                    </div>
                </section>

                {/* Main Editor */}
                <div className="card editor-card-s">
                    <EmbedEditor 
                        embed={currentEmbed} 
                        onChange={setCurrentEmbed} 
                        variables={['user', 'guild', 'time', 'date']} 
                        showButtonEditor={true}
                    />
                </div>
            </div>

            <div className="studio-right-s">
                <section className="card section-card-s">
                    <div className="align-center"><Clock size={18} color="var(--primary)" /> <h3>Scheduling</h3></div>
                    <div className="schedule-stack-s">
                        {[
                            { id: 'NOW', label: 'Invia Ora', icon: Zap },
                            { id: 'DELAY', label: 'Ritarda', icon: Clock },
                            { id: 'TIME', label: 'Calendario', icon: Calendar }
                        ].map(type => (
                            <button key={type.id} onClick={() => setScheduleType(type.id)} className={`schedule-btn-s ${scheduleType === type.id ? 'active' : ''}`}>
                                <type.icon size={14} />
                                <span>{type.label}</span>
                            </button>
                        ))}
                    </div>

                    {scheduleType === 'DELAY' && (
                        <div className="field-box animate fade-in" style={{ marginTop: '16px' }}>
                            <label className="text-label">Minuti di attesa</label>
                            <input type="number" className="input" value={delayMinutes} onChange={e => setDelayMinutes(e.target.value)} />
                        </div>
                    )}
                    
                    {scheduleType === 'TIME' && (
                        <div className="field-box animate fade-in" style={{ marginTop: '16px' }}>
                            <label className="text-label">Data/Ora UTC</label>
                            <input type="datetime-local" className="input" value={specificTime} onChange={e => setSpecificTime(e.target.value)} />
                        </div>
                    )}
                </section>

                <div className="card info-box-s">
                    <Info size={18} color="var(--primary)" />
                    <p>Puoi usare variabili come <b>{'{user}'}</b> per personalizzare il messaggio.</p>
                </div>
            </div>
        </div>
      </div>

      <style jsx>{`
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: rgba(255,255,255,0.02); padding: 24px; border-radius: 16px; border: 1px solid var(--border); }
            .header-info { display: flex; align-items: center; gap: 16px; }
            .header-icon { width: 48px; height: 48px; background: rgba(129, 140, 248, 0.1); color: var(--primary); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
            .header-text h1 { font-size: 1.5rem; margin-bottom: 2px; }
            .header-text p { font-size: 0.85rem; color: var(--text-muted); }
            .header-buttons { display: flex; align-items: center; gap: 12px; }

            .studio-grid-s { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
            .studio-left-s { display: flex; flex-direction: column; }
            .studio-right-s { display: flex; flex-direction: column; gap: 24px; }
            
            .fields-row-s { display: flex; gap: 16px; margin-top: 16px; }
            .editor-card-s { padding: 0 !important; }

            .schedule-stack-s { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; }
            .schedule-btn-s { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); color: var(--text-muted); font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; text-align: left; }
            .schedule-btn-s:hover { background: rgba(255,255,255,0.04); color: white; }
            .schedule-btn-s.active { background: rgba(129,140,248,0.1); border-color: var(--primary); color: white; }

            .info-box-s { padding: 16px; display: flex; flex-direction: row; align-items: center; gap: 10px; font-size: 0.8rem; color: var(--text-muted); }

            .align-center { display: flex; align-items: center; gap: 10px; }
            @media (max-width: 1400px) { .studio-grid-s { grid-template-columns: 1fr; } }
            @media (max-width: 1000px) { .fields-row-s { flex-direction: column; } .header-buttons { flex-direction: column; align-items: stretch; } }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            .spin { animation: spin 1s linear infinite; }
        `}</style>
    </div>
  );
}
