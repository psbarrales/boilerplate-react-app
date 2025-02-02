export interface PreferencesStoragePort {
    get(key: string): Promise<any>
    remove(key: string): Promise<any>
    set(key: string, value: string): Promise<any>
}
