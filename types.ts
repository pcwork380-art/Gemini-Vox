
export enum VoiceName {
  Kore = 'Kore',
  Puck = 'Puck',
  Charon = 'Charon',
  Zephyr = 'Zephyr',
  Fenrir = 'Fenrir',
  Adam = 'Adam'
}

export interface SpeechClip {
  id: string;
  text: string;
  voice: VoiceName;
  timestamp: number;
  audioBuffer: AudioBuffer;
}

export interface GenerateParams {
  text: string;
  voice: VoiceName;
  mood?: string;
}
