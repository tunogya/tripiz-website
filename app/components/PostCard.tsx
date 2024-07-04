'use client';

import Link from "next/link";
import { FC } from "react"

const PostCard: FC<{ event: any }> = ({ event }) => {
  const category =
    event?.tags?.find((tag: any[]) => tag?.[0] === "category")?.[1] ||
    "reflections";

  return (
    <Link href={`/events/${event.id}`} className="w-full space-y-2 hover:bg-[#181818] p-2 rounded-lg" prefetch>
      <div className={`${category === "reflections" ? "" : category === "dreams" ? "rounded-full" : "rounded-3xl"} overflow-hidden`}>
        <img src={`https://tripiz.abandon.ai/api/autoglyphs?hash=0x${event.id}`} alt={""} width={240} height={240} />
      </div>
      <div className="line-clamp-2 text-[#A7A7A7] text-sm">
        {event.content}
      </div>
    </Link>
  )
}

export default PostCard