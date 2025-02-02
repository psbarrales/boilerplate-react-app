import { RemoteConfigPort } from "@domain/ports/out/app/RemoteConfigPort";
import { useEffect, useRef } from "react";

// Mock initialize function
const initialize = () => {
    return {}; // Mock FirebaseApp
};

// Mock fetchAndActivate function
const fetchAndActivate = async () => {
    return Promise.resolve();
};

// Mock getRemoteConfig function
const getRemoteConfig = () => {
    return {}; // Mock RemoteConfig
};

// Mock getValueFromFirebase function
const getValueFromFirebase = () => {
    return {
        asString: () => JSON.stringify({ key1: "value1", key2: "value2" }) // Mock remote config values
    };
};

export const useFirebaseRemoteConfigAdapter = (): RemoteConfigPort => {
    const appRef = useRef<any | null>(null);
    const remoteConfigRef = useRef<any | null>(null);
    const isInitializedRef = useRef(false);
    const configRef = useRef<Record<string, any>>({});

    // Initialization of Firebase App and Remote Config
    useEffect(() => {
        appRef.current = initialize();

        if (appRef.current) {
            remoteConfigRef.current = getRemoteConfig();
            fetchAndActivate()
                .then(() => {
                    isInitializedRef.current = true;
                    const remoteConfigValue = getValueFromFirebase();
                    configRef.current = JSON.parse(remoteConfigValue.asString());
                    console.debug('Remote config values fetched and activated');
                })
                .catch((err) => {
                    console.error('Error fetching remote config values', err);
                });
        }
    }, []);

    // Methods to interact with remote config
    const getAll = () => {
        if (!isInitializedRef.current) {
            console.warn('RemoteConfig is not initialized yet. Waiting...', remoteConfigRef.current);
            throw new Error('RemoteConfig is not initialized yet. Waiting...');
        }
        return configRef.current;
    };

    const getValue = (key: string): any => {
        if (!isInitializedRef.current) {
            console.warn('RemoteConfig is not initialized yet. Waiting...', remoteConfigRef.current);
            throw new Error('RemoteConfig is not initialized yet. Waiting...');
        }
        return configRef.current[key];
    };

    const getNumber = (key: string, defaultValue?: number): number => {
        let raw: string | undefined;
        try {
            raw = getValue(key);
        } catch (error) {
            raw = defaultValue?.toString();
        }

        if (raw) {
            return Number(raw);
        }

        if (typeof defaultValue !== 'undefined') {
            return defaultValue;
        }

        throw new Error(`Remote Config: key ${key} not found`);
    };

    const getBoolean = (key: string, defaultValue?: boolean): boolean => {
        let raw: string | undefined;
        try {
            raw = getValue(key);
        } catch (error) {
            raw = defaultValue?.toString();
        }

        if (raw && ['true', 'false'].includes(raw)) {
            return raw === 'true';
        }

        if (typeof defaultValue !== 'undefined') {
            return defaultValue;
        }

        throw new Error(`Remote Config: key ${key} not found`);
    };

    return {
        getAll,
        getBoolean,
        getNumber,
        getValue,
    };
};
