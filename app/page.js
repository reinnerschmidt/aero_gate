'use client';

import { useState, useEffect, useRef } from 'react';
import { useVoice } from '@/hooks/useVoice';
import StepContainer from '@/components/StepContainer/StepContainer';
import CameraCapture from '@/components/Camera/CameraCapture';
import Avatar from '@/components/Avatar/Avatar';
import styles from './page.module.css';

const STEPS = [
  {
    id: 'intro',
    title: 'Atenção: Acesso Restrito',
    description: 'Leia atentamente as políticas de acesso.',
    type: 'info',
    text: 'A entrada na aeronave é restrita e precisa estar autorizada pelo monitor ou supervisor do avião. Você deve seguir as políticas do regulamento interno.'
  },
  {
    id: 'employee_type',
    title: 'Identificação',
    description: 'Selecione seu vínculo.',
    type: 'choice',
    options: [
      { label: 'Embraer', value: 'Embraer', icon: '✈️' },
      { label: 'Fornecedor', value: 'Fornecedor', icon: '🛠️' }
    ],
    text: 'Você é funcionário da Embraer ou Fornecedor?'
  },
  {
    id: 'acompanhante',
    title: 'Acompanhante',
    description: 'Identifique quem está te acompanhando.',
    type: 'input',
    placeholder: 'Nome do acompanhante Embraer',
    text: 'Quem está te acompanhando? Informe o nome do funcionário Embraer responsável.'
  },
  {
    id: 'id_number',
    title: 'Identificação',
    description: 'Sua chapa de identificação.',
    type: 'input',
    placeholder: 'Número da chapa (6 dígitos)',
    text: 'Qual a sua chapa?'
  },
  {
    id: 'aeronave_id',
    title: 'Seleção de Aeronave',
    description: 'Selecione a aeronave que você irá acessar.',
    type: 'choice_dynamic',
    text: 'Qual aeronave você irá acessar hoje?'
  },
  {
    id: 'area_id',
    title: 'Área de Atividade',
    description: 'Selecione a área onde você irá trabalhar.',
    type: 'choice_dynamic',
    text: 'Em qual área você executará sua atividade?'
  },
  {
    id: 'damage_alert',
    title: 'Alerta de Segurança',
    description: 'Verificação de integridade da área.',
    type: 'info_dynamic',
    text: ''
  },
  {
    id: 'op_om',
    title: 'Ordem de Serviço',
    description: 'Informe o número da OP ou OM.',
    type: 'input',
    placeholder: 'OP: 4XXXXXXX ou OM: 7XXXXXXX (8 dígitos)',
    text: 'Qual o número da OP ou OM a ser executada?'
  },
  {
    id: 'autorizador',
    title: 'Autorização',
    description: 'Quem autorizou seu acesso?',
    type: 'input',
    placeholder: 'Nome do monitor/supervisor',
    text: 'Quem autorizou o seu acesso?'
  },
  {
    id: 'nome',
    title: 'Identificação',
    description: 'Seu nome completo.',
    type: 'input',
    placeholder: 'Digite seu nome',
    text: 'Qual o seu nome completo?'
  },
  {
    id: 'fod_policy',
    title: 'Política de FOE',
    description: 'Atenção às regras de segurança.',
    type: 'info',
    text: 'De acordo com nossa Política de FOE, não é permitido a entrada no interior da aeronave com adornos.'
  },
  {
    id: 'alianca_check',
    title: 'Adornos: Aliança',
    description: 'Você está com aliança?',
    type: 'choice',
    options: ['Sim', 'Não'],
    text: 'Você está com aliança?'
  },
  {
    id: 'chave_check',
    title: 'Adornos: Chave',
    description: 'Você está portando chaves?',
    type: 'choice',
    options: ['Sim', 'Não'],
    text: 'Você está com chave?'
  },
  {
    id: 'relogio_check',
    title: 'Adornos: Relógio',
    description: 'Você está utilizando relógio?',
    type: 'choice',
    options: ['Sim', 'Não'],
    text: 'Você está com relógio?'
  },
  {
    id: 'cracha_check',
    title: 'Adornos: Crachá',
    description: 'Você está utilizando crachá?',
    type: 'choice',
    options: ['Sim', 'Não'],
    text: 'Você está com crachá?'
  },
  {
    id: 'closing',
    title: 'Acesso Autorizado',
    description: 'Tenha um bom trabalho.',
    type: 'info',
    text: '' // Dynamic text
  }
];

