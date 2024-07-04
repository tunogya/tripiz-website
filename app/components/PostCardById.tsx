'use client';

import { db } from "@/utils/db.model";
import { useLiveQuery } from "dexie-react-hooks";
import { FC, useEffect } from "react"
import { useWebSocket } from "./WebSocketProvider";
import { v4 as uuidv4 } from 'uuid';

const PostCardById: FC<{ id: string }> = ({ id }) => {
  const {send} = useWebSocket();
  const event = useLiveQuery(() => db.events
    .where("id")
    .equals(id)
    .first(), [id]
  )

  const category =
    event?.tags?.find((tag: any[]) => tag?.[0] === "category")?.[1] ||
    "reflections";

  useEffect(() => {
    if (!event) {
      send(JSON.stringify([
        "REQ",
        uuidv4(),
        {
          ids: [id],
          kinds: [1],
          limit: 1,
        }
      ]));
    }
  }, [event]);

  return (
    <div className="w-full space-y-2 pb-3">
      <div className={`${category === "reflections" ? "" : category === "dreams" ? "rounded-full" : "rounded-3xl"} overflow-hidden`}>
        <img src={`https://tripiz.abandon.ai/api/autoglyphs?hash=0x${id}`} alt={""} width={240} height={240} />
      </div>
      <div className="line-clamp-2 text-[#A7A7A7] text-sm">
        {event?.content}
      </div>
    </div>
  )
}

export default PostCardById