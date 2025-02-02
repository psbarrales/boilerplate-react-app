export interface AppPort {
    getInfo(): Promise<any>
    getState(): Promise<any>
    minimizeApp(): Promise<void>
    exitApp(): Promise<void>
}
