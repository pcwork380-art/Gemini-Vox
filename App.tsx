
import React, { useState, useCallback } from 'react';
import { VoiceName, SpeechClip } from './types';
import { speechService } from './services/geminiService';
import { VoiceSelector } from './components/VoiceSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { audioBufferToWav } from './utils/audioUtils';

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(VoiceName.Adam);
  const [selectedMood, setSelectedMood] = useState('natural');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentClip, setCurrentClip] = useState<AudioBuffer | null>(null);
  const [history, setHistory] = useState<SpeechClip[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to speak.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    try {
      const audioBuffer = await speechService.generateSpeech({
        text,
        voice: selectedVoice,
        mood: selectedMood === 'natural' ? undefined : selectedMood
      });
      
      setCurrentClip(audioBuffer);
      
      const newClip: SpeechClip = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        voice: selectedVoice,
        timestamp: Date.now(),
        audioBuffer
      };
      
      setHistory(prev => [newClip, ...prev].slice(0, 10)); // Keep last 10
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during speech generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadClip = (clip: SpeechClip) => {
    const wavBlob = audioBufferToWav(clip.audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clip-${clip.id}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setHistory([]);
    setCurrentClip(null);
  };

  return (
    <div className="min-h-screen pb-20 text-slate-200">
      {/* Header */}
      <header className="border-b border-slate-800 py-6 px-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Gemini Vox</h1>
          </div>
          <div className="hidden sm:block text-sm text-slate-500">
            AI Speech Synthesis
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        {/* Input Section */}
        <section className="bg-slate-900/30 rounded-3xl p-6 border border-slate-800">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here..."
            className="w-full h-40 bg-transparent text-lg text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
            maxLength={1000}
          />
          <div className="flex justify-end mt-2 text-xs text-slate-600">
            {text.length}/1000 characters
          </div>
        </section>

        {/* Configuration Section */}
        <VoiceSelector 
          selectedVoice={selectedVoice} 
          onVoiceChange={setSelectedVoice}
          selectedMood={selectedMood}
          onMoodChange={setSelectedMood}
        />

        {/* Action Button */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !text.trim()}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-xl ${
              isGenerating || !text.trim()
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-[0.98]'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Synthesizing...
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 8.83L12 11h3.17L14 8.83zM15 13H9l1.17 1.17L9 13zm-2-9c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zM12 19c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                </svg>
                Generate Speech
              </>
            )}
          </button>
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Current Clip Player */}
        {currentClip && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Now Playing</h2>
            <AudioPlayer audioBuffer={currentClip} />
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <section className="space-y-4 pt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Clips</h2>
              <button 
                onClick={clearHistory}
                className="text-xs text-slate-600 hover:text-slate-400"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-3">
              {history.map((clip) => (
                <div 
                  key={clip.id}
                  className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-700 transition-colors"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-slate-200 text-sm truncate">{clip.text}</p>
                    <div className="flex gap-3 mt-1 text-[10px] text-slate-500 font-medium">
                      <span>{clip.voice}</span>
                      <span>•</span>
                      <span>{new Date(clip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadClip(clip)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-500 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 sm:opacity-0 group-hover:opacity-100"
                      title="Download"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentClip(clip.audioBuffer)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all border border-slate-700 group-hover:border-blue-500"
                      title="Load and Play"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
