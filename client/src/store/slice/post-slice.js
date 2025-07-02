import { apiClient } from "@/lib/api-client";
import { TOGGLE_DISLIKE_ROUTES, TOGGLE_LIKE_ROUTES } from "@/utils/constants";

export const createPostSlice = (set, get) => ({
  posts: [],

  setPosts: (posts) => set({ posts }),

  addPost: (newPost) => {
    set((state) => ({ posts: [newPost, ...state.posts] }));
  },

  toggleLikeButton: async (postId) => {
    try {
      const response = await apiClient.post(
        TOGGLE_LIKE_ROUTES.replace(":postId", postId),
        {},
        { withCredentials: true }
      );
      const updatedPost = response.data;

      get().updateLike(postId, updatedPost.likes);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  },

  toggleDislikeButton: async (postId) => {
    try {
      const response = await apiClient.post(
        TOGGLE_DISLIKE_ROUTES.replace(":postId", postId),
        {},
        { withCredentials: true }
      );
      const updatedPost = response.data;

      get().updateDislike(postId, updatedPost.dislikes);
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  },

  // addComment: (postId, newComment) => {
  //   set((state) => ({
  //     posts: state.posts.map((post) =>
  //       post._id === postId
  //         ? {
  //             ...post,
  //             comments: post.comments
  //               ? [...post.comments, newComment]
  //               : [newComment],
  //           }
  //         : post
  //     ),
  //   }));
  // },

  deletePost: async (postId) => {
    try {
      await apiClient.delete(`/api/posts/${postId}`, { withCredentials: true });

      set((state) => ({
        posts: state.posts.filter((post) => post._id !== postId),
      }));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  },

  removePost: (postId) => {
    set((state) => ({
      posts: state.posts.filter((post) => post._id !== postId),
    }));
  },

  updateLike: (postId, likes) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId ? { ...post, likes } : post
      ),
    }));
  },

  updateDislike: (postId, dislikes) => {
    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId ? { ...post, dislikes } : post
      ),
    }));
  },
});
