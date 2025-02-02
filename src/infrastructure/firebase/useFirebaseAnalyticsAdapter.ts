import { AnalyticsPort } from "@domain/ports/out/analytics/AnalyticsPort";

// Mock implementation of FirebaseAnalytics
const MockFirebaseAnalytics = {
    initializeFirebase: (config: any) => {
        console.log("Firebase initialized with config:", config);
    },
    setUserId: async ({ userId }: { userId: string }) => {
        console.log("Set user ID:", userId);
    },
    setUserProperty: async ({ name, value }: { name: string, value: string }) => {
        console.log(`Set user property: ${name} = ${value}`);
    },
    logEvent: async ({ name, params }: { name: string, params: { [key: string]: string } }) => {
        console.log(`Logged event: ${name} with params:`, params);
    }
};

export const useFirebaseAnalyticsAdapter = (): AnalyticsPort => {
    try {
        MockFirebaseAnalytics.initializeFirebase({
            apiKey: import.meta.env.VITE_FIREBASE_ANALYTICS_APIKEY,
            authDomain: import.meta.env.VITE_FIREBASE_ANALYTICS_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_ANALYTICS_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_ANALYTICS_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_ANALYTICS_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_ANALYTICS_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_ANALYTICS_MEASUREMENT_ID,
        });
    } catch (e) { }

    return {
        async setUserId(userId: string): Promise<void> {
            await MockFirebaseAnalytics.setUserId({ userId });
        },

        async setUserProperty(propertyName: string, value: string): Promise<void> {
            await MockFirebaseAnalytics.setUserProperty({ name: propertyName, value });
        },

        registerAction(action: string, view: string, params?: { [key: string]: string }): void {
            MockFirebaseAnalytics.logEvent({
                name: action,
                params: {
                    view,
                    ...params,
                },
            });
        },

        registerView(view: string, params?: { [key: string]: string }): void {
            MockFirebaseAnalytics.logEvent({
                name: "view",
                params: {
                    view,
                    ...params,
                },
            });
        }
    }
}
