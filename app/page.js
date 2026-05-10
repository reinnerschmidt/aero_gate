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
    id: 'aeronave_familia',
    title: 'Família da Aeronave',
    description: 'Selecione o modelo da aeronave.',
    type: 'choice',
    options: ['E1', 'E2'],
    text: 'Em qual aeronave você irá entrar? E1 ou E2?'
  },
  {
    id: 'aeronave_serial',
    title: 'Número de Série',
    description: 'Complete o número de série.',
    type: 'input',
    text: 'Por favor, insira o número de série da aeronave.'
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
    id: 'id_number',
    title: 'Documento',
    description: 'Seu ID de identificação.',
    type: 'input',
    placeholder: 'Número do ID',
    text: 'Qual o seu número de identificação ou ID?'
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
    id: 'alianca_foto',
    title: 'Registro: Aliança',
    description: 'Mostre suas mãos para a câmera.',
    type: 'camera',
    text: 'Por favor, mostre as mãos na câmera para o registro.'
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
    id: 'chave_foto',
    title: 'Registro: Chave',
    description: 'Mostre a chave para a câmera.',
    type: 'camera',
    text: 'Por favor, mostre a chave na câmera para o registro.'
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
    id: 'relogio_foto',
    title: 'Registro: Relógio',
    description: 'Mostre o relógio para a câmera.',
    type: 'camera',
    text: 'Por favor, mostre o relógio na câmera para o registro.'
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
    id: 'cracha_foto',
    title: 'Registro: Crachá',
    description: 'Mostre o crachá para a câmera.',
    type: 'camera',
    text: 'Por favor, mostre o crachá na câmera para o registro.'
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
  const { speak, isTalking, stop } = useVoice();
  const lastStepSpoken = useRef(null);

  const currentStep = STEPS.find(s => s.id === currentStepId);
  const currentStepIndex = STEPS.findIndex(s => s.id === currentStepId);

  const getStepText = () => {
    if (currentStepId === 'closing') {
      const avName = `${formData.aeronave_familia || ''} ${formData.aeronave_serial || ''}`;
      return `Senhor ${formData.nome || 'visitante'}, seja bem-vindo a bordo do avião ${avName}. Durante a sua permanência confira os materiais que trouxe e ao sair não se esqueça de conferir.`;
    }
    return currentStep?.text || '';
  };

  useEffect(() => {
    // Only speak if started and if the step has actually changed
    // This prevents double speech on the first step
    if (isStarted && currentStepId !== lastStepSpoken.current) {
      speak(getStepText());
      lastStepSpoken.current = currentStepId;
    }
  }, [currentStepId, isStarted, speak]);

  const handleStart = () => {
    // Unlocking audio context on user click
    setIsStarted(true);
    // Setting the ref so the useEffect doesn't repeat it
    lastStepSpoken.current = 'intro';
    speak(STEPS[0].text);
  };

  const handleNext = (value = null) => {
    let nextId = null;
    let newFormData = { ...formData };

    if (value !== null) {
      newFormData[currentStepId] = value;
      if (currentStepId === 'aeronave_familia') {
        const prefix = value === 'E1' ? '0170-' : '0190-20';
        newFormData['aeronave_serial'] = prefix;
      }
      setFormData(newFormData);
    }

    if (currentStepId === 'intro') nextId = 'aeronave_familia';
    else if (currentStepId === 'aeronave_familia') nextId = 'aeronave_serial';
    else if (currentStepId === 'aeronave_serial') nextId = 'autorizador';
    else if (currentStepId === 'autorizador') nextId = 'nome';
    else if (currentStepId === 'nome') nextId = 'id_number';
    else if (currentStepId === 'id_number') nextId = 'fod_policy';
    else if (currentStepId === 'fod_policy') nextId = 'alianca_check';
    else if (currentStepId === 'alianca_check') nextId = value === 'Sim' ? 'alianca_foto' : 'chave_check';
    else if (currentStepId === 'alianca_foto') nextId = 'chave_check';
    else if (currentStepId === 'chave_check') nextId = value === 'Sim' ? 'chave_foto' : 'relogio_check';
    else if (currentStepId === 'chave_foto') nextId = 'relogio_check';
    else if (currentStepId === 'relogio_check') nextId = value === 'Sim' ? 'relogio_foto' : 'cracha_check';
    else if (currentStepId === 'relogio_foto') nextId = 'cracha_check';
    else if (currentStepId === 'cracha_check') nextId = value === 'Sim' ? 'cracha_foto' : 'closing';
    else if (currentStepId === 'cracha_foto') nextId = 'closing';
    else if (currentStepId === 'closing') {
      saveToDatabase(newFormData);
      alert('Registro finalizado e salvo!');
      window.location.reload();
      return;
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

  if (!isStarted) {
    return (
      <main className={styles.main}>
        <Avatar text="Olá! Eu sou o seu assistente de bordo. Vamos iniciar o seu registro de acesso?" isTalking={false} />
        <div className="glass animate-fade" style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ fontSize: '3rem' }}>AeroGate</h1>
          <p style={{ marginBottom: '2rem' }}>Controle de Acesso Aeronave</p>
          <button className="btn-primary" onClick={handleStart}>
            Iniciar Procedimento e Ativar Áudio
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <Avatar text={getStepText()} isTalking={isTalking} />
      
      <StepContainer
        title={currentStep.title}
        description={null}
        onNext={() => handleNext()}
        isLast={currentStepId === 'closing'}
        nextLabel={currentStepIndex === 0 ? 'Iniciar' : 'Próximo'}
      >
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
            {currentStep.options.map(opt => (
              <button 
                key={opt}
                className={opt === 'Sim' || opt === 'E1' || opt === 'E2' ? 'btn-primary' : styles.btnSecondary} 
                onClick={() => handleNext(opt)}
                style={{ flex: 1 }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentStep.type === 'camera' && (
          <CameraCapture onCapture={handleCapture} useTimer={true} />
        )}

        {currentStep.type === 'info' && (
          <div className={styles.successIcon}>
            {currentStepId === 'intro' || currentStepId === 'fod_policy' ? '⚠️' : '✓'}
          </div>
        )}
      </StepContainer>

      <div className={styles.progress}>
        Passo {currentStepIndex + 1} de {STEPS.length}
      </div>
    </main>
  );
}
