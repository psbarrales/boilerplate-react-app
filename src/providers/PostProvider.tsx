import { usePosts } from '@infrastructure/clients/usePostQueryClient';
import { createProvider } from './createProvider';
import { usePostUseCase } from '@application/posts/usePostUseCase';

export const {
    Provider: PostProvider,
    useProvider: usePost,
    withProvider: withPost,
} = createProvider('post', () => {
    return usePostUseCase({ usePosts });
}, 'usePost debe ser usado dentro de PostProvider');

export default PostProvider;
