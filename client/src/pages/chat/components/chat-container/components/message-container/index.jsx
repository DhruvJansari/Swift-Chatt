import { apiClient } from "@/lib/api-client";
import { useAppStore } from "@/store";
import {
  GET_ALL_MESSAGES_ROUTES,
  GET_CHANNEL_MESSAGES,
  HOST,
} from "@/utils/constants";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MdFolderZip } from "react-icons/md";
import { IoMdArrowDown } from "react-icons/io";
import { IoCloseSharp } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { chatWithAi } from "@/utils/chatService";
import { getColor } from "@/lib/utils";

const MessageContainer = () => {
  const scrollRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    selectedChatMessages,
    setSelectedChatMessages,
    setIsDownloading,
    setFileDownloadProgress,
    addAiMessage,
  } = useAppStore();

  const [showImage, setShowImage] = useState(false);
  const [imageURL, setImageURL] = useState(null);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const response = await apiClient.post(
          GET_ALL_MESSAGES_ROUTES,
          { id: selectedChatData._id },
          { withCredentials: true }
        );
        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getChannelMessages = async () => {
      try {
        const response = await apiClient.get(
          `${GET_CHANNEL_MESSAGES}/${selectedChatData._id}`,
          { withCredentials: true }
        );

        if (response.data.messages) {
          setSelectedChatMessages(response.data.messages);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (selectedChatData._id) {
      if (selectedChatType === "contacts") getMessages();
      else if (selectedChatType === "channel") getChannelMessages();
    }
  }, [selectedChatData, selectedChatType, setSelectedChatMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [selectedChatMessages]);

  // useEffect(() => {
  //   const fetchAiResponse = async () => {
  //     if (selectedChatType === "ai" && selectedChatMessages.length > 0) {
  //       const lastMessage =
  //         selectedChatMessages[selectedChatMessages.length - 1];
  //       if (lastMessage.sender._id !== "AI") {
  //         try {
  //           const aiResponse = await chatWithAi(lastMessage.content);
  //           if (aiResponse) {
  //             addAiMessage({
  //               content: aiResponse,
  //               timestamp: new Date(),
  //               sender: { _id: "AI" },
  //               messageType: "text",
  //             });
  //           }
  //         } catch (error) {
  //           console.error("AI response error:", error);
  //         }
  //       }
  //     }
  //   };

  //   fetchAiResponse();
  // }, [selectedChatMessages, selectedChatType, addAiMessage]);

  const checkIfImage = (filePath) => {
    return /\.(jpg|jpeg|png|gif|bmp|tiff|tif|webp|svg|ico|heic|heif)$/i.test(
      filePath
    );
  };

  const downloadFile = async (url) => {
    setIsDownloading(true);
    setFileDownloadProgress(0);
    try {
      const response = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setFileDownloadProgress(percentCompleted);
        },
      });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", url.split("/").pop());
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setIsDownloading(false);
      setFileDownloadProgress(0);
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    return selectedChatMessages.map((message, index) => {
      const messageDate = moment(message.timestamp).format("YYYY-MM-DD");
      const showDate = messageDate !== lastDate;
      lastDate = messageDate;

      return (
        <div key={index}>
          {showDate && (
            <div className="text-center text-gray-500 my-2">
              {moment(message.timestamp).format("LL")}
            </div>
          )}
          {selectedChatType === "contacts" && renderDMMessages(message)}
          {selectedChatType === "channel" &&
            renderChannelMessages(message, selectedChatType)}
          {selectedChatType === "ai" &&
            renderChannelMessages(message, selectedChatType)}
        </div>
      );
    });
  };

  const renderDMMessages = (message) => (
    <div
      className={`${
        message.sender === selectedChatData._id ? "text-left" : "text-right"
      }`}
    >
      {message.messageType === "text" && (
        <div
          className={`${
            message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/50 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
          } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
        >
          {message.content}
        </div>
      )}
      {message.messageType === "file" && renderFileMessage(message)}
      <div className="text-xs text-gray-600">
        {moment(message.timestamp).format("LT")}
      </div>
    </div>
  );

  const renderFileMessage = (message) => {
    console.log("message : ", message);
    console.log("selectedchat data:", selectedChatData);
    return (
      <div
        className={`${
          selectedChatType === "contacts"
            ? message.sender !== selectedChatData._id
              ? "bg-[#8417ff]/50 text-[#8417ff]/90 border-[#8417ff]/50"
              : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            : message.sender._id === userInfo.id
            ? "bg-[#8417ff]/50 text-[#8417ff]/90 border-[#8417ff]/50"
            : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
        } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
      >
        {checkIfImage(message.fileUrl) ? (
          <img
            onClick={() => {
              setShowImage(true);
              setImageURL(message.fileUrl);
            }}
            src={`${HOST}/${message.fileUrl}`}
            height={300}
            width={300}
            className="cursor-pointer"
          />
        ) : (
          <div className="flex items-center gap-4">
            <span className="text-3xl bg-black/20 rounded-full p-3">
              <MdFolderZip />
            </span>
            <span>{message.fileUrl.split("/").pop()}</span>
            <span
              onClick={() => downloadFile(message.fileUrl)}
              className="bg-black/20 p-3 text-2xl rounded-full hover:bg-black/50 cursor-pointer"
            >
              <IoMdArrowDown />
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderChannelMessages = (messages, selectedChatType) => {
    let message = false;
    let isUserMessage = false;
    if (selectedChatType === "channel") {
      isUserMessage = messages.sender?._id === userInfo?.id;
    } else {
      isUserMessage = messages.sender?._id === userInfo?.id;
      message = messages.content.content;
    }

    const isAiMessage = messages.sender?._id === "AI";

    console.log("selectedchattype :", selectedChatType);
    console.log("message", messages);
    console.log("isUserMessage", isUserMessage);

    return (
      <div
        className={`mt-5 ${
          selectedChatType === "channel"
            ? isUserMessage
              ? "text-right"
              : "text-left"
            : isAiMessage
            ? "text-left"
            : "text-right"
        }`}
      >
        {isAiMessage && (
          <div className="text-xs text-purple-400 mb-1">AI Assistant</div>
        )}
        {messages.messageType === "text" && (
          <div
            className={`${
              isAiMessage
                ? "bg-gradient-to-r from-purple-500/30 to-purple-700/30 text-purple-200 border-purple-500/20"
                : isUserMessage
                ? "bg-[#8417ff]/50 text-[#8417ff]/90 border-[#8417ff]/50"
                : "bg-[#2a2b33]/5 text-white/80 border-[#ffffff]/20"
            } border inline-block p-4 rounded my-1 max-w-[50%] break-words`}
          >
            <div>{isAiMessage ? message : messages.content}</div>
            {/* {console.log(typeof message.content)} */}
          </div>
        )}
        {messages.messageType === "file" && renderFileMessage(messages)}
        {!isUserMessage && selectedChatType !== "ai" && (
          <div className="flex items-center gap-3 mt-2">
            <Avatar className="h-8 w-8 rounded-full overflow-hidden">
              {messages.sender.image ? (
                <AvatarImage
                  src={`${HOST}/${messages.sender?.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              ) : (
                <div
                  className={`uppercase h-8 w-8 text-sm font-medium border flex items-center justify-center rounded-full ${getColor(
                    selectedChatData.color
                  )}`}
                >
                  {messages.sender.firstName
                    ? messages.sender.firstName.charAt(0)
                    : messages.sender.email.charAt(0)}
                </div>
              )}
            </Avatar>
            <span className="text-sm text-white/60">
              {`${messages.sender?.firstName ?? ""} ${
                messages.sender?.lastName ?? ""
              }`}
            </span>
            <span className="text-xs text-white/60">
              {moment(messages.timestamp).format("LT")}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 px-8 w-full">
      {renderMessages()}
      <div ref={scrollRef} />
      {showImage && (
        <div className="fixed z-[1000] top-0 left-0 h-screen w-screen flex items-center justify-center backdrop-blur-lg">
          <img
            src={`${HOST}/${imageURL}`}
            className="h-[80vh] object-contain"
          />
          <div className="absolute top-5 right-5 flex gap-4">
            <button
              onClick={() => downloadFile(imageURL)}
              className="bg-black/40 p-3 text-2xl rounded-full hover:bg-black/70 cursor-pointer"
            >
              <IoMdArrowDown />
            </button>
            <button
              onClick={() => {
                setShowImage(false);
                setImageURL(null);
              }}
              className="bg-black/40 p-3 text-2xl rounded-full hover:bg-black/70 cursor-pointer"
            >
              <IoCloseSharp />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageContainer;
