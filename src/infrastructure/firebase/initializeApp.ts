import { getApp, getApps, initializeApp } from "firebase/app"

export const initialize = () => {
    if (!getApps().length) {
        return initializeApp({
            apiKey: import.meta.env.VITE_FIREBASE_ANALYTICS_APIKEY,
            authDomain: import.meta.env.VITE_FIREBASE_ANALYTICS_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_ANALYTICS_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_ANALYTICS_STORAGE_BUCKET,
            messagingSenderId: import.meta.env.VITE_FIREBASE_ANALYTICS_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_ANALYTICS_APP_ID,
            measurementId: import.meta.env.VITE_FIREBASE_ANALYTICS_MEASUREMENT_ID,
        })
    } else {
        return getApp()
    }
}
