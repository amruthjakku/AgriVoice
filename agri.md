# AgriVoice - Voice-First Farm Advisor

## Project Overview

AgriVoice is a voice-first agricultural advisory platform designed for farmers in India. It allows farmers to ask questions about crops, pests, weather, irrigation, and market prices in their local language (Hindi, Telugu, or English) and receive voice responses with practical farming advice.

**Current Status:** MVP (Minimum Viable Product) - Fully functional web application with voice interface and admin analytics dashboard.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Voice Services:** 
  - STT (Speech-to-Text): OpenAI Whisper API
  - LLM (Language Model): OpenRouter (Meta Llama)
  - TTS (Text-to-Speech): ElevenLabs
- **Icons:** Lucide React

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx    # Analytics dashboard
│   │   └── VoiceWidget.tsx       # Main voice interface
│   ├── hooks/
│   │   └── useAudioRecorder.ts   # Audio recording hook
│   ├── services/
│   │   ├── analytics.service.ts  # Analytics data aggregation
│   │   ├── audio.service.ts      # Audio processing orchestration
│   │   ├── llm.service.ts        # LLM API integration
│   │   ├── stt.service.ts        # Speech-to-Text API
│   │   ├── supabase.service.ts   # Database operations
│   │   └── tts.service.ts        # Text-to-Speech API
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   └── types.ts                  # TypeScript type definitions
├── supabase/
│   └── migrations/
│       └── 20251005150607_create_agrivoice_schema.sql  # Database schema
└── vite.config.ts                # Vite configuration
```

## Features

### Voice Assistant
- Multi-language support (Hindi, Telugu, English)
- Voice recording with visual feedback
- Real-time transcription display
- Audio playback of responses
- Mock mode for development (no API keys needed)

### Admin Dashboard
- Total interactions count
- Average response time metrics
- Success rate tracking
- Daily interaction trends
- Top queries analysis
- Language distribution charts
- Intent categorization
- CSV export functionality

## Setup Instructions

### Required Environment Variables

The application requires Supabase credentials (already configured in Replit Secrets):
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### Optional API Keys (for production use)

For production with real voice processing, add these secrets:
- `VITE_OPENAI_API_KEY` - For Whisper STT
- `VITE_OPENROUTER_API_KEY` - For LLM responses
- `VITE_ELEVENLABS_API_KEY` - For voice synthesis
- Set `VITE_USE_REAL_APIS=true` to enable

### Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration SQL from `supabase/migrations/20251005150607_create_agrivoice_schema.sql`
3. This creates two tables:
   - `interactions` - Stores all voice interactions
   - `user_profiles` - Stores farmer profiles

## Development

The application runs in mock mode by default, which means it simulates voice processing without requiring external API keys. This is perfect for development and testing.

**Current Mode:** Mock mode (VITE_USE_REAL_APIS=false)

To test the voice interface:
1. Click the microphone button
2. Allow microphone access when prompted
3. Speak your question
4. View the transcript and response

## Deployment

The application is configured to run on port 5000 with proper host settings for Replit's proxy environment.

**Workflow:** Frontend server running on http://0.0.0.0:5000

## Architecture

The application follows a service-oriented architecture:
1. User records audio via browser MediaRecorder API
2. Audio is uploaded to the audio service
3. STT service transcribes the audio
4. LLM service generates a relevant answer
5. TTS service converts text response to audio
6. All interactions are logged to Supabase for analytics

## Key Design Decisions

- **Mock Mode:** Enables development without API costs
- **Supabase:** Provides PostgreSQL with real-time capabilities
- **Frontend-only:** All processing happens in the browser (serverless)
- **Language Detection:** Intent and tags extracted from transcript
- **Responsive Design:** Works on desktop and mobile devices

## Future Enhancements

- WhatsApp voice bot integration
- IVR (Interactive Voice Response) channel
- Crop image diagnosis with YOLO/CLIP
- Offline-first mobile app
- Multi-region model fine-tuning
- Voice-based forms for subsidies

## Recent Changes

- **2025-10-05:** Initial setup on Replit
  - Configured Vite for Replit environment (port 5000, host 0.0.0.0)
  - Set up Supabase integration
  - Created TypeScript type definitions
  - Configured workflow for automatic restart
  - Added .gitignore for Node.js projects

## Important Notes

- The application uses mock data by default to avoid API costs
- Database migrations must be run manually in Supabase
- Environment variables are managed through Replit Secrets
- The app is designed for farmers with limited technical skills
