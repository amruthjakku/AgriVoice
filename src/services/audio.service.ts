import { AudioUploadResponse, SessionResponse } from '../types';
import { sttService } from './stt.service';
import { llmService } from './llm.service';
import { ttsService } from './tts.service';
import { supabaseService } from './supabase.service';



class AudioService {
  private processingQueue = new Map<string, Promise<void>>();

  async uploadAudio(audioBlob: Blob, language: string, userPhone?: string): Promise<AudioUploadResponse> {
    const startTime = Date.now();
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const interaction = await supabaseService.createInteraction({
      session_id: sessionId,
      language,
      user_phone: userPhone,
      status: 'processing',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const processingPromise = this.processAudio(interaction.id, sessionId, audioBlob, language, startTime, userPhone);
    this.processingQueue.set(sessionId, processingPromise);

    processingPromise.catch(error => {
      console.error('Processing error:', error);
      supabaseService.updateInteraction(interaction.id, {
        status: 'failed'
      });
    });

    return {
      session_id: sessionId,
      transcript: '',
      status: 'processing'
    };
  }

  private async processAudio(
    interactionId: string,
    sessionId: string,
    audioBlob: Blob,
    language: string,
    startTime: number,
    userPhone?: string
  ): Promise<void> {
    try {
      const transcript = await sttService.transcribeAudio(audioBlob, language);

      await supabaseService.updateInteraction(interactionId, {
        transcript,
        status: 'processing'
      });

      const llmResponse = await llmService.generateAnswer(transcript, language);

      const audioUrl = await ttsService.synthesizeSpeech(llmResponse.answer, language);

      const processingTime = Date.now() - startTime;

      await supabaseService.updateInteraction(interactionId, {
        answer_text: llmResponse.answer,
        answer_audio_url: audioUrl,
        intent: llmResponse.intent,
        tags: llmResponse.tags,
        processing_time: processingTime,
        status: 'completed'
      });

      if (userPhone) {
        await supabaseService.incrementUserInteractionCount(userPhone);
      }

      this.processingQueue.delete(sessionId);
    } catch (error) {
      console.error('Audio processing error:', error);
      await supabaseService.updateInteraction(interactionId, {
        status: 'failed'
      });
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<SessionResponse> {
    const interaction = await supabaseService.getInteractionBySessionId(sessionId);

    if (!interaction) {
      throw new Error('Session not found');
    }

    return {
      transcript: interaction.transcript || '',
      answer_text: interaction.answer_text || '',
      answer_audio_url: interaction.answer_audio_url,
      status: interaction.status
    };
  }

  async pollSession(sessionId: string, maxAttempts: number = 30): Promise<SessionResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await this.getSession(sessionId);

      if (response.status === 'completed' || response.status === 'failed') {
        return response;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    throw new Error('Session processing timeout');
  }
}

export const audioService = new AudioService();
