const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const USE_REAL_APIS = import.meta.env.VITE_USE_REAL_APIS === 'true';

class STTService {
  private mockTranscripts: Record<string, string> = {
    'hi': 'मेरी फसल में कीट लग गए हैं। क्या करूं?',
    'te': 'నా పంటలో చీడలు వచ్చాయి. నేను ఏమి చేయాలి?',
    'en': 'My crops have pests. What should I do?',
  };

  async transcribeAudio(audioBlob: Blob, language: string): Promise<string> {
    if (!USE_REAL_APIS) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return this.mockTranscripts[language] || this.mockTranscripts['en'];
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      if (language !== 'en') {
        formData.append('language', language);
      }

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Transcription failed');
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error('STT Error:', error);
      throw new Error('Failed to transcribe audio. Please check your API key and try again.');
    }
  }

  async detectLanguage(audioBlob: Blob): Promise<string> {
    if (!USE_REAL_APIS) {
      return 'hi';
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Language detection failed');
      }

      const result = await response.json();
      return result.language || 'en';
    } catch (error) {
      console.error('Language detection error:', error);
      return 'en';
    }
  }
}

export const sttService = new STTService();
