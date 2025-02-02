import { IUser } from "@domain/models/entities/IUser";

export interface UserServicePort {
    me(): Promise<IUser>;
}
