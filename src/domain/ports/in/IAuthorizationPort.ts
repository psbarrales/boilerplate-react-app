import { IJwtDecode } from "@domain/models/entities/IJwtDecode";

export interface IAuthorizationPort {
    login: (user: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isReady: boolean;
    token?: string;
    tokenDecoded?: IJwtDecode;
}
