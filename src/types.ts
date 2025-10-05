export interface Interaction {
  id: string;
  user_phone?: string;
  session_id: string;
  transcript?: string;
  language: string;
  answer_text?: string;
  answer_audio_url?: string;
  intent?: string;
  tags: string[];
  status: string;
  audio_duration: number;
  processing_time: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  phone: string;
  preferred_language: string;
  village?: string;
  state?: string;
  crops: string[];
  total_interactions: number;
  created_at: string;
  updated_at: string;
}

export interface AudioUploadResponse {
  session_id: string;
  transcript: string;
  status: string;
}

export interface SessionResponse {
  transcript: string;
  answer_text: string;
  answer_audio_url?: string;
  status: string;
}

export interface LLMResponse {
  answer: string;
  intent: string;
  tags: string[];
}
