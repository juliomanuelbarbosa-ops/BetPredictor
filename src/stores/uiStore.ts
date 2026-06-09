import { create } from 'zustand';

interface UIState {
    isLoading: boolean;
    loadingStep: string;
    toast: { message: string, type: 'success' | 'error' | 'info' } | null;
    globalError: string | null;

    setIsLoading: (isLoading: boolean) => void;
    setLoadingStep: (loadingStep: string) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    setGlobalError: (error: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
    isLoading: false,
    loadingStep: "",
    toast: null,
    globalError: null,

    setIsLoading: (isLoading) => set({ isLoading }),
    setLoadingStep: (loadingStep) => set({ loadingStep }),
    showToast: (message, type = 'success') => {
        set({ toast: { message, type } });
        setTimeout(() => set({ toast: null }), 3000);
    },
    setGlobalError: (globalError) => set({ globalError })
}));
