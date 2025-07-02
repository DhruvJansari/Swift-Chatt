import { useSocket } from "@/context/SocketContext";
import { useAppStore } from "@/store";
import { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import EmojiPicker from "emoji-picker-react";

const PostBar = () => {
  const socket = useSocket();
  const emojiRef = useRef();
  const [postContent, setPostContent] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const { userInfo } = useAppStore();

  if (!userInfo || !userInfo.id) {
    console.error("User Id is missing!");
    return <div className="text-white">Loading user info...</div>;
  }

  // ✅ Properly handle clicks outside the emoji picker
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSendPost = async () => {
    if (!postContent.trim()) return;

    const newPost = {
      userId: userInfo.id,
      content: postContent.trim(),
      image: userInfo.image,
      createdAt: new Date(),
    };

    console.log(newPost);

    if (socket) {
      socket.emit("newPost", newPost);
    } else {
      console.error("Socket is not connected!");
    }

    setPostContent("");
  };

  // ✅ Prevents multiple sends on Enter key hold
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendPost();
    }
  };

  const handleAddEmoji = (emoji) => {
    setPostContent((msg) => msg + emoji.emoji);
    setEmojiPickerOpen(false);
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5 relative">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:outline-none"
          placeholder="What's on your mind?"
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
          className="text-neutral-500 hover:text-white transition-all"
        >
          <RiEmojiStickerLine className="text-2xl" />
        </button>

        {emojiPickerOpen && (
          <div
            className="absolute bottom-16 right-10 bg-[#2a2b33] p-2 rounded-md"
            ref={emojiRef}
          >
            <EmojiPicker theme="dark" onEmojiClick={handleAddEmoji} />
          </div>
        )}
      </div>
      <button
        onClick={handleSendPost}
        disabled={!postContent.trim()}
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] transition-all disabled:opacity-50"
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default PostBar;
