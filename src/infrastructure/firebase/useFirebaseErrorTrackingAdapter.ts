import { ErrorTrackingPort } from "@domain/ports/out/analytics/ErrorTrackingPort";

const MockFirebaseCrashlytics = {
    log: async ({ message }: { message: string }) => {
        console.log(`Log: ${message}`);
    },
    recordException: async ({ message }: { message: string }) => {
        console.error(`Record Exception: ${message}`);
    },
    crash: async ({ message }: { message: string }) => {
        console.error(`Crash: ${message}`);
        throw new Error(message);
    }
};

export const useFirebaseErrorTrackingAdapter = (): ErrorTrackingPort => {
    return {
        async log(message: string): Promise<void> {
            await MockFirebaseCrashlytics.log({ message });
        },
        async recordError(message: string): Promise<void> {
            await MockFirebaseCrashlytics.recordException({ message });
        },
        async crash(message: string): Promise<void> {
            await MockFirebaseCrashlytics.crash({ message });
        }
    }
}
