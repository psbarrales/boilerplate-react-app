// Mock implementation of the App object
const MockApp = {
    getInfo: async () => ({ name: 'MockApp', version: '1.0.0' }),
    getState: async () => ({ isActive: true }),
    minimizeApp: async () => console.warn('App minimized'),
    exitApp: async () => console.warn('App exited')
};

import { AppPort } from '@domain/ports/out/app/AppPort';

export const useAppAdapter = (): AppPort => MockApp;
