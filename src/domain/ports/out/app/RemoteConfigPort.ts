export interface RemoteConfigPort {
    getValue(key: string): string
    getBoolean(key: string, defaultValue?: boolean): boolean
    getNumber(key: string, defaultValue?: number): number
    getAll(): any
}
