import { createProvider } from './createProvider';
import { usePostClient } from '@infrastructure/clients/usePostQueryClient';
import { usePostUseCase } from '@application/posts/usePostUseCase';

export const {
    Provider: PostProvider,
    useProvider: usePost,
    withProvider: withPost,
} = createProvider('post', () => {
    const postClient = usePostClient();
    return usePostUseCase(postClient);
}, 'usePost debe ser usado dentro de un PostProvider');

export default PostProvider;
