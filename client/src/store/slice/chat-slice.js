export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,

  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) =>
    set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  addAiMessage: (aiResponseText) => {
    const selectedChatMessages = get().selectedChatMessages;
    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          messageType: "text",
          content: aiResponseText, // this will be the text response from AI
          sender: {
            _id: "AI",
            firstName: "AI",
            lastName: "",
            email: "ai@chatbot.com",
            image: "",
            color: "bg-purple-500", // You can use any color
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });
  },

  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),

  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : typeof message.recipient === "object"
              ? message.recipient._id
              : message.recipient,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : typeof message.sender === "object"
              ? message.sender._id
              : message.sender,
        },
      ],
    });
  },

  addChannelInChannelList: (message) => {
    const channel = get().channels;
    const data = channel.find((channel) => channel._id === message.channelId);
    const index = channel.findIndex(
      (channel) => channel._id === message.channelId
    );
    if (index !== -1 && index !== undefined) {
      channel.splice(index, 1);
      channel.unshift(data);
    }
  },

  addContactsInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const formId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;
    const formData =
      message.sender._id === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contacts) => contacts._id === formId);
    const index = dmContacts.findIndex((contacts) => contacts._id === formId);

    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      dmContacts.unshift(formData);
    }
    set({ directMessagesContacts: dmContacts });
  },
});
