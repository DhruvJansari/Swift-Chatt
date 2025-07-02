import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessagesModel.js";
import Channel from "./models/ChannelModel.js";
import Post from "./models/PostModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      const createdMessage = await Message.create(message);

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const sendChannelMessage = async (message) => {
    try {
      const { channelId, sender, recipient, content, messageType, fileUrl } =
        message;

      const createdMessage = await Message.create({
        sender,
        recipient: null,
        content,
        messageType,
        timestamp: new Date(),
        fileUrl,
      });

      const messageData = await Message.findById(createdMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .exec();

      await Channel.findByIdAndUpdate(channelId, {
        $push: { messages: createdMessage._id },
      });

      const channel = await Channel.findById(channelId).populate("members");

      const finalData = { ...messageData._doc, channelId: channel._id };

      if (channel && channel.members) {
        channel.members.forEach((member) => {
          const memberSocketId = userSocketMap.get(member._id.toString());
          if (memberSocketId) {
            io.to(memberSocketId).emit("receive-channel-message", finalData);
          }
        });
        const adminSocketId = userSocketMap.get(channel.admin._id.toString());
        if (adminSocketId) {
          io.to(adminSocketId).emit("receive-channel-message", finalData);
        }
      }
    } catch (error) {
      console.error("Error sending channel message:", error);
    }
  };

  const createPost = async (post) => {
    try {
      const newPost = await Post.create(post);
      const populatedPost = await Post.findById(newPost._id).populate(
        "userId",
        "firstName lastName email image "
      );
      io.emit("added-new-post", populatedPost);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const toggleLike = async ({ postId, userId }) => {
    try {
      const post = await Post.findById(postId);
      if (!post) return;

      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);

      const likeIndex = post.likes.indexOf(userId);
      if (likeIndex === -1) {
        post.likes.push(userId);
      } else {
        post.likes.splice(likeIndex, 1);
      }

      await post.save();

      const updatedPost = await Post.findById(postId).populate(
        "likes",
        "firstName lastName email image"
      );
      io.emit("toggleLike", { postId, likes: updatedPost.likes });
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const toggleDislike = async ({ postId, userId }) => {
    try {
      const post = await Post.findById(postId);
      if (!post) return;

      post.likes = post.likes.filter((id) => id.toString() !== userId);

      const dislikeIndex = post.dislikes.indexOf(userId);
      if (dislikeIndex === -1) {
        post.dislikes.push(userId);
      } else {
        post.dislikes.splice(dislikeIndex, 1);
      }

      await post.save();

      const updatedPost = await Post.findById(postId).populate(
        "dislikes",
        "firstName lastName email image"
      );
      io.emit("toggleDislike", { postId, dislikes: updatedPost.dislikes });
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  };

  const deletePost = async ({ postId }, callback) => {
    try {
      const post = await Post.findById(postId);
      if (!post) {
        return callback({ success: false, message: "Post not found" });
      }

      await Post.findOneAndDelete(postId);

      io.emit("postDeleted", { postId });
      callback({ success: true, message: "Post deleted successfully" });
    } catch (error) {
      console.error("Error toggling dislike:", error);
    }
  };
  // const addComment = async ({ postId, text, userId }) => {
  //   try {
  //     const post = await Post.findById(postId);
  //     if (!post) return;

  //     const newComment = { userId, text, timestamp: new Date() };
  //     post.comments.push(newComment);
  //     await post.save();

  //     io.emit("updateComments", { postId, comment: newComment });
  //   } catch (error) {
  //     console.error("Error adding comment:", error);
  //   }
  // };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", sendChannelMessage);
    socket.on("newPost", createPost);
    socket.on("toggleLike", toggleLike);
    socket.on("toggleDislike", toggleDislike);
    // socket.on("newComment", addComment);
    socket.on("deletePost", deletePost);

    socket.on("disconnect", () => disconnect(socket));
  });
};

export default setupSocket;
