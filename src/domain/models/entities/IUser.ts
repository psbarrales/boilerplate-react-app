export interface IUser {
    id: string;
    email: string;
    full_name: string;
    avatar?: string;
}

export type IUserRole = 'INVITED' | 'USER' | 'ADMIN' | 'INVALID'
