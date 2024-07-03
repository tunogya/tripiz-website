import { FC } from "react"

const PostCard: FC<{ event: any }> = ({ event }) => {
  const category =
    event?.tags?.find((tag: any[]) => tag?.[0] === "category")?.[1] ||
    "reflections";

  return (
    <div className="w-full space-y-2 pb-3">
      <div className={`${category === "reflections" ? "" : category === "dreams" ? "rounded-full" : "rounded-xl"} overflow-hidden`}>
        <img src={`https://tripiz.abandon.ai/api/autoglyphs?hash=0x${event.id}`} alt={""} width={240} height={240} />
      </div>
      <div className="line-clamp-2 text-[#A7A7A7] text-sm">
        {event.content}
      </div>
    </div>
  )
}

export default PostCard