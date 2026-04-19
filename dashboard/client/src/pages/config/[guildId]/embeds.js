import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
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
  ChevronDown
} from 'lucide-react';

export default function EmbedBuilder() {
  const router = useRouter();
  const { guildId } = router.query;

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

  useEffect(() => {
    if (guildId) {
      loadAllData();
    }
  }, [guildId]);

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

      showToast('Template salvato correttamente!');
    } catch (error) {
      showToast('Errore durante il salvataggio', 'error');
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
      showToast(res.message || 'Operazione completata!');
    } catch (error) {
      // Toast handles error
    } finally {
      setSending(false);
    }
  };

  if (loading) return (
    <Layout guildId={guildId}>
      <Skeleton height="100px" style={{ marginBottom: '40px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px' }}>
         <Skeleton height="600px" borderRadius="24px" />
         <Skeleton height="600px" borderRadius="24px" />
      </div>
    </Layout>
  );

  return (
    <Layout guildId={guildId}>
      <div className="animate">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <div className="align-center" style={{ color: 'var(--primary)', marginBottom: '8px' }}>
              <Palette size={18} fill="currentColor" />
              <span className="text-label" style={{ marginBottom: 0 }}>Laboratorio Creativo</span>
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: '900', letterSpacing: '-1.5px' }}>Embed Studio</h1>
            <p className="text-description" style={{ fontSize: '1.1rem' }}>Crea messaggi professionali da inviare manualmente nei tuoi canali.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '250px' }}>
                <DiscordSelector
                    type="channel"
                    options={channels}
                    value={selectedChannel}
                    onChange={setSelectedChannel}
                    placeholder="Canale di invio..."
                />
            </div>
            <button 
                onClick={handleSend} 
                className="btn-primary" 
                disabled={sending || !selectedChannel}
                style={{ height: '45px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={18} className={sending ? 'spin' : ''} /> {sending ? 'Invio...' : 'Invia Messaggio'}
            </button>
            <div style={{ width: '1px', height: '30px', background: 'var(--border)', margin: '0 8px' }}></div>
            <button onClick={handleSave} className="btn-outline" style={{ height: '45px' }} disabled={saving}>
              <Save size={18} className={saving ? 'spin' : ''} /> {saving ? 'Salvataggio...' : 'Salva Template'}
            </button>
          </div>
        </header>

        <div className="studio-layout">
          <div className="studio-main">
            {/* Template Selector */}
            <section className="card glass-heavy" style={{ marginBottom: '30px', borderLeft: '4px solid var(--primary)' }}>
              <div className="align-center" style={{ marginBottom: '20px' }}>
                <FolderOpen size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Archivio Template</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-group">
                    <label className="text-label">Scegli o Crea</label>
                    <select className="select" value={selectedTemplateId} onChange={handleTemplateChange}>
                        <option value="new">+ Crea Nuovo Template</option>
                        {customTemplates.map(t => (
                            <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <div className="input-group">
                    <label className="text-label">Nome Template</label>
                    <input className="input" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Es. Annuncio Manutenzione" />
                </div>
              </div>
            </section>

            {/* Reusable Embed Editor */}
            <EmbedEditor 
                embed={currentEmbed} 
                onChange={setCurrentEmbed} 
                variables={['user', 'guild', 'time', 'date']} 
            />

          </div>

          <div className="studio-sidebar">
            <section className="card glass-heavy" style={{ borderTop: '4px solid var(--warning)' }}>
              <div className="align-center" style={{ marginBottom: '24px' }}>
                <Clock size={22} color="var(--warning)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Programmazione</h3>
              </div>

              <div className="input-group" style={{ marginBottom: '20px' }}>
                <label className="text-label">Tempistica Invio</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button 
                    className={`btn-schedule ${scheduleType === 'NOW' ? 'active' : ''}`}
                    onClick={() => setScheduleType('NOW')}
                  >
                    <Zap size={14} /> Invia Ora
                  </button>
                  <button 
                    className={`btn-schedule ${scheduleType === 'DELAY' ? 'active' : ''}`}
                    onClick={() => setScheduleType('DELAY')}
                  >
                    <Clock size={14} /> Dopo un ritardo
                  </button>
                  <button 
                    className={`btn-schedule ${scheduleType === 'TIME' ? 'active' : ''}`}
                    onClick={() => setScheduleType('TIME')}
                  >
                    <Calendar size={14} /> Orario Specifico
                  </button>
                </div>
              </div>

              {scheduleType === 'DELAY' && (
                <div className="input-group animate-in">
                  <label className="text-label">Minuti di attesa</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="number" 
                      className="input" 
                      min="1" 
                      max="1440" 
                      value={delayMinutes} 
                      onChange={e => setDelayMinutes(e.target.value)} 
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>minuti</span>
                  </div>
                </div>
              )}

              {scheduleType === 'TIME' && (
                <div className="input-group animate-in">
                  <label className="text-label">Data e Ora (UTC)</label>
                  <input 
                    type="datetime-local" 
                    className="input" 
                    value={specificTime} 
                    onChange={e => setSpecificTime(e.target.value)} 
                  />
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '8px' }}>
                    Seleziona l'orario desiderato per l'invio del messaggio.
                  </p>
                </div>
              )}

              <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--warning)', fontWeight: '600', lineHeight: '1.4' }}>
                  {scheduleType === 'NOW' ? 
                    'Il messaggio verrà inviato immediatamente al canale selezionato.' : 
                    'Il bot invierà questo embed automaticamente all\'orario stabilito.'}
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .studio-layout {
            display: grid;
            grid-template-columns: 1fr 320px;
            gap: 30px;
        }
        .btn-schedule {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            border-radius: 12px;
            background: rgba(255,255,255,0.02);
            border: 1px solid var(--border);
            color: var(--text-muted);
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: var(--transition-fast);
            text-align: left;
        }
        .btn-schedule:hover {
            background: rgba(255,255,255,0.05);
            color: white;
        }
        .btn-schedule.active {
            background: rgba(245, 158, 11, 0.1);
            border-color: var(--warning);
            color: var(--warning);
        }
        .shadow-glow { box-shadow: 0 0 30px rgba(var(--primary-rgb), 0.15); }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
}
