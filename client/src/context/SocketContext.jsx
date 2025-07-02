import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { io } from "socket.io-client";
import { createContext, useContext, useRef, useEffect } from "react";
import { toast } from "sonner";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef(null);
  const {
    userInfo,
    addPost,
    toggleLikeButton,
    toggleDislikeButton,
    addComment,
  } = useAppStore();

  useEffect(() => {
    if (!userInfo) return;

    // Initialize socket connection
    socket.current = io(HOST, {
      withCredentials: true,
      query: { userId: userInfo.id },
    });

    socket.current.on("connect", () => {
      console.log("Connected to socket server");
    });

    // Event handlers
    const handleReceiveMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        addContactsInDMContacts,
      } = useAppStore.getState();

      if (
        selectedChatType !== undefined &&
        (selectedChatData._id === message.sender._id ||
          selectedChatData._id === message.recipient._id)
      ) {
        console.log("Message received", message);
        addMessage(message);
      }
      toast.info(`📨 New message from ${message.sender.firstName || "a user"}`);
      addContactsInDMContacts(message);
    };

    const handleReceiveChannelMessage = (message) => {
      const {
        selectedChatData,
        selectedChatType,
        addMessage,
        addChannelInChannelList,
      } = useAppStore.getState();

      if (
        selectedChatType !== undefined &&
        selectedChatData._id === message.channelId
      ) {
        addMessage(message);
      }
      if (message.sender !== userInfo.id) {
        toast.info(`📢 New message in a channel`);
      }
      addChannelInChannelList(message);
    };

    const handleNewPost = (post) => {
      console.log("New post received: ", post);
      toast.info(`new post added`);

      addPost({
        ...post,
        userId: {
          ...post.userId,
          image: post.userId.image || "",
          firstName: post.userId.firstName || "Unknown",
          lastName: post.userId.lastName || "",
        },
        likes: post.likes || [],
        dislikes: post.dislikes || [],
        comments: post.comments || [],
      });
    };

    const handleToggleLike = ({ postId, likes }) => {
      console.log("Post like updated: ", postId, likes);
      toggleLikeButton(postId, likes);
    };

    const handleToggleDislike = ({ postId, dislikes }) => {
      console.log("Post dislike updated: ", postId, dislikes);
      toggleDislikeButton(postId, dislikes);
    };

    const deletedPost = ({ postId }) => {
      const { removePost } = useAppStore.getState();
      console.log("Post deleted successfully.", postId);
      removePost(postId);
    };

    // const handleNewComment = ({ postId, comment }) => {
    //   console.log("New comment received:", comment);
    //   addComment(postId, comment);
    // };

    // Register socket event listeners
    socket.current.on("added-new-post", handleNewPost);
    socket.current.on("toggleLike", handleToggleLike);
    socket.current.on("toggleDislike", handleToggleDislike);
    // socket.current.on("added-new-comment", handleNewComment);
    socket.current.on("receiveMessage", handleReceiveMessage);
    socket.current.on("receive-channel-message", handleReceiveChannelMessage);
    socket.current.on("postDeleted", deletedPost);

    // Cleanup on unmount or dependency change
    return () => {
      if (socket.current) {
        socket.current.off("added-new-post", handleNewPost);
        socket.current.off("toggleLike", handleToggleLike);
        socket.current.off("toggleDislike", handleToggleDislike);
        // socket.current.off("added-new-comment", handleNewComment);
        socket.current.off("receiveMessage", handleReceiveMessage);
        socket.current.off(
          "receive-channel-message",
          handleReceiveChannelMessage
        );
        socket.current.disconnect();
      }
    };
  }, [userInfo, addPost, toggleLikeButton, toggleDislikeButton, addComment]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
