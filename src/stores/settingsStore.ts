import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OddsFormat = 'DECIMAL' | 'FRACTIONAL' | 'AMERICAN';
export type InferenceProvider = 'gemini' | 'local_api' | 'web_llm';

interface SettingsStore {
  oddsFormat: OddsFormat;
  setOddsFormat: (format: OddsFormat) => void;
  theme: 'dark' | 'amoled';
  setTheme: (theme: 'dark' | 'amoled') => void;
  inferenceProvider: InferenceProvider;
  setInferenceProvider: (provider: InferenceProvider) => void;
  localApiUrl: string;
  setLocalApiUrl: (url: string) => void;
  webLlmModel: string;
  setWebLlmModel: (model: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      oddsFormat: 'DECIMAL',
      setOddsFormat: (format) => set({ oddsFormat: format }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      inferenceProvider: 'gemini',
      setInferenceProvider: (provider) => set({ inferenceProvider: provider }),
      localApiUrl: 'http://127.0.0.1:8000/v1',
      setLocalApiUrl: (url) => set({ localApiUrl: url }),
      webLlmModel: 'gemma-2b-it-q4f16_1-MLC',
      setWebLlmModel: (model) => set({ webLlmModel: model }),
    }),
    { name: 'settings-store' }
  )
);
