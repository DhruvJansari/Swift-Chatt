import { create } from "zustand";
import { createAuthSlice } from "./slice/auth-slice";
import { createChatSlice } from "./slice/chat-slice";
import { createPostSlice } from "./slice/post-slice";

export const useAppStore = create()((...a) => ({
  ...createAuthSlice(...a),
  ...createChatSlice(...a),
  ...createPostSlice(...a),
}));
