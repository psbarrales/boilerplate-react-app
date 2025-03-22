import { IPost } from "@domain/models/entities/IPost";
import { useQuery } from "@tanstack/react-query";

export const usePosts = () => {
    const { status, data, error, isFetching } = useQuery({
        queryKey: ["posts"],
        queryFn: async (): Promise<Array<IPost>> => {
            const response = await fetch(
                "https://jsonplaceholder.typicode.com/posts"
            );
            return await response.json();
        },
    });
    return {
        status,
        data,
        error,
        isFetching,
    };
};
// export const usePosts = () => {
