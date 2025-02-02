import { PreferencesStoragePort } from '@domain/ports/out/app/PreferencesStoragePort';

export const useCapacitorPreferencesStorageAdapter = (): PreferencesStoragePort => {
    return {
        async set(key: string, value: string): Promise<any> {
            localStorage.setItem(key, value);
            return Promise.resolve();
        },
        async get(key: string) {
            const value = localStorage.getItem(key);
            return Promise.resolve(value);
        },
        async remove(key: string) {
            localStorage.removeItem(key);
            return Promise.resolve();
        }
    }
}
