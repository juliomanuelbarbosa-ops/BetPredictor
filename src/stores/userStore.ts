import { create } from 'zustand';
import { User } from 'firebase/auth';
import { doc, updateDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface UserState {
    user: User | null;
    isAuthReady: boolean;
    loading: boolean;
    bankroll: number;
    currency: string;
    totalCorrect: number;
    totalGames: number;
    role: 'user' | 'admin';
    theme: 'dark' | 'amoled';
    
    setUser: (user: User | null) => void;
    setAuthReady: (ready: boolean) => void;
    setLoading: (loading: boolean) => void;
    setUserData: (data: Partial<UserState>) => void;
    updateBankroll: (amount: number | ((prev: number) => number)) => Promise<void>;
    updateProfile: (data: Partial<UserState>) => Promise<void>;
    resolveForecast: (won: boolean, stake: number, odds: number) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    isAuthReady: false,
    loading: true,
    bankroll: 1000,
    currency: 'USD',
    totalCorrect: 0,
    totalGames: 0,
    role: 'user',
    theme: 'dark',

    setUser: (user) => set({ user }),
    setAuthReady: (isAuthReady) => set({ isAuthReady, loading: false }),
    setLoading: (loading) => set({ loading }),
    setUserData: (data) => set(data),
    
    updateBankroll: async (amount) => {
        const { user, bankroll } = get();
        if (!user) return;
        
        const newBankroll = typeof amount === 'function' ? amount(bankroll) : amount;
        set({ bankroll: newBankroll });
        
        try {
            await updateDoc(doc(db, 'users', user.uid), { bankroll: newBankroll });
            
            await addDoc(collection(db, 'bankroll_history'), {
                userId: user.uid,
                amount: newBankroll,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.warn("Failed to sync bankroll with Firebase, using local state", error);
        }
    },

    resolveForecast: async (won, stake, odds) => {
        const { user, bankroll, totalCorrect, totalGames } = get();
        if (!user) return;

        // When placing a bet, stake is already deducted.
        // If won, we add back the stake + profit (stake * odds).
        // If lost, we don't add anything back (stake is already gone).
        const newBankroll = won ? bankroll + (stake * odds) : bankroll;
        const newTotalCorrect = won ? totalCorrect + 1 : totalCorrect;
        const newTotalGames = totalGames + 1;

        set({ 
            bankroll: newBankroll,
            totalCorrect: newTotalCorrect,
            totalGames: newTotalGames
        });

        try {
            await updateDoc(doc(db, 'users', user.uid), { 
                bankroll: newBankroll,
                totalCorrect: newTotalCorrect,
                totalGames: newTotalGames
            });

            await addDoc(collection(db, 'bankroll_history'), {
                userId: user.uid,
                amount: newBankroll,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.warn("Failed to sync forecast stats with Firebase, using local state", error);
        }
    },

    updateProfile: async (data) => {
        const { user } = get();
        if (!user) return;
        set(data);
        try {
            await updateDoc(doc(db, 'users', user.uid), data);
        } catch (error) {
            console.warn("Failed to sync profile with Firebase, using local state", error);
        }
    }
}));
