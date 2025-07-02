import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useSocket } from "@/context/SocketContext";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { useState } from "react";

const PostCard = ({ post }) => {
  const socket = useSocket();
  const { addComment, updateLike, updateDislike, userInfo } = useAppStore();
  const [comment, setComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  const handleLike = () => {
    if (!socket) {
      console.error("Socket is not connected.");
      return;
    }
    setIsLiking(true);

    socket.emit("toggleLike", { postId: post._id }, (updatedLikes) => {
      setIsLiking(false);
      if (!updatedLikes) {
        console.error("Error: Invalid like response from server");
        return;
      }
      updateLike(post._id, updatedLikes); // Update UI with real-time data
    });
  };

  const handleDislike = () => {
    if (!socket) {
      console.error("Socket is not connected.");
      return;
    }
    setIsDisliking(true);
    socket.emit("toggleDislike", { postId: post._id }, (updatedDislikes) => {
      setIsDisliking(false);
      if (!updatedDislikes) {
        console.error("Error: Invalid dislike response from server");
        return;
      }
      updateDislike(post._id, updatedDislikes); // Update UI with real-time data
    });
  };

  // const handleComment = (e) => {
  //   if (e.key === "Enter" && comment.trim()) {
  //     if (!socket) {
  //       console.error("Socket is not connected.");
  //       return;
  //     }

  //     const newComment = {
  //       postId: post._id,
  //       comment: comment.trim(),
  //     };

  //     socket.emit("newComment", newComment, (serverComment) => {
  //       if (!serverComment) {
  //         console.error("Error: Invalid comment response from server");
  //         return;
  //       }
  //       addComment(post._id, serverComment);
  //     });

  //     setComment("");
  //   }
  // };

  const handleDeletePost = () => {
    if (!socket) {
      console.log("socket is not connected");
    }
    if (!window.confirm("Are you sure you want to delete the post?")) return;

    socket.emit("deletePost", { postId: post._id }, (responce) => {
      if (responce?.success) {
        console.log("post deleted successfully.");
      } else {
        console.log("failed to delete the post.");
      }
    });
  };

  const profileImage = post.userId?.image?.startsWith("http")
    ? post.userId.image
    : `${HOST}/${post.userId.image}`;

  const formattedDate = new Date(post.createdAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  console.log("post : =>", post);
  console.log("userInfo : => ", userInfo);

  return (
    <div className="w-full max-w-6xl bg-[#1c1d25] p-4 rounded-lg shadow-md border border-[#2a2b33] text-white mx-auto relative">
      <div className="flex items-center gap-3 border-b border-[#2f303b] pb-3">
        <Avatar className="h-10 w-10 rounded-full overflow-hidden">
          {post.userId?.image ? (
            <AvatarImage
              src={profileImage}
              alt="profile"
              className="object-cover w-full h-full bg-black rounded-full"
            />
          ) : (
            <div
              className={`uppercase h-10 w-10 text-lg border flex items-center justify-center rounded-full ${getColor(
                post.userId?.color || "defaultColor"
              )}`}
            >
              {post.userId?.firstName?.charAt(0) || "U"}
            </div>
          )}
        </Avatar>
        <div>
          <p className="font-semibold">
            {post.userId?.firstName} {post.userId?.lastName}
          </p>
          {post.userId?._id === userInfo?.id && (
            <button
              onClick={handleDeletePost}
              className=" absolute top-4 right-4 ml-auto text-red-400 hover:text-red-500 text-sm"
            >
              Delete
            </button>
          )}
          <p className="text-xs text-gray-400">{formattedDate}</p>
        </div>
      </div>
      {/* Post Content */}
      <p className="mt-3 text-lg">{post.content}</p>
      {/* Like & Dislike Buttons */}
      <div className="flex items-center justify-between mt-4 border-t border-[#2f303b] pt-3">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-500"
          >
            <FaThumbsUp /> {post.likes?.length ?? 0}
          </button>
          <button
            onClick={handleDislike}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-500"
          >
            <FaThumbsDown /> {post.dislikes?.length ?? 0}
          </button>
        </div>
      </div>
      {/* <div className="mt-3">
        <input
          type="text"
          placeholder="Write a comment..."
          className="w-full p-2 bg-[#2a2b33] rounded-md border border-[#3a3b45] text-white focus:outline-none focus:ring-1 focus:ring-[#8417ff]"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={handleComment}
        />
      </div> */}
    </div>
  );
};

export default PostCard;
