import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import postRoutes from "./routes/PostRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 6000;
const databaseURL = process.env.DATABASE_URL;

console.log("CORS Allowed Origin:", process.env.ORIGIN);

app.use(
  cors({
    origin: process.env.ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/posts", postRoutes);

const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
setupSocket(server);

mongoose
  .connect(databaseURL)
  .then(() => console.log("DB connection successfull .. "))
  .catch((err) => console.log(err.message));
