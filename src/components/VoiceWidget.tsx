import { useState, useEffect } from 'react';
import { Mic, StopCircle, Loader2, Volume2, Languages } from 'lucide-react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { audioService } from '../services/audio.service';

const languages = [
  { code: 'hi', name: 'हिंदी', label: 'Hindi' },
  { code: 'te', name: 'తెలుగు', label: 'Telugu' },
  { code: 'en', name: 'English', label: 'English' }
];

export const VoiceWidget = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('hi');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [answer, setAnswer] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const {
    isRecording,
    audioBlob,
    error: recordError,
    duration,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  useEffect(() => {
    if (audioBlob) {
      handleUpload();
    }
  }, [audioBlob]);

  useEffect(() => {
    if (sessionId) {
      const checkStatus = async () => {
        try {
          const response = await audioService.getSession(sessionId);
          if (response.status === 'completed') {
            setAnswer(response.answer_text);
            setIsProcessing(false);
          } else if (response.status === 'failed') {
            setIsProcessing(false);
          }
        } catch (err) {
          console.error('Error checking session:', err);
        }
      };

      const interval = setInterval(checkStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  const handleUpload = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    setTranscript('');
    setAnswer('');
    setProcessingError(null);

    try {
      const response = await audioService.uploadAudio(audioBlob, selectedLanguage);
      setSessionId(response.session_id);
      setTranscript(response.transcript);
    } catch (err) {
      console.error('Upload error:', err);
      setProcessingError(err instanceof Error ? err.message : 'Failed to process audio');
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    resetRecording();
    setSessionId(null);
    setTranscript('');
    setAnswer('');
    setIsProcessing(false);
    setProcessingError(null);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AgriVoice Assistant</h2>
        <div className="relative">
          <button
            onClick={() => setShowLanguages(!showLanguages)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            <Languages className="w-5 h-5" />
            <span className="text-sm font-medium">
              {languages.find(l => l.code === selectedLanguage)?.name}
            </span>
          </button>
          {showLanguages && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLanguage(lang.code);
                    setShowLanguages(false);
                    handleReset();
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition ${
                    selectedLanguage === lang.code ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <div className="font-medium">{lang.name}</div>
                  <div className="text-xs text-gray-500">{lang.label}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 animate-ping">
              <div className="w-32 h-32 rounded-full bg-red-400 opacity-75"></div>
            </div>
          )}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : isProcessing
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } shadow-lg`}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isRecording ? (
              <StopCircle className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>
        </div>

        {isRecording && (
          <div className="mt-4 text-center">
            <div className="text-lg font-semibold text-red-600">{formatDuration(duration)}</div>
            <div className="text-sm text-gray-500 mt-1">Recording...</div>
          </div>
        )}

        {isProcessing && !isRecording && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">Processing your query...</div>
          </div>
        )}

        {recordError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {recordError}
          </div>
        )}

        {processingError && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {processingError}
          </div>
        )}
      </div>

      {transcript && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Volume2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-blue-600 font-medium mb-1">Your Question:</div>
              <div className="text-gray-800">{transcript}</div>
            </div>
          </div>
        </div>
      )}

      {answer && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-start gap-2">
            <Volume2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <div className="text-xs text-green-600 font-medium mb-1">Answer:</div>
              <div className="text-gray-800">{answer}</div>
            </div>
          </div>
        </div>
      )}

      {(transcript || answer) && !isProcessing && (
        <button
          onClick={handleReset}
          className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-medium"
        >
          Ask Another Question
        </button>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Tap the microphone to ask questions about farming, crops, pests, weather, and more.
        </div>
      </div>
    </div>
  );
};
