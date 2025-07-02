import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  addComment,
  createPost,
  deletePost,
  getPosts,
  toggleDislikeButton,
  toggleLikeButton,
} from "../controllers/PostController.js";

const postRoutes = Router();

postRoutes.use((req, res, next) => {
  console.log(` incomming request : ${req.method} ${req.originalUrl}`);
  next();
});

postRoutes.post("/create-post", verifyToken, createPost);
postRoutes.get("/get-all-post", verifyToken, getPosts);
postRoutes.post("/:postId/like", verifyToken, toggleLikeButton);
postRoutes.post("/:postId/dislike", verifyToken, toggleDislikeButton);
postRoutes.post("/:postId/comment", verifyToken, addComment);
postRoutes.delete("/:postId", verifyToken, deletePost);

export default postRoutes;
