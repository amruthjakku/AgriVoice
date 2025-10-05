const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const USE_REAL_APIS = import.meta.env.VITE_USE_REAL_APIS === 'true';

class TTSService {
  private voiceIds: Record<string, string> = {
    'en': 'EXAVITQu4vr4xnSDxMaL',
    'hi': 'pNInz6obpgDQGcFmaJgB',
    'te': 'yoZ06aMxZJJ28mfd3POQ'
  };

  async synthesizeSpeech(text: string, language: string): Promise<string> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return `data:audio/mp3;base64,mock_audio_${language}`;
    }

    try {
      const voiceId = this.voiceIds[language] || this.voiceIds['en'];

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('TTS API Error:', error);
        throw new Error('Text-to-speech conversion failed');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('TTS Error:', error);
      throw new Error('Failed to synthesize speech. Please check your API key and try again.');
    }
  }

  async synthesizeSpeechOpenAI(text: string): Promise<string> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return `data:audio/mp3;base64,mock_audio`;
    }

    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

      const response = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          input: text,
          voice: 'alloy',
          speed: 1.0
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI TTS failed');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('OpenAI TTS Error:', error);
      throw error;
    }
  }
}

export const ttsService = new TTSService();
