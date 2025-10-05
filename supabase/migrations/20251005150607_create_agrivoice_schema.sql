/*
  # AgriVoice Database Schema

  1. New Tables
    - `interactions`
      - `id` (uuid, primary key) - Unique identifier for each interaction
      - `user_phone` (text) - User phone number for tracking
      - `session_id` (text) - Unique session identifier
      - `transcript` (text) - Transcribed audio text from STT
      - `language` (text) - Language code (hi, te, en, etc.)
      - `answer_text` (text) - LLM generated answer text
      - `answer_audio_url` (text) - URL to TTS audio file in storage
      - `intent` (text) - Detected intent/category (pest, irrigation, etc.)
      - `tags` (text array) - Categorization tags for analytics
      - `status` (text) - Processing status (queued, processing, completed, failed)
      - `audio_duration` (integer) - Duration of audio in seconds
      - `processing_time` (integer) - Time taken to process in milliseconds
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update
    
    - `user_profiles`
      - `id` (uuid, primary key) - Unique identifier
      - `phone` (text, unique) - User phone number
      - `preferred_language` (text) - Default language preference
      - `village` (text) - Village/location name
      - `state` (text) - State name
      - `crops` (text array) - Crops grown by farmer
      - `total_interactions` (integer) - Count of total interactions
      - `created_at` (timestamptz) - Account creation date
      - `updated_at` (timestamptz) - Last profile update

  2. Security
    - Enable RLS on all tables
    - Public access for demo/MVP purposes
    - Production should use authenticated policies

  3. Indexes
    - Index on created_at for time-based queries
    - Index on user_phone for user lookups
    - Index on intent for analytics aggregation
    - Index on status for filtering active sessions

  4. Notes
    - Uses default values to prevent null issues
    - Includes performance tracking fields
    - Designed for real-time analytics queries
*/

CREATE TABLE IF NOT EXISTS interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone text,
  session_id text NOT NULL,
  transcript text,
  language text DEFAULT 'hi',
  answer_text text,
  answer_audio_url text,
  intent text,
  tags text[] DEFAULT '{}',
  status text DEFAULT 'queued',
  audio_duration integer DEFAULT 0,
  processing_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  preferred_language text DEFAULT 'hi',
  village text,
  state text,
  crops text[] DEFAULT '{}',
  total_interactions integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interactions_user_phone ON interactions(user_phone);
CREATE INDEX IF NOT EXISTS idx_interactions_intent ON interactions(intent);
CREATE INDEX IF NOT EXISTS idx_interactions_status ON interactions(status);
CREATE INDEX IF NOT EXISTS idx_interactions_language ON interactions(language);

ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read interactions"
  ON interactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert interactions"
  ON interactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update interactions"
  ON interactions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read user profiles"
  ON user_profiles FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can insert user profiles"
  ON user_profiles FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can update user profiles"
  ON user_profiles FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);