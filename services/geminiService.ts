
import { GoogleGenAI, Modality } from "@google/genai";
import { GenerateParams, VoiceName } from "../types";
import { decodeBase64, decodeAudioData } from "../utils/audioUtils";

export class GeminiSpeechService {
  private ai: GoogleGenAI;
  private audioContext: AudioContext;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000
    });
  }

  async generateSpeech(params: GenerateParams): Promise<AudioBuffer> {
    const { text, voice, mood } = params;
    
    // Voice mapping logic: 
    // Adam is now mapped to 'Charon', the deepest and most authoritative male voice available.
    const apiVoice = voice === VoiceName.Adam ? 'Charon' : voice;

    // Define the persona to ensure the model produces the correct gender and timbre
    const personaHint = voice === VoiceName.Adam 
      ? "As a man with a deep, strong masculine voice" 
      : "As a narrator";

    let prompt = text;
    if (mood === 'ghost story') {
      prompt = `${personaHint}, narrate this as a haunting ghost story. Use dramatic pauses, a chilling atmosphere, and a slow, suspenseful pace: ${text}`;
    } else if (mood && mood !== 'natural') {
      prompt = `${personaHint}, say this with a ${mood} tone: ${text}`;
    } else {
      prompt = `${personaHint}, say: ${text}`;
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: apiVoice as any },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    
    if (!candidate) {
      throw new Error("The model did not return any content. Check your connection or API key.");
    }

    if (candidate.finishReason === 'SAFETY') {
      throw new Error("This text was flagged by safety filters. Please try a different story.");
    }

    // Robust extraction: Iterate through all parts to find the audio data (inlineData)
    // This fixes the "No audio data" error if the model includes text preamble.
    const audioPart = candidate.content?.parts.find(p => !!p.inlineData);
    const base64Audio = audioPart?.inlineData?.data;
    
    if (!base64Audio) {
      // Fallback: check if the model just returned text
      const textPart = candidate.content?.parts.find(p => !!p.text);
      if (textPart) {
        throw new Error(`The AI provided a text response instead of speech. Try simpler text.`);
      }
      throw new Error("Speech synthesis failed: No audio data was generated.");
    }

    const audioBytes = decodeBase64(base64Audio);
    return await decodeAudioData(audioBytes, this.audioContext, 24000, 1);
  }

  getAudioContext() {
    return this.audioContext;
  }
}

export const speechService = new GeminiSpeechService();
