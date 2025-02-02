import { IUser, IUserRole } from "@domain/models/entities/IUser";

export interface IUserPort {
    user?: IUser,
    role?: IUserRole,
    me(): any
}
