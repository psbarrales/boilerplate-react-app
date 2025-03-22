import { IPost } from "@domain/models/entities/IPost";

export const usePostClient = () => {
  const fetchPosts = async (): Promise<Array<IPost>> => {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts"
    );
    return await response.json();
  };

  return {
    fetchPosts,
  };
};
