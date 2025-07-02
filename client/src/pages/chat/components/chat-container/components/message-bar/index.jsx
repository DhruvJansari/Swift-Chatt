import { useSocket } from "@/context/SocketContext.jsx";
import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import { UPLOAD_FILES_ROUTES } from "@/utils/constants";
import EmojiPicker from "emoji-picker-react";
import { useEffect, useRef, useState } from "react";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import { RiEmojiStickerLine } from "react-icons/ri";
import { chatWithAi } from "@/utils/chatService";
import { toast } from "sonner"; // ✅ Import toast

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const socket = useSocket();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
    addMessage,
    addAiMessage,
  } = useAppStore();

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
    setEmojiPickerOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    try {
      if (selectedChatType === "contacts") {
        socket.emit("sendMessage", {
          sender: userInfo.id,
          content: message.trim(),
          recipient: selectedChatData._id,
          messageType: "text",
        });
        toast.success("Message sent.");
      } else if (selectedChatType === "channel") {
        socket.emit("send-channel-message", {
          sender: userInfo.id,
          recipient: selectedChatData._id,
          content: message.trim(),
          messageType: "text",
          channelId: selectedChatData._id,
        });
        toast.success("Channel message sent.");
      } else if (selectedChatType === "ai") {
        addMessage({
          sender: { _id: userInfo.id, firstName: userInfo.firstName },
          content: message.trim(),
          messageType: "text",
          timestamp: new Date(),
        });
        setMessage("");
        setLoading(true);
        try {
          const botResponse = await chatWithAi(message.trim());
          addAiMessage({ content: botResponse });
        } catch (err) {
          toast.error("Failed to get AI response.");
          console.error("AI chat error:", err);
        } finally {
          setLoading(false);
        }
        return;
      }
    } catch (err) {
      toast.error("Failed to send message.");
      console.error("Message send error:", err);
    }

    setMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSendMessage();
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      setIsUploading(true);

      const response = await apiClient.post(UPLOAD_FILES_ROUTES, formData, {
        withCredentials: true,
        onUploadProgress: (data) =>
          setFileUploadProgress(Math.round((100 * data.loaded) / data.total)),
      });

      if (response.status === 200 && response.data) {
        if (selectedChatType === "contacts") {
          socket.emit("sendMessage", {
            sender: userInfo.id,
            messageType: "file",
            recipient: selectedChatData._id,
            fileUrl: response.data.filePath,
          });
        } else if (selectedChatType === "channel") {
          socket.emit("send-channel-message", {
            sender: userInfo.id,
            messageType: "file",
            fileUrl: response.data.filePath,
            channelId: selectedChatData._id,
          });
        }
        toast.success("File uploaded and sent.");
      }
      setIsUploading(false);
      event.target.value = ""; // clear input
    } catch (error) {
      toast.error("File upload failed.");
      console.error("File upload error:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:outline-none"
          placeholder={loading ? "AI is typing..." : "Enter message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        {selectedChatType !== "ai" && (
          <button
            className="text-neutral-500 hover:text-white transition-all"
            onClick={handleAttachmentClick}
            disabled={loading}
          >
            <GrAttachment className="text-2xl" />
          </button>
        )}
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
            className="text-neutral-500 hover:text-white transition-all"
            disabled={loading}
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          {emojiPickerOpen && (
            <div className="absolute bottom-16 right-0" ref={emojiRef}>
              <EmojiPicker
                theme="dark"
                open={emojiPickerOpen}
                onEmojiClick={handleAddEmoji}
                autoFocusSearch={false}
              />
            </div>
          )}
        </div>
      </div>
      <button
        onClick={handleSendMessage}
        disabled={loading || !message.trim()}
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 hover:bg-[#741bda] transition-all disabled:opacity-50"
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
