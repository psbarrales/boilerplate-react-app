export interface PushNotificationsPort {
    checkPermissions(): Promise<boolean>
}
