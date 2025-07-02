import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { useEffect, useRef } from "react";
import PostCard from "../../../post-card";
import { GET_ALL_POST_ROUTES } from "@/utils/constants";

const Post = () => {
  const topref = useRef();
  const { setPosts, posts } = useAppStore();

  // Fetch posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await apiClient.get(GET_ALL_POST_ROUTES, {
          withCredentials: true,
        });
        setPosts(response.data);
      } catch (error) {
        console.error(
          "Failed to fetch posts:",
          error.response ? error.response.data : error.message
        );
      }
    };

    fetchPosts();
  }, [setPosts]); // Dependency ensures `setPosts` is stable

  // Scroll to the bottom when posts change
  useEffect(() => {
    if (topref.current) {
      topref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [posts.length]); // Runs whenever the number of posts changes

  return (
    <div className="flex flex-col h-[90vh] overflow-y-auto space-y-4 px-4 pb-20">
      <div ref={topref} />
      {posts.length > 0 ? (
        posts.map((post) => <PostCard key={post._id} post={post} />)
      ) : (
        <p className="text-center text-gray-400">No posts available.</p>
      )}
    </div>
  );
};

export default Post;
