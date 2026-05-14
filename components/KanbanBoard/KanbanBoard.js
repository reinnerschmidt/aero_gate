'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

function CardModal({ log, user, onClose, onStatusChange }) {
  const [hasDamage, setHasDamage] = useState(null);
  const [photoData, setPhotoData] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('details'); // 'details' | 'closing'
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = useCallback(async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      alert('Erro ao acessar câmera: ' + e.message);
      setCameraActive(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setPhotoData(canvas.toDataURL('image/jpeg', 0.7));
    stopCamera();
  };

  const handleClose = async () => {
    if (hasDamage === null) { alert('Informe se há dano!'); return; }
    if (hasDamage && !photoData) { alert('Registre a foto do dano!'); return; }
    setLoading(true);
    await onStatusChange(log.id, 'encerrado', hasDamage, photoData);
    setLoading(false);
    onClose();
  };

  const handleReopen = async () => {
    setLoading(true);
    await onStatusChange(log.id, 'pendente', false, null);
    setLoading(false);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
              {log.has_damage && <span title="Com Dano" style={{ marginRight: '0.5rem' }}>⚠️</span>}
              {log.aeronave_serial} — {log.area_name}
            </h2>
            <small style={{ opacity: 0.5 }}>ID #{log.id}</small>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
        </div>

        {step === 'details' && (
          <>
            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                ['👤 Colaborador', log.nome || '—'],
                ['🪪 Chapa', log.id_number || '—'],
                ['🏢 Vínculo', log.employee_type || '—'],
                ['👥 Acompanhante', log.acompanhante || '—'],
                ['✈️ Aeronave', log.aeronave_serial || '—'],
                ['📍 Área', log.area_name || '—'],
                ['📋 OP/OM', log.op_om || '—'],
                ['✅ Autorizador', log.autorizador || '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.8rem' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.3rem' }}>{label}</div>
                  <div style={{ fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Adornos */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.5rem' }}>ADORNOS DECLARADOS</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[['alianca_check','💍 Aliança'],['chave_check','🔑 Chave'],['relogio_check','⌚ Relógio'],['cracha_check','🪪 Crachá']].map(([k,l]) => (
                  <span key={k} style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', background: log[k]==='Sim' ? 'rgba(255,170,0,0.2)' : 'rgba(255,255,255,0.06)', color: log[k]==='Sim' ? '#ffaa33' : 'rgba(255,255,255,0.4)' }}>
                    {l}: {log[k] || 'Não'}
                  </span>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.8rem' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>ENTRADA</div>
                <div>{new Date(log.created_at || log.timestamp).toLocaleString('pt-BR')}</div>
              </div>
              {log.closed_at && (
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '0.8rem' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.5 }}>ENCERRADO</div>
                  <div>{new Date(log.closed_at).toLocaleString('pt-BR')}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>por {log.closed_by}</div>
                </div>
              )}
            </div>

            {/* Damage Photo */}
            {log.damage_photo && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.5rem' }}>⚠️ FOTO DO DANO</div>
                <img src={log.damage_photo} alt="Dano" style={{ width: '100%', borderRadius: '8px', border: '2px solid #ffcc00' }} />
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              {log.status === 'pendente' ? (
                <button onClick={() => setStep('closing')} className="btn-primary" style={{ flex: 1 }}>
                  Encerrar Acesso
                </button>
              ) : (
                <button onClick={handleReopen} disabled={loading} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>
                  {loading ? 'Aguarde...' : '↩ Reabrir'}
                </button>
              )}
            </div>
          </>
        )}

        {step === 'closing' && (
          <>
            <h3 style={{ marginBottom: '1.5rem', color: '#ffcc00' }}>⚠️ Encerrar Acesso</h3>

            <p style={{ marginBottom: '1rem', opacity: 0.8 }}>Existe algum dano a registrar?</p>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <button onClick={() => { setHasDamage(true); startCamera(); }} className={hasDamage === true ? 'btn-primary' : ''} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '2px solid', borderColor: hasDamage === true ? 'var(--accent)' : 'rgba(255,255,255,0.2)', background: hasDamage === true ? 'rgba(0,200,255,0.1)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>
                ⚠️ Sim, tem dano
              </button>
              <button onClick={() => { setHasDamage(false); stopCamera(); setPhotoData(null); }} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '2px solid', borderColor: hasDamage === false ? 'var(--success)' : 'rgba(255,255,255,0.2)', background: hasDamage === false ? 'rgba(0,200,100,0.1)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>
                ✅ Sem dano
              </button>
            </div>

            {cameraActive && (
              <div style={{ marginBottom: '1.5rem' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '8px', background: '#000' }} />
                <button onClick={capturePhoto} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>📸 Capturar Foto</button>
              </div>
            )}

            {photoData && (
              <div style={{ marginBottom: '1.5rem' }}>
                <img src={photoData} alt="Dano capturado" style={{ width: '100%', borderRadius: '8px', border: '2px solid #ffcc00' }} />
                <button onClick={() => { setPhotoData(null); startCamera(); }} style={{ width: '100%', marginTop: '0.5rem', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}>
                  🔄 Refazer foto
                </button>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setStep('details')} style={{ flex: 0.5, padding: '0.8rem', borderRadius: '8px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer' }}>
                ← Voltar
              </button>
              <button onClick={handleClose} disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                {loading ? 'Salvando...' : 'Confirmar Encerramento'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ log, onClick }) {
  const isOpen = log.status === 'pendente';
  return (
    <div onClick={() => onClick(log)} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${isOpen ? 'rgba(0,200,255,0.2)' : 'rgba(255,255,255,0.08)'}`, borderRadius: '12px', padding: '1rem', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '0.8rem', position: 'relative' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {log.has_damage && (
        <div style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', background: 'rgba(255,204,0,0.15)', border: '1px solid #ffcc00', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: '#ffcc00', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          ⚠️ Com Dano
        </div>
      )}
      <div style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.5rem' }}>
        {new Date(log.created_at || log.timestamp).toLocaleString('pt-BR')}
      </div>
      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.3rem' }}>
        ✈️ {log.aeronave_serial}
      </div>
      <div style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '0.3rem' }}>
        📍 {log.area_name}
      </div>
      <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>
        🪪 Chapa: {log.id_number || '—'}
      </div>
    </div>
  );
}

export default function KanbanBoard({ user }) {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) { setLogs([]); }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleStatusChange = async (id, status, has_damage, damage_photo) => {
    await fetch('/api/logs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, closed_by: user?.username, has_damage, damage_photo }),
    });
    await fetchLogs();
  };

  const open = logs.filter(l => l.status === 'pendente');
  const closed = logs.filter(l => l.status !== 'pendente');

  const colStyle = { flex: 1, minWidth: 0 };
  const colHeaderStyle = (color) => ({ padding: '0.8rem 1rem', borderRadius: '10px', marginBottom: '1rem', background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.3)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' });

  return (
    <section style={{ padding: '1.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0 }}>Kanban de Acessos</h3>
        <button onClick={fetchLogs} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', padding: '0.4rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
          🔄 Atualizar
        </button>
      </div>

      {loading ? (
        <p style={{ opacity: 0.5 }}>Carregando...</p>
      ) : (
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {/* Abertos */}
          <div style={colStyle}>
            <div style={colHeaderStyle('0,200,255')}>
              <span style={{ fontWeight: 700, color: '#00c8ff' }}>🔓 Abertos</span>
              <span style={{ background: 'rgba(0,200,255,0.2)', color: '#00c8ff', borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.85rem' }}>{open.length}</span>
            </div>
            {open.length === 0 && <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Nenhum acesso aberto.</p>}
            {open.map(log => <KanbanCard key={log.id} log={log} onClick={setSelectedLog} />)}
          </div>

          {/* Encerrados */}
          <div style={colStyle}>
            <div style={colHeaderStyle('100,100,100')}>
              <span style={{ fontWeight: 700, opacity: 0.7 }}>🔒 Encerrados</span>
              <span style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '0.1rem 0.6rem', fontSize: '0.85rem' }}>{closed.length}</span>
            </div>
            {closed.length === 0 && <p style={{ opacity: 0.4, fontSize: '0.85rem' }}>Nenhum acesso encerrado.</p>}
            {closed.map(log => <KanbanCard key={log.id} log={log} onClick={setSelectedLog} />)}
          </div>
        </div>
      )}

      {selectedLog && (
        <CardModal
          log={selectedLog}
          user={user}
          onClose={() => setSelectedLog(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </section>
  );
}
