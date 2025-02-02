import { PushNotificationsPort } from "@domain/ports/out/device/PushNotificationsPort";

export const useCapacitorPushNotificationsAdapter =
    (): PushNotificationsPort => {
        return {
            checkPermissions: async () => {
                return true; // or 'denied' based on your test case
            },
        };
    };
