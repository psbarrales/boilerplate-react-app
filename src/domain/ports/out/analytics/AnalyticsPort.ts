export interface AnalyticsPort {
    setUserId(userId: string): Promise<void>;
    setUserProperty(propertyName: string, value: string): Promise<void>;
    registerAction(action: string, view: string, params?: { [key: string]: string }): void;
    registerView(view: string, params?: { [key: string]: string }): void;
}
