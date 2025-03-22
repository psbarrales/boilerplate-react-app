import { IPost } from "@domain/models/entities/IPost";

export interface PostServicePort {
    posts(): IPost[] | undefined;
}
