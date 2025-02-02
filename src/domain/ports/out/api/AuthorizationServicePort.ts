import { IJwt } from "@domain/models/entities/IJwt"

export interface AuthorizationServicePort {
    registerInvite(): Promise<IJwt>
    registerEmail(email: string): Promise<any>
    checkCode(code: string, email: string): Promise<IJwt>
    login(user: string, pass: string): Promise<any>
    logout(): Promise<void>
}
