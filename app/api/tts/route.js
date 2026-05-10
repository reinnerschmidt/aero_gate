import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();
    const apiKey = process.env.ELEVENLABS_API_KEY;
    
    // Tentando uma voz mais comum/recente para evitar 404
    // cgSgSAsqbe4pDtn8ARNW (River - Versátil e humano)
    const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || 'cgSgSAsqbe4pDtn8ARNW';

    if (!apiKey || apiKey === 'your_key_here' || !apiKey.startsWith('sk_')) {
      return NextResponse.json({ error: 'Chave de API ElevenLabs inválida ou ausente.' }, { status: 401 });
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('ElevenLabs API Error Details:', errorData);
      return NextResponse.json({ 
        error: `Erro ElevenLabs (${response.status}): ${errorData.detail?.message || response.statusText}`,
        detail: errorData
      }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: { 'Content-Type': 'audio/mpeg' },
    });
  } catch (error) {
    console.error('TTS Route Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
