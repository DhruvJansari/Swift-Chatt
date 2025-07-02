import Post from "../models/PostModel.js";

export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Post content cannot be empty." });
    }

    const newPost = new Post({ userId, content, likes: [], dislikes: [] });
    const savedPost = await newPost.save();

    res.status(200).json(savedPost);
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "firstName lastName email image color likes dislikes")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getPosts:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

// export const toggleLikeButton = async (req, res) => {
//   try {
//     const { postId } = req.params;
//     const userId = req.userId?.toString();

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized: User not found." });
//     }

//     const post = await Post.findById(postId).populate(
//       "userId",
//       "firstName lastName email image color"
//     );

//     if (!post) {
//       return res.status(404).json({ message: "Post not found." });
//     }

//     const hasLiked = post.likes.some((id) => id.toString() === userId);
//     const hasDisliked = post.dislikes.some((id) => id.toString() === userId);

//     if (hasLiked) {
//       post.likes = post.likes.filter((id) => id.toString() !== userId);
//     } else {
//       post.likes.push(userId);
//       if (hasDisliked) {
//         post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
//       }
//     }

//     post.markModified("likes");
//     post.markModified("dislikes");
//     await post.save();

//     res.status(200).json(post);
//   } catch (err) {
//     console.error("Error in toggleLikeButton:", err);
//     res.status(500).json({ message: "Internal Server Error." });
//   }
// };

export const toggleLikeButton = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId?.toString();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    const post = await Post.findById(postId).populate("userId");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.likes = post.likes.filter((id) => id);
    post.dislikes = post.dislikes.filter((id) => id);

    console.log("post =>", post);
    const hasLiked = post.likes.some((id) => id.toString() === userId);
    const hasDisliked = post.dislikes.some((id) => id.toString() === userId);

    console.log("hasliked => ", hasLiked);
    console.log("hasdisliked => ", hasDisliked);

    if (hasLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
      if (hasDisliked) {
        post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Error in toggleLikeButton:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const toggleDislikeButton = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId?.toString();

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found." });
    }

    const post = await Post.findById(postId).populate("userId");

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }
    console.log("****************");
    console.log("UserID=>", userId);
    console.log("post=>>>", post);
    console.log("****************");

    post.likes = post.likes.filter((id) => id);
    post.dislikes = post.dislikes.filter((id) => id);

    const hasLiked = post.likes.some((id) => id.toString() === userId);
    const hasDisliked = post.dislikes.some((id) => id.toString() === userId);

    console.log("hasDisliked", hasDisliked);

    if (hasDisliked) {
      post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
    } else {
      post.dislikes.push(userId);
      if (hasLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
      }
    }

    await post.save();

    res.status(200).json(post);
  } catch (err) {
    console.error("Error in toggleDislikeButton:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    console.log(text);
    console.log(userId);
    console.log(postId);
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment cannot be empty." });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    post.comments.push({ userId, text });
    await post.save();

    res.status(200).json(post.comments);
  } catch (err) {
    console.error("Error in addComment:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};

export const deletePost = async (req, res) => {
  try {
    console.log("hear");
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (post.userId.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    console.error("Error in deletePost:", err);
    res.status(500).json({ message: "Internal Server Error." });
  }
};
