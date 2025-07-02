import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  content: { type: String, required: true, maxlength: 500 },
  likes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    default: [],
  },
  dislikes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    default: [],
  },
  comments: {
    type: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

const Post = mongoose.model("Post", PostSchema);

export default Post;
