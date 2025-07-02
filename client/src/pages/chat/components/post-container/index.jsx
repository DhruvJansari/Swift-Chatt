import PostBar from "../chat-container/components/post-bar";
import PostHeader from "../chat-container/components/post-header";
import Post from "../chat-container/components/posts";

const PostContainer = () => {
  return (
    <div className=" fixed top-0 h-[100vh] w-[100vw] bg-[#1c1d25] flex flex-col md:static md:flex-1">
      <PostHeader />
      <Post />
      <PostBar />
    </div>
  );
};

export default PostContainer;
