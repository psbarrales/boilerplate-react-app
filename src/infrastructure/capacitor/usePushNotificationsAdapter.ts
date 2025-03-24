import { PushNotificationsPort } from "@domain/ports/out/device/PushNotificationsPort";

export const useCapacitorPushNotificationsAdapter = (): PushNotificationsPort => {
    const checkPermissions = async (): Promise<boolean> => {
        // Check if the browser supports notifications
        if (!('Notification' in window)) {
            console.warn('This browser does not support desktop notifications');
            return false;
        }

        // Check the current permission state
        if (Notification.permission === 'granted') {
            console.info('Notification permission already granted');
            return true;
        }

        // If permission is not determined, request it
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            console.info('Notification permission request sent');
            return permission === 'granted';
        }

        return false;
    };

    return {
        checkPermissions,
    };
};
