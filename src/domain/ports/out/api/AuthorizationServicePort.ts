import { IJwt } from "@domain/models/entities/IJwt";

export interface AuthorizationServicePort {
    login(user: string, pass: string): Promise<IJwt>;
    logout(): Promise<void>;
}
