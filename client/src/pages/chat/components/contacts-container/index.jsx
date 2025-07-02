import { useEffect } from "react";
import ProfileInfo from "./component/profile-info";
import NewDM from "./component/new-dm";
import CreateChannel from "./component/create-channel";
import ContactList from "@/components/contactList";
import { apiClient } from "@/lib/api-client";
import {
  GET_DM_CONTACTS_ROUTES,
  GET_USER_CHANNELS_ROUTES,
} from "@/utils/constants";
import { useAppStore } from "@/store";
import { Avatar } from "@radix-ui/react-avatar";

const ContactsContainer = () => {
  const {
    directMessagesContacts,
    setDirectMessagesContacts,
    channels,
    setChannels,
  } = useAppStore();

  useEffect(() => {
    const fetchContactsAndChannels = async () => {
      try {
        const [contactsRes, channelsRes] = await Promise.all([
          apiClient.get(GET_DM_CONTACTS_ROUTES, { withCredentials: true }),
          apiClient.get(GET_USER_CHANNELS_ROUTES, { withCredentials: true }),
        ]);

        if (contactsRes.data.contacts) {
          setDirectMessagesContacts(contactsRes.data.contacts);
        }
        if (channelsRes.data.channels) {
          setChannels(channelsRes.data.channels);
        }
      } catch (err) {
        console.error("Error fetching contacts or channels", err);
      }
    };

    fetchContactsAndChannels();
  }, [setDirectMessagesContacts, setChannels]);

  return (
    <div className="w-full md:w-[35vw] lg:w-[30vw] xl:w-[20vw] relative h-screen bg-[#1b1c24] border-r-2 border-[#2f303b] flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#8338ec] scrollbar-track-transparent">
        <div className="pt-3">
          <Logo />
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Direct Messages" />
            <NewDM />
          </div>
          <div className="max-h-[38vh] overflow-y-auto">
            <ContactList contacts={directMessagesContacts} />
          </div>
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Channels" />
            <CreateChannel />
          </div>
          <div className="max-h-[38vh] overflow-y-auto">
            <ContactList contacts={channels} isChannel={true} />
          </div>
        </div>
        <div className="my-5">
          <div className="flex items-center justify-between pr-10">
            <Title text="Chat With AI" />
          </div>
          <div className="max-h-[38vh] overflow-y-auto mt-5">
            <AIContact />
          </div>
        </div>
        <div className="my-5 mb-20">
          <div className="flex items-center justify-between pr-10">
            <Title text="Swift Post" />
          </div>
          <div className="max-h-[38vh] overflow-y-auto mt-5">
            <SwiftPost />
          </div>
        </div>
      </div>

      {/* Separate ProfileInfo from the scrollable section */}
      <div className="shrink-0">
        <ProfileInfo />
      </div>
    </div>
  );
};

export default ContactsContainer;

const SwiftPost = () => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const postData = {
    _id: "swift-post-1",
    name: "Swift Post",
    color: "#e67e22",
  };

  const handleClick = () => {
    setSelectedChatType("post");
    setSelectedChatData(postData);
    if (!selectedChatData || selectedChatData._id !== postData._id) {
      setSelectedChatMessages([]);
    }
  };

  const isSelected = selectedChatData?._id === postData._id;

  return (
    <div
      className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
        isSelected ? "bg-[#e67e22] hover:bg-[#e67e22]" : "hover:bg-[#f1f1f111]"
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-5 items-center text-neutral-300">
        <Avatar className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center text-xl text-white">
          <PostLogo />
        </Avatar>
        <span>Swift Post</span>
      </div>
    </div>
  );
};

const PostLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5 text-neutral-400"
  >
    <path d="M4 4h16v16H4z" />
    <path d="M8 10h8M8 14h5M15 4v2M9 4v2M4 8h16" />
    <path d="M16 21l5-5-2-2-5 5v2h2z" />
  </svg>
);

const AIContact = () => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const aiContact = {
    _id: "ai-bot-1",
    name: "Swift AI",
    color: "#975aed",
  };

  const handleClick = () => {
    setSelectedChatType("ai");
    setSelectedChatData(aiContact);
    if (!selectedChatData || selectedChatData._id !== aiContact._id) {
      setSelectedChatMessages([]);
    }
  };

  const isSelected = selectedChatData?._id === aiContact._id;

  return (
    <div
      className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
        isSelected ? "bg-[#8417ff] hover:bg-[#8417ff]" : "hover:bg-[#f1f1f111]"
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-5 items-center text-neutral-300">
        <Avatar className="h-10 w-10 rounded-full bg-purple-700 flex items-center justify-center text-xl text-white">
          🤖
        </Avatar>
        <span>Swift AI</span>
      </div>
    </div>
  );
};

const Logo = () => (
  <div className="flex p-5 items-center gap-2">
    <svg
      id="logo-38"
      width="78"
      height="32"
      viewBox="0 0 78 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z" fill="#8338ec" />
      <path d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z" fill="#975aed" />
      <path d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z" fill="#a16ee8" />
    </svg>
    <span className="text-3xl font-semibold">Swift</span>
  </div>
);

const Title = ({ text }) => (
  <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
    {text}
  </h6>
);
