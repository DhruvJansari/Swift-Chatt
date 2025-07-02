import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

const ContactList = ({ contacts, isChannel = false }) => {
  const {
    selectedChatData,
    selectedChatType,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contacts) => {
    if (isChannel) setSelectedChatType("channel");
    else setSelectedChatType("contacts");
    setSelectedChatData(contacts);
    if (selectedChatData && selectedChatData._id !== contacts._id) {
      setSelectedChatMessages([]);
    }
  };
  return (
    <div className=" mt-5">
      {contacts.map((contacts) => (
        <div
          key={contacts._id}
          className={` pl-10 py-2 transition-all duration-300 cursor-pointer ${
            selectedChatData && selectedChatData._id === contacts._id
              ? "bg-[#8417ff] hover:bg-[#8417ff]"
              : " hover:bg-[#f1f1f111]"
          }`}
          onClick={() => handleClick(contacts)}
        >
          <div className=" flex gap-5 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden">
                {contacts.image ? (
                  <AvatarImage
                    src={`${HOST}/${contacts.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black rounded-full"
                  />
                ) : (
                  <div
                    className={`
                        ${
                          selectedChatData &&
                          selectedChatData._id === contacts._id
                            ? "bg-[ffffff22] border border-white/70"
                            : getColor(contacts.color)
                        }
                        uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full`}
                  >
                    {contacts.firstName
                      ? contacts.firstName.split("").shift()
                      : contacts.email.split("").shift()}
                  </div>
                )}
              </Avatar>
            )}
            {isChannel && (
              <div className=" bg-[#ffffff22] h-10 w-10 flex items-center justify-center rounded-full">
                #
              </div>
            )}
            {isChannel ? (
              <span>{contacts.name}</span>
            ) : (
              <span>
                {contacts.firstName
                  ? `${contacts.firstName} ${contacts.lastName}`
                  : contacts.email}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
