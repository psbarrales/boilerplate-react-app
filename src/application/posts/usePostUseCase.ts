export const usePostUseCase = (queryClient: { usePosts: any }) => {
    return {
        usePosts: queryClient.usePosts,
    };
};
