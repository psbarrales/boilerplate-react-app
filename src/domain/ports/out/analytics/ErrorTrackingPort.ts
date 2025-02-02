export interface ErrorTrackingPort {
    log(message: string): Promise<void>;
    recordError(message: string): Promise<void>;
    crash(message: string): Promise<void>
}
