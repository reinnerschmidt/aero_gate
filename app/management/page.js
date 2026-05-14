'use client';

import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import KanbanBoard from '@/components/KanbanBoard/KanbanBoard';

export default function ManagementPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('areas');
  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [newName, setNewName] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'monitor' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (!loggedUser) {
      window.location.href = '/';
      return;
    }
    const parsedUser = JSON.parse(loggedUser);
    setUser(parsedUser);
    
    // Define aba inicial baseada no papel
    if (parsedUser.role === 'monitor') setActiveTab('cards');
    
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchAreas(), fetchUsers(), fetchLogs()]);
    setLoading(false);
  };

  const fetchAreas = async () => {
    try {
      const res = await fetch('/api/areas');
      const data = await res.json();
      setAreas(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); setAreas([]); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); setUsers([]); }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs'); 
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); setLogs([]); }
  };

  const handleCreateArea = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/areas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName }),
    });
    if (res.ok) { setNewName(''); fetchAreas(); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) { setNewUser({ username: '', password: '', role: 'monitor' }); fetchUsers(); }
  };

  const handleDeleteUser = async (id) => {
    if (confirm('Excluir este usuário?')) {
      await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      fetchUsers();
    }
  };

  const handleCloseLog = async (id) => {
    // API para encerrar um log pendente
    const res = await fetch('/api/logs', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'encerrado' }),
    });
    if (res.ok) fetchLogs();
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <main className={styles.main} style={{ padding: '2rem', display: 'block', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Painel de Gestão</h1>
          <p style={{ opacity: 0.6 }}>Bem-vindo, {user.username} ({user.role})</p>
        </div>
        <button onClick={handleLogout} className={styles.btnSecondary} style={{ flex: 'none' }}>Sair</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        {user.role === 'admin' && (
          <>
            <button onClick={() => setActiveTab('areas')} style={{ background: 'none', border: 'none', color: activeTab === 'areas' ? 'var(--primary)' : 'white', cursor: 'pointer', fontWeight: activeTab === 'areas' ? 'bold' : 'normal' }}>Áreas</button>
            <button onClick={() => setActiveTab('users')} style={{ background: 'none', border: 'none', color: activeTab === 'users' ? 'var(--primary)' : 'white', cursor: 'pointer', fontWeight: activeTab === 'users' ? 'bold' : 'normal' }}>Usuários</button>
          </>
        )}
        <button onClick={() => setActiveTab('logs')} style={{ background: 'none', border: 'none', color: activeTab === 'logs' ? 'var(--primary)' : 'white', cursor: 'pointer', fontWeight: activeTab === 'logs' ? 'bold' : 'normal' }}>Logs / Entradas</button>
        <button onClick={() => setActiveTab('cards')} style={{ background: 'none', border: 'none', color: activeTab === 'cards' ? 'var(--primary)' : 'white', cursor: 'pointer', fontWeight: activeTab === 'cards' ? 'bold' : 'normal' }}>Cards</button>
      </div>

      {activeTab === 'areas' && user.role === 'admin' && (
        <section className="glass animate-fade" style={{ padding: '2rem' }}>
          <h3>Gerenciar Áreas</h3>
          <form onSubmit={handleCreateArea} style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
            <input type="text" className={styles.inputField} placeholder="Nova área" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <button type="submit" className="btn-primary">Adicionar</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {areas.map(area => (
              <li key={`${area.origin}-${area.id}`} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{area.name} <small style={{ opacity: 0.5 }}>({area.origin})</small></span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'users' && user.role === 'admin' && (
        <section className="glass animate-fade" style={{ padding: '2rem' }}>
          <h3>Gerenciar Usuários (Admin/Monitor)</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', margin: '1.5rem 0' }}>
            <input type="text" className={styles.inputField} style={{ flex: 1 }} placeholder="Username" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} />
            <input type="password" className={styles.inputField} style={{ flex: 1 }} placeholder="Senha" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
            <select className={styles.inputField} style={{ flex: 0.5 }} value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="monitor">Monitor</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-primary">Criar</button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map(u => (
              <li key={u.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{u.username} <strong>({u.role})</strong></span>
                {u.id !== user.id && <button onClick={() => handleDeleteUser(u.id)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>Excluir</button>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'logs' && (
        <section className="glass animate-fade" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Registros de Acesso</h3>
            <button onClick={fetchLogs} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              🔄 Atualizar
            </button>
          </div>
          {logs.length === 0 ? (
            <p style={{ opacity: 0.5, marginTop: '1rem' }}>Nenhum registro encontrado.</p>
          ) : (
          <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}>
                  <th style={{ padding: '0.8rem' }}>Data/Hora</th>
                  <th style={{ padding: '0.8rem' }}>Colaborador</th>
                  <th style={{ padding: '0.8rem' }}>Vínculo</th>
                  <th style={{ padding: '0.8rem' }}>Acompanhante</th>
                  <th style={{ padding: '0.8rem' }}>Avião / Área</th>
                  <th style={{ padding: '0.8rem' }}>OP / OM</th>
                  <th style={{ padding: '0.8rem' }}>Autorizador</th>
                  <th style={{ padding: '0.8rem' }}>Adornos</th>
                  <th style={{ padding: '0.8rem' }}>Status</th>
                  <th style={{ padding: '0.8rem' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.8rem', whiteSpace: 'nowrap', opacity: 0.7, fontSize: '0.75rem' }}>
                      {new Date(log.created_at || log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <strong>{log.nome || '-'}</strong>
                      <br/><small style={{ opacity: 0.6 }}>Chapa: {log.id_number || '-'}</small>
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{ 
                        background: log.employee_type === 'Embraer' ? 'rgba(0,100,255,0.2)' : 'rgba(255,150,0,0.2)',
                        color: log.employee_type === 'Embraer' ? '#60aaff' : '#ffaa33',
                        padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem'
                      }}>
                        {log.employee_type || '-'}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem', opacity: 0.8 }}>{log.acompanhante || '—'}</td>
                    <td style={{ padding: '0.8rem' }}>
                      <strong>{log.aeronave_serial || '-'}</strong>
                      <br/><small style={{ opacity: 0.6 }}>{log.area_name || '-'}</small>
                    </td>
                    <td style={{ padding: '0.8rem', fontFamily: 'monospace' }}>{log.op_om || '—'}</td>
                    <td style={{ padding: '0.8rem', opacity: 0.8 }}>{log.autorizador || '-'}</td>
                    <td style={{ padding: '0.8rem', fontSize: '0.7rem', opacity: 0.7 }}>
                      {[
                        log.alianca_check === 'Sim' && '💍 Aliança',
                        log.chave_check === 'Sim' && '🔑 Chave',
                        log.relogio_check === 'Sim' && '⌚ Relógio',
                        log.cracha_check === 'Sim' && '🪪 Crachá',
                      ].filter(Boolean).join(' | ') || '✅ Nenhum'}
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      <span style={{ 
                        color: log.status === 'pendente' ? '#ffaa33' : 'var(--success)',
                        fontWeight: 'bold', fontSize: '0.75rem'
                      }}>
                        {(log.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '0.8rem' }}>
                      {log.status === 'pendente' && (
                        <button onClick={() => handleCloseLog(log.id)} className="btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>
                          Encerrar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </section>
      )}
      {activeTab === 'cards' && <KanbanBoard user={user} />}
    </main>
  );
}
