/**
 * STRATOS.AI - Secure Storage Wrapper
 * Handles web (localStorage) and native (EncryptedStorage) environments.
 */

// Mocking EncryptedStorage for web environment
const EncryptedStorage = {
    setItem: async (key: string, value: string) => {
        localStorage.setItem(key, value);
    },
    getItem: async (key: string) => {
        return localStorage.getItem(key);
    },
    removeItem: async (key: string) => {
        localStorage.removeItem(key);
    },
    clear: async () => {
        localStorage.clear();
    }
};

export const setSecureItem = async (key: string, value: string) => {
    try {
        await EncryptedStorage.setItem(key, value);
    } catch (error) {
        console.error('Secure storage error:', error);
    }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
    try {
        return await EncryptedStorage.getItem(key);
    } catch (error) {
        console.error('Secure storage error:', error);
        return null;
    }
};

export const removeSecureItem = async (key: string) => {
    try {
        await EncryptedStorage.removeItem(key);
    } catch (error) {
        console.error('Secure storage error:', error);
    }
};
