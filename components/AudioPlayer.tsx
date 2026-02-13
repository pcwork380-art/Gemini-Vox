
import React, { useState, useEffect, useRef } from 'react';
import { speechService } from '../services/geminiService';
import { audioBufferToWav } from '../utils/audioUtils';

interface AudioPlayerProps {
  audioBuffer: AudioBuffer | null;
  onEnd?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBuffer, onEnd }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const stopAudio = () => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = () => {
    if (!audioBuffer) return;

    const ctx = speechService.getAudioContext();
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();

    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.onended = () => {
      setIsPlaying(false);
      if (onEnd) onEnd();
    };

    source.start(0);
    sourceRef.current = source;
    gainNodeRef.current = gainNode;
    setIsPlaying(true);
  };

  const downloadAudio = () => {
    if (!audioBuffer) return;
    const wavBlob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-vox-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    return () => stopAudio();
  }, []);

  if (!audioBuffer) return null;

  return (
    <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl">
      <button
        onClick={isPlaying ? stopAudio : playAudio}
        className="w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex-shrink-0"
        title={isPlaying ? "Stop" : "Play"}
      >
        {isPlaying ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-400 mb-1">Generated Audio</div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          {isPlaying && (
            <div className="h-full bg-blue-500 animate-[progress_1s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-xs text-slate-500 font-mono hidden sm:block">
          {audioBuffer.duration.toFixed(1)}s
        </div>
        
        <button
          onClick={downloadAudio}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-700"
          title="Download WAV"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
