import { RiCloseFill } from "react-icons/ri";
import { useAppStore } from "@/store";

const PostHeader = () => {
  const { closeChat } = useAppStore();

  return (
    <div className="h-[10vh] border-b-2 border-[#2f303b] flex items-center justify-between px-20">
      <div className="flex gap-5 items-center w-full justify-between">
        <div className="flex gap-3 items-center justify-center">
          <div className="bg-[#ffffff22] h-12 w-12 flex items-center justify-center rounded-full text-white text-2xl">
            📝
          </div>
          <div className="text-white text-base font-semibold">Swift Post</div>
        </div>
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={closeChat}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          >
            <RiCloseFill className="text-3xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