export default function Home() {
  const [currentStepId, setCurrentStepId] = useState('intro');
  const [formData, setFormData] = useState({});
  const [isStarted, setIsStarted] = useState(false);
  const [isLoginView, setIsLoginView] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [dynamicOptions, setDynamicOptions] = useState([]);
  const [damageInfo, setDamageInfo] = useState(null);
  const [adornAlert, setAdornAlert] = useState(null); // { item, value }
  const [accessDenied, setAccessDenied] = useState(null); // card data if denied
  
  const { speak, isTalking, stop } = useVoice();
  const lastStepSpoken = useRef(null);

  const currentStep = STEPS.find(s => s.id === currentStepId);
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStepId);

  // Fetch dynamic data based on step
  useEffect(() => {
    if (currentStepId === 'aeronave_id') {
      fetch('/api/external/aircraft')
        .then(res => res.json())
        .then(data => setDynamicOptions(data.map(a => ({ label: a.serial, value: a.id }))));
    } else if (currentStepId === 'area_id') {
      fetch('/api/areas')
        .then(res => res.json())
        .then(data => setDynamicOptions(data.map(a => ({ label: a.name, value: a.name }))));
    } else if (currentStepId === 'damage_alert') {
      const aircraftId = formData.aeronave_id;
      const areaName = formData.area_id;
      fetch(`/api/external/damage-check?aircraft_id=${aircraftId}&area_name=${areaName}`)
        .then(res => res.json())
        .then(data => {
          setDamageInfo(data);
          const msg = data.total_danos > 0 
            ? `Cuidado! A área do ${areaName} já teve ${data.total_danos} danos dentro do avião selecionado.`
            : `Atenção! A área do ${areaName} está isenta de danos! Cuidado ao executar a sua atividade.`;
          speak(msg);
        });
    }
  }, [currentStepId]);

  const getStepText = () => {
    if (adornAlert) {
      const artigo = ['aliança', 'chave'].includes(adornAlert.item) ? 'sua' : 'seu';
      return `Por favor, retire ${artigo} ${adornAlert.item} e deposite no porta-objetos da entrada da aeronave antes de prosseguir.`;
    }
    if (currentStepId === 'damage_alert' && damageInfo !== null) {
      return damageInfo.total_danos > 0 
        ? `Cuidado! A área do ${formData.area_id} já teve ${damageInfo.total_danos} danos dentro do avião selecionado.`
        : `Atenção! A área do ${formData.area_id} está isenta de danos! Cuidado ao executar a sua atividade.`;
    }
    if (currentStepId === 'closing') {
      const nome = formData.nome || 'visitante';
      const aeronave = formData.aeronave_label || formData.aeronave_id || 'aeronave';
      const opOm = formData.op_om || '';
      const tipoOrdem = opOm.startsWith('4') ? 'OP' : opOm.startsWith('7') ? 'OM' : 'OP/OM';
      const area = formData.area_id || 'área selecionada';
      return `${nome}, bem-vindo a bordo do avião ${aeronave}, para executar a ${tipoOrdem} ${opOm} na área ${area}. Seu acesso está autorizado somente para a área e serviços indicados. Qualquer outra necessidade, contate o monitor ou supervisor da posição.`;
    }
    return currentStep?.text || '';
  };

  useEffect(() => {
    if (isStarted && currentStepId !== lastStepSpoken.current) {
      if (currentStepId !== 'damage_alert') { // Damage alert speaks its own dynamic message
        speak(getStepText());
      }
      lastStepSpoken.current = currentStepId;
    }
  }, [currentStepId, isStarted, speak]);

  useEffect(() => {
    if (adornAlert) {
      speak(getStepText());
    }
  }, [adornAlert]);

  const handleStart = () => {
    setIsStarted(true);
    lastStepSpoken.current = 'intro';
    speak(STEPS[0].text);
  };

  const handleBack = () => {
    const flow = [
      'intro', 'employee_type', 'acompanhante', 'id_number', 'aeronave_id', 'area_id', 'damage_alert',
      'op_om', 'autorizador', 'nome', 'fod_policy', 'alianca_check', 'chave_check', 'relogio_check', 'cracha_check', 'closing'
    ];
    const currentIndex = flow.indexOf(currentStepId);
    if (currentIndex > 0) {
      let prevId = flow[currentIndex - 1];
      // Se Embraer e voltando de id_number, pular acompanhante
      if (prevId === 'acompanhante' && formData.employee_type !== 'Fornecedor') {
        prevId = 'employee_type';
      }
      setCurrentStepId(prevId);
    }
  };

  const handleReset = () => {
    if (confirm('Tem certeza que deseja cancelar? Todos os dados preenchidos serão perdidos.')) {
      window.location.reload();
    }
  };

  const handleNext = async (value = null) => {
    let nextId = null;
    let newFormData = { ...formData };

    // Validação de preenchimento obrigatório para campos de texto
    if (currentStep.type === 'input' && value === null) {
      const inputValue = formData[currentStepId];
      if (!inputValue || inputValue.trim() === '') {
        alert('Preenchimento obrigatório!');
        return;
      }
      value = inputValue;
    }

    // Validação específica para OP/OM
    if (currentStepId === 'op_om') {
      const v = (value || '').trim();
      const isOP = /^4\d{7}$/.test(v);
      const isOM = /^7\d{7}$/.test(v);
      if (!isOP && !isOM) {
        alert('Número inválido!\n• OP deve começar com 4 e ter 8 dígitos (ex: 40001234)\n• OM deve começar com 7 e ter 8 dígitos (ex: 70001234)');
        return;
      }
    }

    // Validação específica para Chapa (Embraer)
    if (currentStepId === 'id_number' && formData.employee_type === 'Embraer') {
      const v = (value || '').trim();
      if (!/^\d{6}$/.test(v)) {
        alert('A chapa Embraer deve conter exatamente 6 dígitos numéricos.');
        return;
      }
    }

    if (value !== null) {
      newFormData[currentStepId] = value;
      // Para aeronave, salvar o serial junto para usar na mensagem final
      if (currentStepId === 'aeronave_id') {
        const selected = dynamicOptions.find(o => String(o.value) === String(value));
        if (selected) newFormData.aeronave_label = selected.label;
      }
      setFormData(newFormData);
    }

    // Verificação de Card Aberto na Área (Bloqueio)
    if (currentStepId === 'area_id') {
      try {
        const aircraftSerial = newFormData.aeronave_label;
        const areaName = value;
        const res = await fetch(`/api/check-open-card?aircraft_serial=${aircraftSerial}&area_name=${areaName}`);
        const data = await res.json();
        if (data.hasOpenCard) {
          setAccessDenied(data.card);
          speak(`Acesso negado. Existe um card aberto para a área ${areaName} no avião ${aircraftSerial}. Por favor, procure o monitor ou supervisor da posição.`);
          return;
        }
      } catch (err) {
        console.error('Error checking open card:', err);
      }
    }

    const flow = [
      'intro', 'employee_type', 'acompanhante', 'id_number', 'aeronave_id', 'area_id', 'damage_alert',
      'op_om', 'autorizador', 'nome', 'fod_policy', 'alianca_check', 'chave_check', 'relogio_check', 'cracha_check', 'closing'
    ];

    const currentIndex = flow.indexOf(currentStepId);

    // Fornecedor: acompanhante → id_number → aeronave. Embraer: pula acompanhante
    if (currentStepId === 'employee_type' && value !== 'Fornecedor') {
      nextId = 'id_number';
    } else if (currentStepId === 'id_number' && newFormData.employee_type !== 'Fornecedor') {
      nextId = 'aeronave_id';
    } else if (currentStepId === 'closing') {
      saveToDatabase(newFormData);
      alert('Registro finalizado e salvo!');
      window.location.reload();
      return;
    } else {
      nextId = flow[currentIndex + 1];
    }

    if (nextId) setCurrentStepId(nextId);
  };

  const saveToDatabase = async (data) => {
    try {
      await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [currentStepId]: e.target.value
    }));
  };

  const handleCapture = (photo) => {
    setFormData(prev => ({
      ...prev,
      [`photo_${currentStepId}`]: 'Captured'
    }));
    handleNext();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/management';
      } else {
        setLoginError(data.error);
      }
    } catch (err) {
      setLoginError('Erro ao conectar ao servidor');
    }
  };

  if (!isStarted && !isLoginView) {
    return (
      <main className={styles.main}>
        <Avatar text="Olá! Como posso ajudar hoje? Escolha uma das opções abaixo." isTalking={false} />
        <div className="glass animate-fade" style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>AeroGate</h1>
          <p style={{ marginBottom: '2.5rem', opacity: 0.8 }}>Controle de Acesso Aeronave</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn-primary" onClick={handleStart} style={{ padding: '1.2rem' }}>
              Registrar entrada na aeronave
            </button>
            
            <button 
              className={styles.btnSecondary} 
              onClick={() => setIsLoginView(true)}
              style={{ padding: '1.2rem', width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
            >
              Fazer Login (Admin/Monitor)
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (isLoginView) {
    return (
      <main className={styles.main}>
        <div className="glass animate-fade" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Acesso Restrito</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Usuário"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              required
            />
            <input
              type="password"
              className={styles.inputField}
              placeholder="Senha"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            {loginError && <p style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{loginError}</p>}
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Entrar</button>
            <button 
              type="button" 
              onClick={() => setIsLoginView(false)}
              style={{ background: 'none', border: 'none', color: 'white', opacity: 0.6, cursor: 'pointer', marginTop: '0.5rem' }}
            >
              Voltar
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      {/* Right Panel: Question Flow */}
      <div className={styles.questionPanel}>
        <Avatar text={getStepText()} isTalking={isTalking} />
        {accessDenied && (
          <div className="glass animate-fade" style={{ padding: '3rem', textAlign: 'center', borderColor: '#ff4444', width: '100%', maxWidth: '500px', margin: 'auto' }}>
            <span style={{ fontSize: '4rem', marginBottom: '1rem', display: 'block' }}>🚫</span>
            <h2 style={{ color: '#ff4444', marginBottom: '1.5rem', fontWeight: 800 }}>Acesso Negado</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
              Existe um acesso em aberto para esta área realizado por:<br/>
              <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>{accessDenied.nome}</strong><br/>
              <small style={{ opacity: 0.7 }}>(Chapa: {accessDenied.id_number})</small>
            </p>
            <div style={{ background: 'rgba(255,68,68,0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid rgba(255,68,68,0.2)' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                Por favor, procure o <strong>Monitor</strong> ou <strong>Supervisor</strong> da posição para regularizar o acesso antes de iniciar.
              </p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => window.location.reload()}
              style={{ background: '#ff4444', width: '100%' }}
            >
              Voltar ao Início
            </button>
          </div>
        )}

        {!accessDenied && (
          <StepContainer
        title={currentStep.title}
        description={null}
        onNext={() => handleNext()}
        isLast={currentStepId === 'closing'}
        nextLabel={currentStepIndex === 0 ? 'Iniciar' : 'Próximo'}
        hideNext={['choice', 'choice_dynamic', 'camera'].includes(currentStep.type)}
        titleColor={currentStepId === 'damage_alert' && damageInfo?.total_danos > 0 ? '#ffcc00' : 'white'}
      >
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button onClick={handleBack} className={styles.navBtn} title="Voltar">←</button>
          <button onClick={handleReset} className={styles.navBtn} title="Início">🏠</button>
        </div>
        {currentStep.type === 'input' && (
          <input
            type="text"
            className={styles.inputField}
            placeholder={currentStep.placeholder}
            value={formData[currentStepId] || ''}
            onChange={handleInputChange}
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleNext(e.target.value)}
          />
        )}
        
        {currentStep.type === 'choice' && (
          <div className={styles.choiceContainer}>
            {currentStep.options.map(opt => {
              const label = typeof opt === 'object' ? opt.label : opt;
              const value = typeof opt === 'object' ? opt.value : opt;
              const icon = typeof opt === 'object' ? opt.icon : null;
              
              return (
                <button 
                  key={value} 
                  className={value === 'Sim' ? 'btn-primary' : (value === 'Não' ? styles.btnSecondary : 'btn-primary')} 
                  onClick={() => {
                    const adornos = ['alianca_check','chave_check','relogio_check','cracha_check'];
                    const itemNames = { alianca_check: 'aliança', chave_check: 'chave', relogio_check: 'relógio', cracha_check: 'crachá' };
                    if (value === 'Sim' && adornos.includes(currentStepId)) {
                      setAdornAlert({ item: itemNames[currentStepId], value });
                    } else {
                      handleNext(value);
                    }
                  }}
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: icon ? '2rem' : '1.2rem',
                    flex: icon ? 'none' : 1,
                    minWidth: icon ? '150px' : 'auto'
                  }}
                >
                  {icon && <span style={{ fontSize: '2rem' }}>{icon}</span>}
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        )}

        {currentStep.type === 'choice_dynamic' && (
          <div className={styles.choiceContainer} style={{ flexWrap: 'wrap' }}>
            {dynamicOptions.map(opt => (
              <button 
                key={opt.value}
                className="btn-primary"
                onClick={() => handleNext(opt.value)}
                style={{ minWidth: '45%' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {currentStep.type === 'camera' && (
          <CameraCapture onCapture={handleCapture} useTimer={true} />
        )}

        {(currentStep.type === 'info' || currentStep.type === 'info_dynamic') && (
          <div className={styles.successIcon} style={{ fontSize: '1.5rem', textAlign: 'center' }}>
            {currentStepId === 'damage_alert' ? (
              <div style={{ color: damageInfo?.total_danos > 0 ? '#ffcc00' : 'var(--success)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '4rem' }}>{damageInfo?.total_danos > 0 ? '⚠️' : '✅'}</span>
                <span style={{ fontWeight: 'bold', fontSize: '2rem' }}>
                  {damageInfo?.total_danos > 0 ? 'CUIDADO' : 'ATENÇÃO'}
                </span>
              </div>
            ) : (
              <span style={{ fontSize: '3rem' }}>
                {(currentStepId === 'intro' || currentStepId === 'fod_policy') ? '⚠️' : '✅'}
              </span>
            )}
            <p style={{ fontSize: '1.3rem', marginTop: '1.5rem', lineHeight: '1.6' }}>{getStepText()}</p>
          </div>
        )}
      </StepContainer>
        )}

      <div className={styles.progress}>
        Passo {currentStepIndex + 1} de {STEPS.length}
      </div>
      </div>{/* end questionPanel */}

      {adornAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div className="glass animate-fade" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', border: '2px solid var(--primary)' }}>
            {(() => {
              const adornoImages = {
                'aliança': '/alianca.png',
                'chave': '/chave.png',
                'relógio': '/relogio.png',
                'crachá': '/cracha.png'
              };
              return (
                <img 
                  src={adornoImages[adornAlert.item]} 
                  alt={adornAlert.item}
                  style={{ width: '150px', height: '150px', objectFit: 'contain', marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(0,209,255,0.5))' }}
                />
              );
            })()}
            <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>Atenção: {adornAlert.item.toUpperCase()}</h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
              Por favor, <strong>retire</strong> {['aliança', 'chave'].includes(adornAlert.item) ? 'sua' : 'seu'} {adornAlert.item} e <strong>deposite no porta-objetos</strong> da entrada da aeronave antes de prosseguir.
            </p>
            <button 
              className="btn-primary" 
              onClick={() => {
                const val = adornAlert.value;
                setAdornAlert(null);
                handleNext(val);
              }}
              style={{ width: '100%' }}
            >
              Já guardei, prosseguir
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
