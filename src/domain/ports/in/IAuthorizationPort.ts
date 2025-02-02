import { IJwtDecode } from "@domain/models/entities/IJwtDecode";

export type FlowType = 'INVITE' | 'EMAIL' | 'GOOGLE' | 'APPLE';

export interface IAuthorizationPort {
    register: (flow: FlowType, param?: any) => Promise<any>
    checkCode: (code: string, email: string) => Promise<any>
    login: (user: string, pass: string) => Promise<void>;
    logout: () => Promise<void>
    isAuthenticated: boolean;
    isReady: boolean;
    token?: string;
    tokenDecoded?: IJwtDecode;
}
