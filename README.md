# AeroGate - Controle de Acesso Aeronave

Interface premium de controle de acesso sequencial para aeronaves, otimizada para tablets Windows 11.

## 🚀 Funcionalidades
- **Avatar Interativo**: Mascot KC-390 com animação de fala (lip-sync).
- **Voz Premium**: Integração com ElevenLabs (Voz ultra-realista).
- **Fluxo Sequencial**: Perguntas sobre aeronave, autorização e identificação.
- **Segurança (FOE)**: Verificação de adornos com captura automática por câmera.
- **Timer de 5s**: Captura de imagem automática após confirmação de adornos.
- **Persistência**: Logs salvos localmente em JSON.

## 🛠️ Deploy no Railway

O projeto já está configurado com Docker para deploy imediato no **Railway**.

### 1. Configurar Variáveis de Ambiente
No painel do Railway, adicione as seguintes **Variables**:

| Variável | Valor |
| :--- | :--- |
| `ELEVENLABS_API_KEY` | Sua chave da ElevenLabs |
| `NEXT_PUBLIC_ELEVENLABS_VOICE_ID` | `Qrdut83w0Cr152Yb4Xn3` |

### 2. Persistência de Dados (Opcional)
Por padrão, o Railway apaga arquivos salvos no disco ao realizar um novo deploy. Para manter os logs (`data/access_logs.json`) permanentemente:
1. Vá em **Settings** do serviço no Railway.
2. Adicione um **Volume** montado em `/app/data`.

## 💻 Desenvolvimento Local

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um arquivo `.env.local` com suas chaves.
3. Inicie o servidor:
   ```bash
   npm run dev
   ```

---
Desenvolvido para controle de acesso de alta precisão.
