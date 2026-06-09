import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'import.meta.env.VITE_ODDS_API_KEY': JSON.stringify(env.VITE_ODDS_API_KEY || ''),
      'import.meta.env.VITE_BYTEZ_API_KEY': JSON.stringify(env.VITE_BYTEZ_API_KEY || ''),
      'import.meta.env.VITE_OPENWEATHER_KEY': JSON.stringify(env.VITE_OPENWEATHER_KEY || ''),
      'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || ''),
      'import.meta.env.VITE_ANTHROPIC_API_KEY': JSON.stringify(env.VITE_ANTHROPIC_API_KEY || ''),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || ''),
      'import.meta.env.VITE_SPORTMONKS_API_KEY': JSON.stringify(env.VITE_SPORTMONKS_API_KEY || ''),
      'import.meta.env.VITE_API_FOOTBALL_KEY': JSON.stringify(env.VITE_API_FOOTBALL_KEY || ''),
      'import.meta.env.VITE_ACCUWEATHER_API_KEY': JSON.stringify(env.VITE_ACCUWEATHER_API_KEY || ''),
      'import.meta.env.VITE_WEATHERSTACK_API_KEY': JSON.stringify(env.VITE_WEATHERSTACK_API_KEY || ''),
      'import.meta.env.VITE_RAPIDAPI_KEY': JSON.stringify(env.VITE_RAPIDAPI_KEY || ''),
      'import.meta.env.VITE_SPORTRADAR_API_KEY': JSON.stringify(env.VITE_SPORTRADAR_API_KEY || ''),
      'import.meta.env.VITE_PANDASCORE_API_KEY': JSON.stringify(env.VITE_PANDASCORE_API_KEY || ''),
      'import.meta.env.VITE_MISTRAL_API_KEY': JSON.stringify(env.VITE_MISTRAL_API_KEY || ''),
      'import.meta.env.VITE_PERPLEXITY_API_KEY': JSON.stringify(env.VITE_PERPLEXITY_API_KEY || ''),
      'import.meta.env.VITE_GROQ_API_KEY': JSON.stringify(env.VITE_GROQ_API_KEY || ''),
      'import.meta.env.VITE_NEWSAPI_KEY': JSON.stringify(env.VITE_NEWSAPI_KEY || ''),
      'import.meta.env.VITE_X_API_KEY': JSON.stringify(env.VITE_X_API_KEY || ''),
      'import.meta.env.VITE_OPENROUTER_API_KEY': JSON.stringify(env.VITE_OPENROUTER_API_KEY || ''),
      'import.meta.env.VITE_BETSTACK_API_KEY': JSON.stringify(env.VITE_BETSTACK_API_KEY || ''),
      'import.meta.env.VITE_BZZOIRO_ML_TOKEN': JSON.stringify(env.VITE_BZZOIRO_ML_TOKEN || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
