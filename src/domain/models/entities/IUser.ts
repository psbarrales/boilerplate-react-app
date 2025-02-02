export interface IUser {
    id: string;
    full_name: string;
    email: string;
    last_name?: string;
    avatar?: string;
    phone?: string;
    gender?: string;
    birthday?: Date;
    meta_data?: Record<string, any>;
    permissions?: Record<string, unknown>;
}

export type IUserRole = 'INVITED' | 'USER' | 'ADMIN' | 'INVALID'
