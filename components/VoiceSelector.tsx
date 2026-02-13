
import React from 'react';
import { VoiceName } from '../types';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onVoiceChange: (voice: VoiceName) => void;
  selectedMood: string;
  onMoodChange: (mood: string) => void;
}

const VOICES = [
  { id: VoiceName.Adam, name: 'Adam', desc: 'Deep, Masculine & Narrative' },
  { id: VoiceName.Kore, name: 'Kore', desc: 'Warm & Professional' },
  { id: VoiceName.Puck, name: 'Puck', desc: 'Energetic & Youthful' },
  { id: VoiceName.Charon, name: 'Charon', desc: 'Deep & Authoritative' },
  { id: VoiceName.Zephyr, name: 'Zephyr', desc: 'Calm & Soothing' },
  { id: VoiceName.Fenrir, name: 'Fenrir', desc: 'Strong & Narrative' },
];

const MOODS = [
  'natural', 'cheerful', 'serious', 'whispering', 'excited', 'sad', 'angry', 'ghost story'
];

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({ 
  selectedVoice, 
  onVoiceChange,
  selectedMood,
  onMoodChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-3">Choose Voice</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onVoiceChange(voice.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                selectedVoice === voice.id 
                  ? 'border-blue-500 bg-blue-500/10' 
                  : 'border-slate-800 bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-100">{voice.name}</div>
              <div className="text-xs text-slate-400">{voice.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-3">Speech Tone</label>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood}
              onClick={() => onMoodChange(mood)}
              className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${
                selectedMood === mood
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
